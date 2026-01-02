"""
Session model.

Represents a work session with start/end times and productivity percentage.
Each session belongs to one therapist and one facility.
"""

import uuid
from datetime import date, datetime, time
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.facility import Facility
    from app.models.therapist import Therapist


class Session(Base):
    """
    Session entity representing a work session.
    
    Attributes:
        id: Unique identifier (UUID)
        therapist_id: Foreign key to therapist
        facility_id: Foreign key to facility
        session_date: Date of the session
        start_time: Clock-in time
        end_time: Clock-out time
        productivity_percentage: Productivity % (0-100)
        notes: Optional session notes
        created_at: Record creation timestamp
        updated_at: Last update timestamp
        
    Relationships:
        therapist: Many-to-one with Therapist
        facility: Many-to-one with Facility
    """

    __tablename__ = "sessions"

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    # Foreign keys
    therapist_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("therapists.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    facility_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("facilities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Session information
    session_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )
    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )
    end_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    # Productivity (stored as decimal for precision)
    productivity_percentage: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),  # Max 999.99, but we validate 0-100
        nullable=False,
    )

    # Optional notes
    notes: Mapped[Optional[str]] = mapped_column(
        String(1000),
        nullable=True,
    )

    # Treatment Minutes (New field for productivity calculation)
    total_treatment_minutes: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        default=0,
        comment="Total minutes of treatment assigned/completed"
    )

    # Lunch Minutes (Optional break time)
    lunch_minutes: Mapped[Optional[int]] = mapped_column(
        nullable=True,
        default=0,
        comment="Minutes taken for lunch/break"
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    therapist: Mapped["Therapist"] = relationship(
        "Therapist",
        back_populates="sessions",
    )
    facility: Mapped["Facility"] = relationship(
        "Facility",
        back_populates="sessions",
    )

    @property
    def duration_minutes(self) -> int:
        """Calculate session duration in minutes."""
        start = datetime.combine(self.session_date, self.start_time)
        end = datetime.combine(self.session_date, self.end_time)
        
        # Handle sessions that cross midnight
        if end < start:
            end = end.replace(day=end.day + 1)
            
        delta = end - start
        return int(delta.total_seconds() / 60)

    @property
    def duration_hours(self) -> float:
        """Calculate session duration in hours."""
        return self.duration_minutes / 60

    def __repr__(self) -> str:
        return (
            f"<Session(id={self.id}, date={self.session_date}, "
            f"productivity={self.productivity_percentage}%)>"
        )
