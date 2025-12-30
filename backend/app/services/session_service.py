"""
Session service.

Business logic for session operations and aggregations.
"""

from datetime import date, datetime, time
from decimal import Decimal
from typing import Optional

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.facility import Facility
from app.models.session import Session
from app.schemas.session import SessionCreate, SessionSummaryResponse, SessionUpdate


class SessionService:
    """Service class for session-related operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(
        self,
        session_id: str,
        therapist_id: str,
    ) -> Optional[Session]:
        """
        Get a session by ID, ensuring ownership.
        
        Args:
            session_id: The session's UUID
            therapist_id: The requesting therapist's ID (for ownership check)
            
        Returns:
            Session if found and owned by therapist, None otherwise
        """
        result = await self.db.execute(
            select(Session)
            .options(joinedload(Session.facility))
            .where(
                Session.id == session_id,
                Session.therapist_id == therapist_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_for_therapist(
        self,
        therapist_id: str,
        facility_id: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> tuple[list[Session], int]:
        """
        List sessions for a therapist with optional filters.
        
        Args:
            therapist_id: The therapist's ID
            facility_id: Optional facility filter
            date_from: Optional start date filter
            date_to: Optional end date filter
            limit: Maximum number of results
            offset: Pagination offset
            
        Returns:
            Tuple of (list of sessions, total count)
        """
        # Base query
        query = (
            select(Session)
            .options(joinedload(Session.facility))
            .where(Session.therapist_id == therapist_id)
        )

        # Apply filters
        if facility_id:
            query = query.where(Session.facility_id == facility_id)

        if date_from:
            query = query.where(Session.session_date >= date_from)

        if date_to:
            query = query.where(Session.session_date <= date_to)

        # Order by date descending (most recent first)
        query = query.order_by(Session.session_date.desc(), Session.start_time.desc())

        # Apply pagination
        query = query.limit(limit).offset(offset)

        result = await self.db.execute(query)
        sessions = list(result.scalars().all())

        # Get total count with same filters
        count_query = select(func.count(Session.id)).where(
            Session.therapist_id == therapist_id
        )

        if facility_id:
            count_query = count_query.where(Session.facility_id == facility_id)
        if date_from:
            count_query = count_query.where(Session.session_date >= date_from)
        if date_to:
            count_query = count_query.where(Session.session_date <= date_to)

        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        return sessions, total

    async def create(
        self,
        therapist_id: str,
        data: SessionCreate,
    ) -> Session:
        """
        Create a new session.
        
        Args:
            therapist_id: The owning therapist's ID
            data: Session creation data
            
        Returns:
            Created session
        """
        session = Session(
            therapist_id=therapist_id,
            facility_id=data.facility_id,
            session_date=data.session_date,
            start_time=data.start_time,
            end_time=data.end_time,
            productivity_percentage=data.productivity_percentage,
            notes=data.notes,
        )
        self.db.add(session)
        await self.db.flush()

        # Load facility relationship
        await self.db.refresh(session, ["facility"])

        return session

    async def update(
        self,
        session: Session,
        update_data: SessionUpdate,
    ) -> Session:
        """
        Update a session.
        
        Args:
            session: The session to update
            update_data: Fields to update
            
        Returns:
            Updated session
        """
        update_dict = update_data.model_dump(exclude_unset=True)

        for field, value in update_dict.items():
            setattr(session, field, value)

        await self.db.flush()

        # Reload facility if changed
        if "facility_id" in update_dict:
            await self.db.refresh(session, ["facility"])

        return session

    async def delete(self, session: Session) -> bool:
        """
        Delete a session.
        
        Args:
            session: The session to delete
            
        Returns:
            True if deleted successfully
        """
        await self.db.delete(session)
        await self.db.flush()
        return True

    async def get_summary(
        self,
        therapist_id: str,
        facility_id: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> SessionSummaryResponse:
        """
        Get aggregate statistics for sessions.
        
        Args:
            therapist_id: The therapist's ID
            facility_id: Optional facility filter
            date_from: Optional start date filter
            date_to: Optional end date filter
            
        Returns:
            Summary with totals and averages
        """
        # Build base conditions
        conditions = [Session.therapist_id == therapist_id]

        if facility_id:
            conditions.append(Session.facility_id == facility_id)
        if date_from:
            conditions.append(Session.session_date >= date_from)
        if date_to:
            conditions.append(Session.session_date <= date_to)

        # Get sessions for calculation
        query = select(Session).where(and_(*conditions))
        result = await self.db.execute(query)
        sessions = list(result.scalars().all())

        # Calculate aggregates
        total_sessions = len(sessions)

        if total_sessions == 0:
            return SessionSummaryResponse(
                total_sessions=0,
                total_hours=0.0,
                average_hours=0.0,
                average_productivity=0.0,
                date_range_start=date_from,
                date_range_end=date_to,
                facility_id=facility_id,
            )

        total_minutes = sum(s.duration_minutes for s in sessions)
        total_hours = total_minutes / 60

        total_productivity = sum(float(s.productivity_percentage) for s in sessions)
        average_productivity = total_productivity / total_sessions

        return SessionSummaryResponse(
            total_sessions=total_sessions,
            total_hours=round(total_hours, 2),
            average_hours=round(total_hours / total_sessions, 2),
            average_productivity=round(average_productivity, 2),
            date_range_start=date_from,
            date_range_end=date_to,
            facility_id=facility_id,
        )

    async def validate_facility_ownership(
        self,
        facility_id: str,
        therapist_id: str,
    ) -> bool:
        """
        Validate that a facility belongs to the therapist.
        
        Args:
            facility_id: The facility ID to validate
            therapist_id: The therapist's ID
            
        Returns:
            True if facility belongs to therapist
        """
        result = await self.db.execute(
            select(func.count(Facility.id)).where(
                Facility.id == facility_id,
                Facility.therapist_id == therapist_id,
            )
        )
        count = result.scalar() or 0
        return count > 0
