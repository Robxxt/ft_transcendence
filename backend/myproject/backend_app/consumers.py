import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import PongGame

class PongGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.game, _ = await database_sync_to_async(PongGame.objects.get_or_create)(pk=1)
        await self.channel_layer.group_add("game", self.channel_name)
        await self.send_game_state()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("game", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'move_paddle':
            player = data.get('player')
            position = data.get('position')
            await database_sync_to_async(self.game.move_paddle)(player, position)
        elif action == 'start_game':
            await database_sync_to_async(self.game.start_game)()
        elif action == 'update_game':
            await database_sync_to_async(self.game.update_game)()

        await self.send_game_state()

    async def send_game_state(self):
        await self.channel_layer.group_send(
            "game",
            {
                "type": "game_state_update",
                "game_state": {
                    'ball_x': self.game.ball_x,
                    'ball_y': self.game.ball_y,
                    'paddle1_y': self.game.paddle1_y,
                    'paddle2_y': self.game.paddle2_y,
                    'score1': self.game.score1,
                    'score2': self.game.score2,
                    'is_active': self.game.is_active,
                    'game_state': self.game.game_state,
                    'winner': self.game.winner,
                }
            }
        )

    async def game_state_update(self, event):
        await self.send(text_data=json.dumps(event["game_state"]))