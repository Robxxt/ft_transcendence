import json
from typing import Dict, Any, List
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from backend_app.models import GameRoom, PongGame
from backend_app.game_logic import GameLogic
import asyncio

class ChatRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract room name from the URL route
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'game_room_{self.room_name}'
        print(f'This is the scope: {self.scope}')

        # Join the game room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the game room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        username = text_data_json['username']
        message = text_data_json['message']
        timestamp = text_data_json['timestamp']

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'username': username,
                'message': message,
                'timestamp': timestamp
            }
        )

    async def chat_message(self, event):
        username = event['username']
        message = event['message']
        timestamp = event['timestamp']

        await self.send(text_data=json.dumps({
            'username': username,
            'message': message,
            'timestamp': timestamp
        }))

class PongConsumer(AsyncWebsocketConsumer):
    game_logic_instances = {}

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'pong_game_{self.room_name}'
        self.game_room = await self.get_game_room()
        self.pong_game = await self.get_or_create_pong_game()
        await self.get_or_create_game_logic()
        self.game_logic.set_update_callback(self.send_game_state_update)

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        await self.game_logic.handle_player_connect(self.channel_name)
        await self.broadcast_room_state()
        initial_game_state = await self.game_logic.get_game_state()
        await self.send_game_state_update(initial_game_state)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.game_logic.handle_player_disconnect(self.channel_name)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_disconnected',
                'message': 'A player has disconnected.'
            }
        )

    async def player_disconnected(self, event):
        # Send message to frontend to handle disconnect
        await self.send(text_data=json.dumps({
            'action': 'player_disconnected',
            'message': event['message']
        }))


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')
        # print(f"Received message: {text_data_json}")

        if action in ['move_paddle', 'start_game', 'resume_game' ,'activate_speed_boost']:
            game_state = await self.game_logic.handle_websocket_message(text_data_json)
            if action == 'start_game' and not self.game_logic.is_running:
                asyncio.create_task(self.game_logic.start_game_loop())
            await self.send_game_state_update(game_state)

    async def game_state_update(self, event):
        game_state = event['game_state']
        await self.send(text_data=json.dumps({
            'action': 'game_state_update',
            'game_state': game_state
        }))

    @database_sync_to_async
    def get_game_room(self) -> GameRoom:
        return GameRoom.objects.get(id=int(self.room_name))

    @database_sync_to_async
    def get_or_create_pong_game(self) -> PongGame:
        pong_game, created = PongGame.objects.get_or_create(room=self.game_room)
        return pong_game

    async def get_or_create_game_logic(self):
        if self.room_name not in self.game_logic_instances:
            self.game_logic_instances[self.room_name] = GameLogic(self.pong_game)
        self.game_logic = self.game_logic_instances[self.room_name]

    async def send_game_state_update(self, game_state: Dict[str, Any]):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_state_update',
                'game_state': game_state
            }
        )

    async def broadcast_room_state(self):
        room = await self.get_game_room()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'room_state_update',
                'state': room.state
            }
        )

    async def room_state_update(self, event):
        room_state = event['state']
        await self.send(text_data=json.dumps({
            'action': 'room_state_update',
            'state': room_state
        }))