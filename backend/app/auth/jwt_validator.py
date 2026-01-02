"""
JWT validation dependency for FastAPI.

Validates Firebase ID tokens and retrieves the associated therapist.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.firebase import initialize_firebase
from app.database import get_db
from app.models.therapist import Therapist

# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=False)


class TokenPayload:
    """Decoded token payload containing user information."""

    def __init__(self, uid: str, email: Optional[str], name: Optional[str]):
        self.uid = uid
        self.email = email
        self.name = name


def verify_firebase_token(token: str) -> TokenPayload:
    """
    Verify a Firebase ID token.
    
    Args:
        token: Firebase ID token from client
        
    Returns:
        TokenPayload: Decoded token information
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    # Ensure Firebase is initialized
    initialize_firebase()

    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return TokenPayload(
            uid=decoded_token["uid"],
            email=decoded_token.get("email"),
            name=decoded_token.get("name"),
        )
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_therapist(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Therapist:
    """
    Dependency to get the current authenticated therapist.
    
    Validates the Firebase token and retrieves the therapist from database.
    If the therapist doesn't exist, creates a new one (first-time login).
    
    Args:
        credentials: HTTP Bearer token from request
        db: Database session
        
    Returns:
        Therapist: The authenticated therapist
        
    Raises:
        HTTPException: If not authenticated or token is invalid
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify the Firebase token
    token_payload = verify_firebase_token(credentials.credentials)

    # Look up or create therapist
    result = await db.execute(
        select(Therapist).where(Therapist.firebase_uid == token_payload.uid)
    )
    therapist = result.scalar_one_or_none()

    if therapist is None:
        # First-time login - create therapist record
        try:
            therapist = Therapist(
                firebase_uid=token_payload.uid,
                email=token_payload.email or "",
                name=token_payload.name or "Therapist",
            )
            db.add(therapist)
            await db.flush()  # Get the ID without committing
        except Exception: 
            # Handle race condition - user might have been created by concurrent request
            # We catch generic Exception because IntegrityError might be wrapped
            await db.rollback()
            result = await db.execute(
                select(Therapist).where(Therapist.firebase_uid == token_payload.uid)
            )
            therapist = result.scalar_one_or_none()
            
            if therapist is None:
                # Still failed? Re-raise
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Could not create user profile",
                )

    return therapist


async def get_optional_therapist(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[Therapist]:
    """
    Optional authentication dependency.
    
    Returns the therapist if authenticated, None otherwise.
    Useful for endpoints that have different behavior for authenticated vs anonymous users.
    """
    if credentials is None:
        return None

    try:
        return await get_current_therapist(credentials, db)
    except HTTPException:
        return None
