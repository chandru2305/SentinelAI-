import logging
from typing import List
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []
        self.loop = None

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict) -> None:
        logger.debug(f"Broadcasting message to {len(self.active_connections)} clients")
        disconnected_sockets = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send message to connection: {e}")
                disconnected_sockets.append(connection)
        
        # Clean up any stale/broken sockets
        for socket in disconnected_sockets:
            self.disconnect(socket)

    def broadcast_sync(self, message: dict) -> None:
        import asyncio
        if not self.loop:
            try:
                self.loop = asyncio.get_running_loop()
            except RuntimeError:
                pass
        
        if self.loop and self.loop.is_running():
            asyncio.run_coroutine_threadsafe(self.broadcast(message), self.loop)
        else:
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self.broadcast(message))
            except RuntimeError:
                pass

# Global instance of ConnectionManager
manager = ConnectionManager()
