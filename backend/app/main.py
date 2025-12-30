"""
FastAPI application entry point.

Configures CORS, mounts routers, and handles startup/shutdown events.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import close_db, init_db
from app.routers import auth, facilities, sessions

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events.
    """
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


# Create FastAPI application
app = FastAPI(
    title="Allied Health Productivity Tracker API",
    description="Backend API for tracking therapist productivity and sessions",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(facilities.router, prefix="/api/facilities", tags=["Facilities"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "version": "0.1.0"}


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Allied Health Productivity Tracker API",
        "docs": "/docs" if settings.is_development else "Disabled in production",
        "health": "/health",
    }
