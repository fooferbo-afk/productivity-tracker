"""
Shared FastAPI dependencies.

Contains reusable dependencies for database sessions and authentication.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_validator import get_current_therapist
from app.database import get_db
from app.models.therapist import Therapist

# Type aliases for cleaner route signatures
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentTherapist = Annotated[Therapist, Depends(get_current_therapist)]
