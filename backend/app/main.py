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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)

logger = logging.getLogger(__name__)


@app.on_event("startup")
def startup_event() -> None:
    init_database()
    logger.info("SentinelAI backend starting up")


@app.on_event("shutdown")
def shutdown_event() -> None:
    logger.info("SentinelAI backend shutting down")
