from app.database.base import Base
from app.database.config import DATABASE_URL
from app.database.engine import engine
from app.database.session import SessionLocal


def init_database() -> None:
    from app.models.user import User

    Base.metadata.create_all(bind=engine)


__all__ = ["Base", "DATABASE_URL", "engine", "SessionLocal", "init_database"]
