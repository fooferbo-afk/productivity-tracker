"""
Facilities router.

CRUD operations for facility management.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_validator import get_current_therapist
from app.database import get_db
from app.models.therapist import Therapist
from app.schemas.facility import (
    FacilityCreate,
    FacilityListResponse,
    FacilityResponse,
    FacilityUpdate,
)
from app.services.facility_service import FacilityService

router = APIRouter()


@router.get(
    "",
    response_model=FacilityListResponse,
    summary="List facilities",
    description="Returns all facilities for the authenticated therapist.",
)
async def list_facilities(
    include_archived: bool = Query(
        False, description="Include archived facilities in the list"
    ),
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> FacilityListResponse:
    """
    List all facilities for the current therapist.
    
    By default, archived facilities are hidden. Set include_archived=true to show them.
    """
    service = FacilityService(db)
    facilities, total = await service.list_for_therapist(
        therapist_id=current_therapist.id,
        include_archived=include_archived,
    )

    return FacilityListResponse(
        facilities=[FacilityResponse.model_validate(f) for f in facilities],
        total=total,
        include_archived=include_archived,
    )


@router.post(
    "",
    response_model=FacilityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create facility",
    description="Creates a new facility for the authenticated therapist.",
)
async def create_facility(
    data: FacilityCreate,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> FacilityResponse:
    """
    Create a new facility.
    
    The facility will be associated with the authenticated therapist.
    """
    service = FacilityService(db)
    facility = await service.create(
        therapist_id=current_therapist.id,
        data=data,
    )

    return FacilityResponse.model_validate(facility)


@router.get(
    "/{facility_id}",
    response_model=FacilityResponse,
    summary="Get facility",
    description="Returns a specific facility by ID.",
)
async def get_facility(
    facility_id: str,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> FacilityResponse:
    """
    Get a specific facility by ID.
    
    Returns 404 if the facility doesn't exist or doesn't belong to the therapist.
    """
    service = FacilityService(db)
    facility = await service.get_by_id(
        facility_id=facility_id,
        therapist_id=current_therapist.id,
    )

    if facility is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found",
        )

    return FacilityResponse.model_validate(facility)


@router.put(
    "/{facility_id}",
    response_model=FacilityResponse,
    summary="Update facility",
    description="Updates a facility's name and/or location.",
)
async def update_facility(
    facility_id: str,
    update_data: FacilityUpdate,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> FacilityResponse:
    """
    Update a facility.
    
    Only the facility owner can update it.
    """
    service = FacilityService(db)
    facility = await service.get_by_id(
        facility_id=facility_id,
        therapist_id=current_therapist.id,
    )

    if facility is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found",
        )

    updated_facility = await service.update(facility, update_data)
    return FacilityResponse.model_validate(updated_facility)


@router.post(
    "/{facility_id}/archive",
    response_model=FacilityResponse,
    summary="Archive facility",
    description="Archives a facility (soft delete). Archived facilities are hidden from pickers.",
)
async def archive_facility(
    facility_id: str,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> FacilityResponse:
    """
    Archive a facility.
    
    Archived facilities are hidden from default lists and pickers,
    but can still be viewed with include_archived=true.
    Sessions associated with archived facilities are preserved.
    """
    service = FacilityService(db)
    facility = await service.get_by_id(
        facility_id=facility_id,
        therapist_id=current_therapist.id,
    )

    if facility is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found",
        )

    archived_facility = await service.archive(facility)
    return FacilityResponse.model_validate(archived_facility)


@router.post(
    "/{facility_id}/unarchive",
    response_model=FacilityResponse,
    summary="Unarchive facility",
    description="Restores an archived facility.",
)
async def unarchive_facility(
    facility_id: str,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> FacilityResponse:
    """
    Unarchive a previously archived facility.
    
    The facility will appear in default lists again.
    """
    service = FacilityService(db)
    facility = await service.get_by_id(
        facility_id=facility_id,
        therapist_id=current_therapist.id,
    )

    if facility is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found",
        )

    unarchived_facility = await service.unarchive(facility)
    return FacilityResponse.model_validate(unarchived_facility)
