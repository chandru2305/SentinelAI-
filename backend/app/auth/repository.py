from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth.models import User as AuthUser
from app.auth.models import UserCreate, UserRole
from app.auth.security import hash_password
from app.models.user import User as ORMUser


class SQLAlchemyUserRepository:
    def __init__(self, session: Session) -> None:
        self.session = session
        self._ensure_default_admin()

    def _ensure_default_admin(self) -> None:
        from app.core.config import settings
        
        if self.get_user_by_username_or_email(settings.admin_username) is None:
            self.create_user(
                UserCreate(
                    username=settings.admin_username,
                    email="admin@sentinelai.local",
                    password=settings.admin_password,
                    role=UserRole.admin,
                )
            )

    def _to_domain_user(self, orm_user: ORMUser) -> AuthUser:
        return AuthUser(
            id=orm_user.id,
            username=orm_user.username,
            email=orm_user.email,
            password_hash=orm_user.password_hash,
            role=UserRole(orm_user.role),
            is_active=orm_user.is_active,
            created_at=orm_user.created_at or datetime.now(timezone.utc),
        )

    def create_user(self, user_create: UserCreate) -> AuthUser:
        orm_user = ORMUser(
            id=str(uuid4()),
            username=user_create.username,
            email=user_create.email,
            password_hash=hash_password(user_create.password),
            role=user_create.role.value,
        )
        self.session.add(orm_user)
        self.session.commit()
        self.session.refresh(orm_user)
        return self._to_domain_user(orm_user)

    def get_user_by_username_or_email(self, username_or_email: str) -> Optional[AuthUser]:
        orm_user = (
            self.session.query(ORMUser)
            .filter(or_(ORMUser.username == username_or_email, ORMUser.email == username_or_email))
            .first()
        )
        if orm_user is None:
            return None
        return self._to_domain_user(orm_user)

    def get_user_by_id(self, user_id: str) -> Optional[AuthUser]:
        orm_user = self.session.get(ORMUser, user_id)
        if orm_user is None:
            return None
        return self._to_domain_user(orm_user)

    def update_user(self, user: AuthUser) -> AuthUser:
        orm_user = self.session.get(ORMUser, user.id)
        if orm_user is None:
            raise ValueError(f"User {user.id} not found")

        orm_user.username = user.username
        orm_user.email = user.email
        orm_user.password_hash = user.password_hash
        orm_user.role = user.role.value
        orm_user.is_active = user.is_active

        self.session.commit()
        self.session.refresh(orm_user)
        return self._to_domain_user(orm_user)
