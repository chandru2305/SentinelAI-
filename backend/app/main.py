import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.database import init_database

configure_logging()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)

logger = logging.getLogger(__name__)

from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Please check server logs for details."},
    )

@app.on_event("startup")
def startup_event() -> None:
    logger.info("SentinelAI backend starting up")
    try:
        init_database()
        logger.info("Database initialized and default admin ensured")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")



@app.on_event("shutdown")
def shutdown_event() -> None:
    logger.info("SentinelAI backend shutting down")
