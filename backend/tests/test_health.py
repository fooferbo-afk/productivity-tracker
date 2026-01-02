
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    """
    Test the health check endpoint.
    This serves as a basic smoke test for the CI pipeline.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "version": "0.1.0"}
