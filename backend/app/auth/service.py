from typing import Any, Optional

from jose import JWTError

from app.auth.models import User
from app.auth.security import create_access_token, decode_access_token, verify_password


class AuthService:
    def __init__(self, repository: Any) -> None:
        self.repository = repository

    def authenticate(self, username_or_email: str, password: str) -> Optional[User]:
        user = self.repository.get_user_by_username_or_email(username_or_email)
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    def create_token(self, user: User) -> str:
        return create_access_token(user.id, user.role.value)

    def get_user_from_token(self, token: str) -> Optional[User]:
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            if not user_id:
                return None
            return self.repository.get_user_by_id(user_id)
        except JWTError:
            return None
