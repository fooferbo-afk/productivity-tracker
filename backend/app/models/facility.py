"""
Facility model.

Represents a workplace where a therapist can log sessions.
One therapist can have multiple facilities.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.session import Session
    from app.models.therapist import Therapist


class Facility(Base):
    """
    Facility entity representing a workplace.
    
    Attributes:
        id: Unique identifier (UUID)
        therapist_id: Foreign key to owning therapist
        name: Facility name (required)
        location: Facility location (optional)
        is_archived: Soft delete flag
        created_at: Record creation timestamp
        updated_at: Last update timestamp
        
    Relationships:
        therapist: Many-to-one with Therapist
        sessions: One-to-many with Session
    """

    __tablename__ = "facilities"

    # Primary key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    # Foreign key to therapist
    therapist_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("therapists.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Facility information
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Soft delete flag - archived facilities are hidden from pickers
    is_archived: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
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
        back_populates="facilities",
    )
    sessions: Mapped[list["Session"]] = relationship(
        "Session",
        back_populates="facility",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Facility(id={self.id}, name={self.name}, archived={self.is_archived})>"
