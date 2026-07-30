from typing import Generator

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.repository import SQLAlchemyUserRepository
from app.auth.service import AuthService
from app.database.session import SessionLocal

security = HTTPBearer(auto_error=False)


def get_db_session() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_auth_service(db: Session = Depends(get_db_session)) -> AuthService:
    repository = SQLAlchemyUserRepository(db)
    return AuthService(repository)


def get_current_credentials(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> HTTPAuthorizationCredentials | None:
    return credentials
