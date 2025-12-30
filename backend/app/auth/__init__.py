"""Authentication module for Firebase JWT validation."""

from app.auth.firebase import initialize_firebase
from app.auth.jwt_validator import get_current_therapist, verify_firebase_token

__all__ = ["initialize_firebase", "verify_firebase_token", "get_current_therapist"]
