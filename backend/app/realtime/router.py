import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_auth_service, get_db_session
from app.auth.service import AuthService
from app.realtime.manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(None),
    db: Session = Depends(get_db_session)
) -> None:
    auth_service = get_auth_service(db)
    
    # 1. Authenticate connection
    if not token:
        logger.warning("WebSocket connection rejected: Missing token query parameter.")
        await websocket.close(code=4003)
        return
        
    user = auth_service.get_user_from_token(token)
    if not user:
        logger.warning("WebSocket connection rejected: Invalid or expired token.")
        await websocket.close(code=4003)
        return

    # 2. Register client connection
    import asyncio
    if not manager.loop:
        try:
            manager.loop = asyncio.get_running_loop()
        except RuntimeError:
            pass
            
    await manager.connect(websocket)
    
    # 3. Connection lifecycle loop
    try:
        while True:
            # Receive message from client (keeps socket alive)
            data = await websocket.receive_text()
            logger.debug(f"Received WebSocket message from client ({user.username}): {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"WebSocket client ({user.username}) disconnected.")
    except Exception as e:
        logger.error(f"Unexpected error in WebSocket connection: {e}")
        manager.disconnect(websocket)
