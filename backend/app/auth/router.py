from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from app.auth.dependencies import get_auth_service, get_current_credentials
from app.auth.schemas import LoginRequest, TokenResponse, UserResponse
from app.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, auth_service: AuthService = Depends(get_auth_service)) -> TokenResponse:
    user = auth_service.authenticate(request.username_or_email, request.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = auth_service.create_token(user)
    return TokenResponse(access_token=token)


@router.post("/logout")
def logout() -> dict[str, str]:
    return {"message": "logged out"}


@router.get("/me", response_model=UserResponse)
def me(
    credentials: HTTPAuthorizationCredentials | None = Depends(get_current_credentials),
    auth_service: AuthService = Depends(get_auth_service),
) -> UserResponse:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    user = auth_service.get_user_from_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role.value,
        is_active=user.is_active,
    )
