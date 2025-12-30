"""
Authentication router.

Handles user registration and profile management.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_validator import get_current_therapist
from app.database import get_db
from app.models.therapist import Therapist
from app.schemas.auth import TherapistResponse, TherapistUpdate
from app.services.therapist_service import TherapistService

router = APIRouter()


@router.post(
    "/register",
    response_model=TherapistResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register or get current user",
    description="Creates a therapist profile if it doesn't exist, or returns existing profile.",
)
async def register_or_get_therapist(
    current_therapist: Therapist = Depends(get_current_therapist),
) -> TherapistResponse:
    """
    Register a new therapist or return existing profile.
    
    The therapist is automatically created or retrieved based on the Firebase token.
    This endpoint is idempotent - calling it multiple times is safe.
    """
    return TherapistResponse.model_validate(current_therapist)


@router.get(
    "/me",
    response_model=TherapistResponse,
    summary="Get current user profile",
    description="Returns the authenticated therapist's profile.",
)
async def get_current_user(
    current_therapist: Therapist = Depends(get_current_therapist),
) -> TherapistResponse:
    """
    Get the current authenticated therapist's profile.
    """
    return TherapistResponse.model_validate(current_therapist)


@router.patch(
    "/me",
    response_model=TherapistResponse,
    summary="Update current user profile",
    description="Updates the authenticated therapist's profile.",
)
async def update_current_user(
    update_data: TherapistUpdate,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db),
) -> TherapistResponse:
    """
    Update the current authenticated therapist's profile.
    
    Currently only the name can be updated.
    """
    service = TherapistService(db)
    updated_therapist = await service.update(current_therapist, update_data)
    return TherapistResponse.model_validate(updated_therapist)
