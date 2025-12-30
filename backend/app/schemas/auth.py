"""
Authentication and therapist schemas.

Pydantic models for therapist creation, updates, and responses.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class TherapistBase(BaseModel):
    """Base therapist schema with common fields."""

    name: str = Field(..., min_length=1, max_length=255, description="Display name")
    email: EmailStr = Field(..., description="Email address")


class TherapistCreate(TherapistBase):
    """
    Schema for therapist registration.
    
    Note: firebase_uid is extracted from the JWT token, not provided by client.
    """

    pass


class TherapistUpdate(BaseModel):
    """Schema for updating therapist profile."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=255, description="Display name"
    )


class TherapistResponse(TherapistBase):
    """Schema for therapist response data."""

    id: str = Field(..., description="Unique identifier")
    role: str = Field(..., description="User role (therapist, manager)")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class TokenInfo(BaseModel):
    """Schema for decoded token information."""

    uid: str = Field(..., description="Firebase user ID")
    email: Optional[str] = Field(None, description="User email")
    name: Optional[str] = Field(None, description="User display name")
