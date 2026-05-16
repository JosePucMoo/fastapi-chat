from typing import Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect


app = FastAPI()


class ConnectionManager:

    def __init__(self):
        self.active_connections: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[websocket] = username
        await self.broadcast(f"🔵 {username} se ha conectado")

    async def disconnect(self, websocket: WebSocket):
        username = self.active_connections.get(websocket, "Usuario")
        self.active_connections.pop(websocket, None)
        await self.broadcast(f"🔴 {username} se ha desconectado")

    async def broadcast(self, message: str):
        for connection in list(self.active_connections.keys()):
            await connection.send_text(message)


manager = ConnectionManager()


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket, username: str):
    await manager.connect(websocket, username)

    try:
        while True:
            data = await websocket.receive_text()

            await manager.broadcast(f"{username}: {data}")

    except WebSocketDisconnect:
        await manager.disconnect(websocket)