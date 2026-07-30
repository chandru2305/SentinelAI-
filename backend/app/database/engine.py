from sqlalchemy import create_engine

from app.database.config import DATABASE_URL

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
