import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = 'game_room'
        self.room_group_name = 'game_%s' % self.room_name

    await self.channel_layer.group_add(self.room_group_name, self.channel_name)
    await self.accept()
    

    async def disconect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        await self.channel_layer.group_send(self.room_group_name, 
                                                {
                                                    'type': 'game_message',
                                                    'message' : message                                                
                                                })
    async def game_message(self, event):
    message = event['message']
    await self.send(text_data=json.dumps
                    ({
                        'message': message
                    }))