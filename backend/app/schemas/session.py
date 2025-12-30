"""
Session schemas.

Pydantic models for session CRUD operations and aggregations.
"""

from datetime import date, datetime, time
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class SessionBase(BaseModel):
    """Base session schema with common fields."""

    session_date: date = Field(..., description="Date of the session")
    start_time: time = Field(..., description="Clock-in time")
    end_time: time = Field(..., description="Clock-out time")
    productivity_percentage: Decimal = Field(
        ...,
        ge=0,
        le=100,
        description="Productivity percentage (0-100)",
    )
    notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional session notes",
    )

    @field_validator("productivity_percentage", mode="before")
    @classmethod
    def round_productivity(cls, v):
        """Round productivity to 2 decimal places."""
        if isinstance(v, (int, float, Decimal)):
            return round(Decimal(str(v)), 2)
        return v


class SessionCreate(SessionBase):
    """Schema for creating a new session."""

    facility_id: str = Field(..., description="Facility ID for this session")


class SessionUpdate(BaseModel):
    """Schema for updating a session. All fields optional."""

    session_date: Optional[date] = Field(None, description="Date of the session")
    start_time: Optional[time] = Field(None, description="Clock-in time")
    end_time: Optional[time] = Field(None, description="Clock-out time")
    productivity_percentage: Optional[Decimal] = Field(
        None,
        ge=0,
        le=100,
        description="Productivity percentage (0-100)",
    )
    facility_id: Optional[str] = Field(None, description="Facility ID")
    notes: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional session notes",
    )

    @field_validator("productivity_percentage", mode="before")
    @classmethod
    def round_productivity(cls, v):
        """Round productivity to 2 decimal places."""
        if v is not None and isinstance(v, (int, float, Decimal)):
            return round(Decimal(str(v)), 2)
        return v


class SessionResponse(SessionBase):
    """Schema for session response data."""

    id: str = Field(..., description="Unique identifier")
    therapist_id: str = Field(..., description="Owning therapist ID")
    facility_id: str = Field(..., description="Associated facility ID")
    facility_name: Optional[str] = Field(None, description="Facility name for display")
    duration_minutes: int = Field(..., description="Session duration in minutes")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {"from_attributes": True}


class SessionListResponse(BaseModel):
    """Schema for paginated session list response."""

    sessions: list[SessionResponse] = Field(..., description="List of sessions")
    total: int = Field(..., description="Total number of sessions matching filter")


class SessionSummaryResponse(BaseModel):
    """Schema for aggregate session statistics."""

    total_sessions: int = Field(..., description="Total number of sessions")
    total_hours: float = Field(..., description="Total hours worked")
    average_hours: float = Field(..., description="Average hours per session")
    average_productivity: float = Field(
        ..., description="Average productivity percentage"
    )
    date_range_start: Optional[date] = Field(None, description="Start of date range")
    date_range_end: Optional[date] = Field(None, description="End of date range")
    facility_id: Optional[str] = Field(
        None, description="Facility filter (if applied)"
    )
