"""
Facility schemas.

Pydantic models for facility CRUD operations.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FacilityBase(BaseModel):
    """Base facility schema with common fields."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Facility name",
    )
    location: Optional[str] = Field(
        None,
        max_length=500,
        description="Facility location (address or description)",
    )


class FacilityCreate(FacilityBase):
    """Schema for creating a new facility."""

    pass


class FacilityUpdate(BaseModel):
    """Schema for updating a facility. All fields optional."""

    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="Facility name",
    )
    location: Optional[str] = Field(
        None,
        max_length=500,
        description="Facility location",
    )
    is_archived: Optional[bool] = Field(
        None,
        description="Archive status",
    )


class FacilityResponse(FacilityBase):
    """Schema for facility response data."""

    id: str = Field(..., description="Unique identifier")
    therapist_id: str = Field(..., description="Owning therapist ID")
    is_archived: bool = Field(..., description="Whether facility is archived")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class FacilityListResponse(BaseModel):
    """Schema for paginated facility list response."""

    facilities: list[FacilityResponse] = Field(..., description="List of facilities")
    total: int = Field(..., description="Total number of facilities")
    include_archived: bool = Field(
        ..., description="Whether archived facilities are included"
    )
