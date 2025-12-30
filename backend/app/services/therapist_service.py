"""
Therapist service.

Business logic for therapist operations.
"""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.therapist import Therapist
from app.schemas.auth import TherapistUpdate


class TherapistService:
    """Service class for therapist-related operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, therapist_id: str) -> Optional[Therapist]:
        """
        Get a therapist by ID.
        
        Args:
            therapist_id: The therapist's UUID
            
        Returns:
            Therapist if found, None otherwise
        """
        result = await self.db.execute(
            select(Therapist).where(Therapist.id == therapist_id)
        )
        return result.scalar_one_or_none()

    async def get_by_firebase_uid(self, firebase_uid: str) -> Optional[Therapist]:
        """
        Get a therapist by Firebase UID.
        
        Args:
            firebase_uid: The Firebase authentication UID
            
        Returns:
            Therapist if found, None otherwise
        """
        result = await self.db.execute(
            select(Therapist).where(Therapist.firebase_uid == firebase_uid)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        firebase_uid: str,
        email: str,
        name: str,
    ) -> Therapist:
        """
        Create a new therapist.
        
        Args:
            firebase_uid: Firebase authentication UID
            email: User's email
            name: Display name
            
        Returns:
            Created therapist
        """
        therapist = Therapist(
            firebase_uid=firebase_uid,
            email=email,
            name=name,
        )
        self.db.add(therapist)
        await self.db.flush()
        return therapist

    async def update(
        self,
        therapist: Therapist,
        update_data: TherapistUpdate,
    ) -> Therapist:
        """
        Update a therapist's profile.
        
        Args:
            therapist: The therapist to update
            update_data: Fields to update
            
        Returns:
            Updated therapist
        """
        update_dict = update_data.model_dump(exclude_unset=True)

        for field, value in update_dict.items():
            setattr(therapist, field, value)

        await self.db.flush()
        return therapist
