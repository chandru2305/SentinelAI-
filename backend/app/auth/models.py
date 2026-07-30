from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class UserRole(str, Enum):
    admin = "admin"
    analyst = "analyst"


class User(BaseModel):
    id: str
    username: str
    email: str
    password_hash: str
    role: UserRole = UserRole.analyst
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole = UserRole.analyst


class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: int
