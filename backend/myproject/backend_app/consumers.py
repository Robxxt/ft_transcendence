# consumers.py

import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import PongGame
from .game_logic import GameLogic

class PongGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.game, _ = await database_sync_to_async(PongGame.objects.get_or_create)(pk=1)
        self.game_logic = GameLogic(self.game)
        await self.channel_layer.group_add("game", self.channel_name)
        await self.send_game_state()
        asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("game", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'move_paddle':
            player = data.get('player')
            position = data.get('position')
            await database_sync_to_async(self.game_logic.move_paddle)(player, position)
        elif action == 'start_game':
            await database_sync_to_async(self.game_logic.start_game)()
        elif action == 'update_game':
            await database_sync_to_async(self.game_logic.update_game)()
        elif action == 'reset_game':
            await database_sync_to_async(self.game.reset)()

        await self.send_game_state()

    async def send_game_state(self):
        game_state = await database_sync_to_async(self.game_logic.get_game_state)()
        await self.channel_layer.group_send(
            "game",
            {
                "type": "game_state_update",
                "game_state": game_state
            }
        )

    async def game_state_update(self, event):
        await self.send(text_data=json.dumps(event["game_state"]))

    async def game_loop(self):
        while True:
            await database_sync_to_async(self.game_logic.update_game)()
            await self.send_game_state()
            await asyncio.sleep(1/640) 