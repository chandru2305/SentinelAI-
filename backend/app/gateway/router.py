from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_db_session
from app.auth.schemas import UserResponse
from app.gateway.schemas import GatewayChatRequest, GatewayChatResponse, GatewayStatusResponse
from app.gateway.service import GatewayService

router = APIRouter()
gateway_service = GatewayService()

@router.get("/status", response_model=GatewayStatusResponse)
def get_gateway_status(
    current_user: UserResponse = Depends(get_current_user)
) -> GatewayStatusResponse:
    return gateway_service.gateway_status()

@router.post("/chat", response_model=GatewayChatResponse)
def gateway_chat(
    request: GatewayChatRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db_session)
) -> GatewayChatResponse:
    return gateway_service.chat(request, db)
