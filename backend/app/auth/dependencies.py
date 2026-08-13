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


from fastapi import HTTPException, status
from app.auth.models import User

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(get_current_credentials),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user = auth_service.get_user_from_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user
