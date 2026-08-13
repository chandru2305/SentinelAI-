import logging
from sqlalchemy import create_engine
from app.database.config import DATABASE_URL

logger = logging.getLogger(__name__)

connect_args = {}
db_url = DATABASE_URL

if "sqlite" in db_url:
    connect_args["check_same_thread"] = False

try:
    if "sqlite" in db_url:
        engine = create_engine(db_url, connect_args=connect_args, future=True)
    else:
        engine = create_engine(db_url, pool_pre_ping=True, future=True)
        # Test connection
        with engine.connect() as conn:
            pass
except Exception as e:
    logger.warning(f"Failed to connect to primary DB ({e}). Falling back to SQLite database: sentinelai.db")
    db_url = "sqlite:///./sentinelai.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False}, future=True)

