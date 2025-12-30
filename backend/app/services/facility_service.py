"""
Facility service.

Business logic for facility operations.
"""

from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.facility import Facility
from app.schemas.facility import FacilityCreate, FacilityUpdate


class FacilityService:
    """Service class for facility-related operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(
        self,
        facility_id: str,
        therapist_id: str,
    ) -> Optional[Facility]:
        """
        Get a facility by ID, ensuring ownership.
        
        Args:
            facility_id: The facility's UUID
            therapist_id: The requesting therapist's ID (for ownership check)
            
        Returns:
            Facility if found and owned by therapist, None otherwise
        """
        result = await self.db.execute(
            select(Facility).where(
                Facility.id == facility_id,
                Facility.therapist_id == therapist_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_for_therapist(
        self,
        therapist_id: str,
        include_archived: bool = False,
    ) -> tuple[list[Facility], int]:
        """
        List all facilities for a therapist.
        
        Args:
            therapist_id: The therapist's ID
            include_archived: Whether to include archived facilities
            
        Returns:
            Tuple of (list of facilities, total count)
        """
        query = select(Facility).where(Facility.therapist_id == therapist_id)

        if not include_archived:
            query = query.where(Facility.is_archived == False)

        query = query.order_by(Facility.name)

        result = await self.db.execute(query)
        facilities = list(result.scalars().all())

        # Get total count
        count_query = select(func.count(Facility.id)).where(
            Facility.therapist_id == therapist_id
        )
        if not include_archived:
            count_query = count_query.where(Facility.is_archived == False)

        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        return facilities, total

    async def create(
        self,
        therapist_id: str,
        data: FacilityCreate,
    ) -> Facility:
        """
        Create a new facility.
        
        Args:
            therapist_id: The owning therapist's ID
            data: Facility creation data
            
        Returns:
            Created facility
        """
        facility = Facility(
            therapist_id=therapist_id,
            name=data.name,
            location=data.location,
        )
        self.db.add(facility)
        await self.db.flush()
        return facility

    async def update(
        self,
        facility: Facility,
        update_data: FacilityUpdate,
    ) -> Facility:
        """
        Update a facility.
        
        Args:
            facility: The facility to update
            update_data: Fields to update
            
        Returns:
            Updated facility
        """
        update_dict = update_data.model_dump(exclude_unset=True)

        for field, value in update_dict.items():
            setattr(facility, field, value)

        await self.db.flush()
        return facility

    async def archive(self, facility: Facility) -> Facility:
        """
        Archive a facility (soft delete).
        
        Args:
            facility: The facility to archive
            
        Returns:
            Archived facility
        """
        facility.is_archived = True
        await self.db.flush()
        return facility

    async def unarchive(self, facility: Facility) -> Facility:
        """
        Unarchive a previously archived facility.
        
        Args:
            facility: The facility to unarchive
            
        Returns:
            Unarchived facility
        """
        facility.is_archived = False
        await self.db.flush()
        return facility
