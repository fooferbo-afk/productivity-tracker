"""
Sessions router.

CRUD operations for session management and aggregations.
"""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_validator import get_current_therapist
from app.database import get_db
from app.models.therapist import Therapist
from app.models.session import Session
from app.schemas.session import (
    SessionCreate,
    SessionListResponse,
    SessionResponse,
    SessionSummaryResponse,
    SessionUpdate,
)
from app.services.session_service import SessionService

router = APIRouter()


def _build_session_response(session: Session) -> SessionResponse:
    """Helper to properly build SessionResponse from a Session model."""
    return SessionResponse(
        id=session.id,
        therapist_id=session.therapist_id,
        facility_id=session.facility_id,
        session_date=session.session_date,
        start_time=session.start_time,
        end_time=session.end_time,
        productivity_percentage=session.productivity_percentage,
        notes=session.notes,
        total_treatment_minutes=session.total_treatment_minutes or 0,
        lunch_minutes=session.lunch_minutes or 0,
        created_at=session.created_at,
        updated_at=session.updated_at,
        facility_name=session.facility.name if session.facility else None,
        duration_minutes=session.duration_minutes,
    )


@router.get(
    "",
    response_model=SessionListResponse,
    summary="List sessions",
    description="Returns sessions for the authenticated therapist with optional filters.",
)
async def list_sessions(
    facility_id: Optional[str] = Query(None, description="Filter by facility ID"),
    date_from: Optional[date] = Query(
        None, description="Filter sessions from this date (inclusive)"
    ),
    date_to: Optional[date] = Query(
        None, description="Filter sessions to this date (inclusive)"
    ),
    limit: int = Query(100, ge=1, le=500, description="Maximum results to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> SessionListResponse:
    """
    List sessions with optional filtering and pagination.
    
    Sessions are returned in descending date order (most recent first).
    """
    service = SessionService(db)
    sessions, total = await service.list_for_therapist(
        therapist_id=current_therapist.id,
        facility_id=facility_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )

    return SessionListResponse(
        sessions=[_build_session_response(s) for s in sessions],
        total=total,
    )


@router.get(
    "/summary",
    response_model=SessionSummaryResponse,
    summary="Get session summary",
    description="Returns aggregate statistics for sessions.",
)
async def get_session_summary(
    facility_id: Optional[str] = Query(None, description="Filter by facility ID"),
    date_from: Optional[date] = Query(
        None, description="Filter sessions from this date (inclusive)"
    ),
    date_to: Optional[date] = Query(
        None, description="Filter sessions to this date (inclusive)"
    ),
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> SessionSummaryResponse:
    """
    Get aggregate statistics for sessions.
    
    Returns total sessions, total hours, average hours, and average productivity.
    Filters can be applied to narrow the scope.
    """
    service = SessionService(db)
    return await service.get_summary(
        therapist_id=current_therapist.id,
        facility_id=facility_id,
        date_from=date_from,
        date_to=date_to,
    )


@router.post(
    "",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create session",
    description="Creates a new session for the authenticated therapist.",
)
async def create_session(
    data: SessionCreate,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    """
    Create a new session.
    
    The session will be associated with the authenticated therapist.
    The facility must belong to the therapist.
    """
    service = SessionService(db)

    # Validate facility ownership
    if not await service.validate_facility_ownership(
        data.facility_id, current_therapist.id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Facility not found or doesn't belong to you",
        )

    session = await service.create(
        therapist_id=current_therapist.id,
        data=data,
    )

    return _build_session_response(session)


@router.get(
    "/{session_id}",
    response_model=SessionResponse,
    summary="Get session",
    description="Returns a specific session by ID.",
)
async def get_session(
    session_id: str,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    """
    Get a specific session by ID.
    
    Returns 404 if the session doesn't exist or doesn't belong to the therapist.
    """
    service = SessionService(db)
    session = await service.get_by_id(
        session_id=session_id,
        therapist_id=current_therapist.id,
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    return _build_session_response(session)


@router.put(
    "/{session_id}",
    response_model=SessionResponse,
    summary="Update session",
    description="Updates a session's details.",
)
async def update_session(
    session_id: str,
    update_data: SessionUpdate,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    """
    Update a session.
    
    Only the session owner can update it.
    If changing facility, the new facility must belong to the therapist.
    """
    service = SessionService(db)
    session = await service.get_by_id(
        session_id=session_id,
        therapist_id=current_therapist.id,
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # Validate new facility ownership if changing
    if update_data.facility_id and update_data.facility_id != session.facility_id:
        if not await service.validate_facility_ownership(
            update_data.facility_id, current_therapist.id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Facility not found or doesn't belong to you",
            )

    updated_session = await service.update(session, update_data)

    return _build_session_response(updated_session)


@router.delete(
    "/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete session",
    description="Permanently deletes a session.",
)
async def delete_session(
    session_id: str,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a session.
    
    This action is permanent and cannot be undone.
    """
    service = SessionService(db)
    session = await service.get_by_id(
        session_id=session_id,
        therapist_id=current_therapist.id,
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    await service.delete(session)
