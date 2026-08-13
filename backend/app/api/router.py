from fastapi import APIRouter

from app.api.health import router as health_router
from app.auth.router import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.ai.router import router as ai_router
from app.threats.router import router as threats_router
from app.realtime.router import router as websocket_router

from app.ai_security.router import router as ai_security_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="", tags=["health"])
api_router.include_router(auth_router, prefix="", tags=["auth"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(ai_router, prefix="/ai", tags=["ai"])
api_router.include_router(ai_security_router, prefix="/ai-security", tags=["ai-security"])
api_router.include_router(threats_router, prefix="", tags=["threats"])
api_router.include_router(websocket_router, prefix="", tags=["realtime"])
