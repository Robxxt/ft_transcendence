import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_logic import PongGame

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game = PongGame()
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'move':
            self.game.move_paddle(data['player'], data['direction'])
        
        game_state = self.game.get_state()
        await self.send(text_data=json.dumps(game_state))

    async def game_update(self):
        self.game.update()
        game_state = self.game.get_state()
        await self.send(text_data=json.dumps(game_state))