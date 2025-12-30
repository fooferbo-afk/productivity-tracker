"""
Therapist model.

Represents a health professional using the application.
Linked to Firebase authentication via firebase_uid.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.facility import Facility
    from app.models.session import Session


class Therapist(Base):
    """
    Therapist entity representing an authenticated user.
    
    Attributes:
        id: Unique identifier (UUID)
        firebase_uid: Firebase authentication UID (unique)
        email: User's email address
        name: Display name
        role: User role (therapist, manager) - for future expansion
        created_at: Record creation timestamp
        updated_at: Last update timestamp
        
    Relationships:
        facilities: One-to-many with Facility
        sessions: One-to-many with Session
    """

    __tablename__ = "therapists"

    # Primary key - using String for SQLite compatibility, UUID for PostgreSQL/MySQL
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    # Firebase authentication link
    firebase_uid: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        nullable=False,
        index=True,
    )

    # User information
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, default="Therapist")

    # Role for future expansion (therapist | manager)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="therapist")

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
    facilities: Mapped[list["Facility"]] = relationship(
        "Facility",
        back_populates="therapist",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    sessions: Mapped[list["Session"]] = relationship(
        "Session",
        back_populates="therapist",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Therapist(id={self.id}, email={self.email}, name={self.name})>"
