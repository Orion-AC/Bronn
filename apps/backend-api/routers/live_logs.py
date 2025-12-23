from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import asyncio
import json

router = APIRouter(
    prefix="/api/ws",
    tags=["logs"]
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Connection might be dead
                pass

manager = ConnectionManager()

@router.websocket("/logs/{workspace_id}")
async def websocket_endpoint(websocket: WebSocket, workspace_id: str):
    await manager.connect(websocket)
    try:
        # Initial welcome message
        await websocket.send_text(json.dumps({
            "time": "NOW",
            "type": "SYSTEM",
            "message": f"Connected to workspace {workspace_id} log stream."
        }))
        
        while True:
            # Keep the connection open
            await asyncio.sleep(10)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

async def stream_log(workspace_id: str, message: str, level: str = "INFO"):
    """Helper to broadcast a log message to all connected clients."""
    from datetime import datetime
    log_data = {
        "time": datetime.now().strftime("%H:%M:%S"),
        "type": level,
        "message": message
    }
    await manager.broadcast(json.dumps(log_data))
