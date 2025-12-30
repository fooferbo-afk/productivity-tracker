"""
Firebase Admin SDK initialization.

Handles Firebase app initialization for server-side token verification.
Supports both service account file and environment variable configuration.
"""

import json
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials

from app.config import get_settings

settings = get_settings()


@lru_cache
def initialize_firebase() -> firebase_admin.App:
    """
    Initialize Firebase Admin SDK.
    
    Tries to initialize from:
    1. Service account file path (FIREBASE_SERVICE_ACCOUNT_PATH)
    2. Environment variables (FIREBASE_PROJECT_ID, etc.)
    3. Google Cloud default credentials (for GCP deployments)
    
    Returns:
        firebase_admin.App: Initialized Firebase app instance
    """
    # Check if already initialized
    try:
        return firebase_admin.get_app()
    except ValueError:
        pass  # Not initialized yet

    # Option 1: Service account file
    resolved_path = settings.firebase_service_account_path_resolved
    if resolved_path:
        cred = credentials.Certificate(resolved_path)
        return firebase_admin.initialize_app(cred)

    # Option 2: Environment variables
    if settings.firebase_private_key and settings.firebase_client_email:
        service_account_info = {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key_id": settings.firebase_private_key_id,
            "private_key": settings.firebase_private_key.replace("\\n", "\n"),
            "client_email": settings.firebase_client_email,
            "client_id": settings.firebase_client_id,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        }
        cred = credentials.Certificate(service_account_info)
        return firebase_admin.initialize_app(cred)

    # Option 3: Google Cloud default credentials (for GCP deployments)
    if settings.firebase_project_id:
        return firebase_admin.initialize_app(
            options={"projectId": settings.firebase_project_id}
        )

    # Development fallback - will only work for non-verified operations
    return firebase_admin.initialize_app()
