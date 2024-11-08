
import asyncio
from django.db import transaction
from channels.db import database_sync_to_async
from typing import Dict, Any, Callable
from backend_app.models import PongGame
import random
from asgiref.sync import sync_to_async
import time
from django.utils import timezone
from django.contrib.auth import get_user_model
import math
from enum import Enum

User = get_user_model()

class GameState(Enum):
    WAITING = 1
    PLAYING = 2
    FINISHED = 3
    POINT_SCORED = 4
    DISCONNECTED = 5

class GameLogic:
    MAX_SCORE: int = 3
    PADDLE_WIDTH: float = 0.02
    PADDLE_HEIGHT: float = 0.15
    PADDLE_OFFSET: float = 0.02 
    BALL_SPEED: float = 0.4
    MAX_ANGLE: float = math.pi / 2
    BALL_RADIUS: float = 0.1 * PADDLE_HEIGHT
    SPEED_BOOST_FACTOR = 1.5
    SPEED_BOOST_DURATION = 5


    def __init__(self, pong_game: PongGame):
        self.pong_game = pong_game
        self.is_running = False
        self.update_callback: Callable[[Dict[str, Any]], None] = None
        self.game_state = GameState.WAITING
        self.player1_ready = False
        self.player2_ready = False
        self.last_update_time = time.time()
        self.frame_count = 0
        self.last_fps_print_time = time.time()
        self.ball_x = 0.5
        self.ball_y = 0.5
        self.ball_speed_x = 0.009
        self.ball_speed_y = 0.009
        self.paddle1_y = 0.5
        self.paddle2_y = 0.5
        self.score1 = 0
        self.score2 = 0
        self.connected_players = set()
        self.speed_boost_active = False
        self.speed_boost_end_time = 0
        self.player_names = {1: "", 2: "", 3: "AI"}
        self.winner = None
        self.winner_display_name = None
        self.reset_game()

    async def set_winner(self):
        self.winner = self.player_names[1] if self.score1 > self.score2 else self.player_names[2]
        try:
            winner_user = await sync_to_async(User.objects.get)(username=self.winner)
            self.winner_display_name = winner_user.display_name
        except User.DoesNotExist:
            self.winner_display_name = "Unknown Player"



    @database_sync_to_async
    def _get_player_names(self):
        self.pong_game.refresh_from_db()
        player1_name = self.pong_game.room.player1.username if self.pong_game.room.player1 else ""
        player2_name = self.pong_game.room.player2.username if self.pong_game.room.player2 else ""
        return player1_name, player2_name

    async def handle_player_connect(self, player_channel):
        self.connected_players.add(player_channel)
        player1_name, player2_name = await self._get_player_names()
        
        if self.player_names[1] == "":
            self.player_names[1] = player1_name
        if self.pong_game.room.isAiPlay:
            self.player_names[2] = self.player_names[3]
        elif player2_name:
            self.player_names[2] = player2_name
        print("HANDLE PLAYER CALL")
        print(f"Player 1: {self.player_names[1]}, Player 2: {self.player_names[2]}")

    async def handle_player_disconnect(self, player_channel):
        self.connected_players.discard(player_channel)
        if self.game_state == GameState.FINISHED:
          return
        if len(self.connected_players) < 2:
            await self.end_game_due_to_disconnection(player_channel)

    async def end_game_due_to_disconnection(self, disconnected_player_channel):
        self.game_state = GameState.DISCONNECTED
        disconnected_player = await self.get_disconnected_player(disconnected_player_channel)
        winner = 3 - disconnected_player  # If player 1 disconnected, winner is 2, and vice versa
        await self.set_winner()
        await self._finish_game_db_ops(disconnected=True, winner=self.player_names[winner])
        await self.update_game_state()
        self.stop_game_loop()

    @database_sync_to_async
    def get_disconnected_player(self, disconnected_player_channel):
        self.pong_game.refresh_from_db()
        if disconnected_player_channel == self.pong_game.room.player1:
            return 1
        else:
            return 2

    @database_sync_to_async
    def _finish_game_db_ops(self, disconnected=False, winner=None):
        with transaction.atomic():
            self.pong_game.refresh_from_db()
            self.pong_game.game_state = PongGame.State.FINISHED
            if disconnected:
              self.pong_game.winner = None
            else:
              self.pong_game.winner = winner or (self.player_names[1] if self.score1 > self.score2 else self.player_names[2])
            self.pong_game.finished_at = timezone.now()
            self.pong_game.score1 = self.score1
            self.pong_game.score2 = self.score2
            self.pong_game.disconnected = disconnected
            self.pong_game.save()

            player1 = self.pong_game.room.player1
            player2 = self.pong_game.room.player2

            if self.pong_game.winner == player1.username:
                player1.won += 1
                player2.lost += 1
            elif self.pong_game.winner == player2.username:
                player2.won += 1
                player1.lost += 1
            player1.save()
            player2.save()

    async def start_game_loop(self):
        self.is_running = True
        self.last_update_time = time.time()
        self.last_fps_print_time = time.time()
        self.frame_count = 0
        while self.is_running:
            await self.update_game_state()
            self.frame_count += 1
            current_time = time.time()
            if current_time - self.last_fps_print_time >= 1.0:
                fps = self.frame_count / (current_time - self.last_fps_print_time)
                self.frame_count = 0
                self.last_fps_print_time = current_time
            await asyncio.sleep(1/120)

    def stop_game_loop(self):
        self.is_running = False

    def set_update_callback(self, callback: Callable[[Dict[str, Any]], None]):
        self.update_callback = callback

    async def update_game_state(self) -> Dict[str, Any]:
        current_time = time.time()
        dt = current_time - self.last_update_time
        self.last_update_time = current_time
        if self.game_state == GameState.PLAYING:
            self._move_ball(dt)
            if self.pong_game.room.isAiPlay == True:
                self.move_ai()
            self._check_collisions()
            await self._check_scoring()
        
        game_state = await self.get_game_state()
        if self.update_callback:
            await self.update_callback(game_state)
        return game_state

    def _move_ball(self, dt: float) -> None:
        current_time = time.time()
        if self.speed_boost_active and current_time > self.speed_boost_end_time:
            self.speed_boost_active = False
            self.ball_speed_x /= self.SPEED_BOOST_FACTOR
            self.ball_speed_y /= self.SPEED_BOOST_FACTOR
        
        self.ball_x += self.ball_speed_x * dt
        self.ball_y += self.ball_speed_y * dt
    
    async def activate_speed_boost(self):
        if not self.speed_boost_active:
            self.speed_boost_active = True
            self.ball_speed_x *= self.SPEED_BOOST_FACTOR
            self.ball_speed_y *= self.SPEED_BOOST_FACTOR
            self.speed_boost_end_time = time.time() + self.SPEED_BOOST_DURATION

    def _check_collisions(self) -> None:
        if self.ball_y - self.BALL_RADIUS <= 0 or self.ball_y + self.BALL_RADIUS >= 1:
            self.ball_speed_y *= -1

        paddle1_left = self.PADDLE_OFFSET
        paddle1_right = self.PADDLE_OFFSET + self.PADDLE_WIDTH
        paddle2_left = 1 - self.PADDLE_OFFSET - self.PADDLE_WIDTH
        paddle2_right = 1 - self.PADDLE_OFFSET

        paddle1_top = self.paddle1_y - self.PADDLE_HEIGHT / 2
        paddle1_bottom = self.paddle1_y + self.PADDLE_HEIGHT / 2
        paddle2_top = self.paddle2_y - self.PADDLE_HEIGHT / 2
        paddle2_bottom = self.paddle2_y + self.PADDLE_HEIGHT / 2

        if (paddle1_left - self.BALL_RADIUS <= self.ball_x <= paddle1_right + self.BALL_RADIUS and 
            paddle1_top - self.BALL_RADIUS <= self.ball_y <= paddle1_bottom + self.BALL_RADIUS):
            if self.ball_speed_x < 0:
                self._handle_paddle_collision(1, paddle1_top, paddle1_bottom)

        elif (paddle2_left - self.BALL_RADIUS <= self.ball_x <= paddle2_right + self.BALL_RADIUS and 
              paddle2_top - self.BALL_RADIUS <= self.ball_y <= paddle2_bottom + self.BALL_RADIUS):
            if self.ball_speed_x > 0:
                self._handle_paddle_collision(2, paddle2_top, paddle2_bottom)

    def _handle_paddle_collision(self, paddle: int, paddle_top: float, paddle_bottom: float):
        relative_impact = (self.ball_y - paddle_top) / (paddle_bottom - paddle_top)
        
        angle = (relative_impact - 0.5) * self.MAX_ANGLE
        
        speed = math.sqrt(self.ball_speed_x**2 + self.ball_speed_y**2)
        speed *= 1.05
        if paddle == 1:
            self.ball_speed_x = abs(speed * math.cos(angle))
            self.ball_speed_y = speed * math.sin(angle)
        else:
            self.ball_speed_x = -abs(speed * math.cos(angle))
            self.ball_speed_y = speed * math.sin(angle)

    async def _check_scoring(self) -> None:
        if self.ball_x <= 0:
            self.score2 += 1
            self._reset_ball()
            self.game_state = GameState.POINT_SCORED
        elif self.ball_x >= 1:
            self.score1 += 1
            self._reset_ball()
            self.game_state = GameState.POINT_SCORED
        if self.score1 >= self.MAX_SCORE or self.score2 >= self.MAX_SCORE:
            await self.set_winner()
            await self.finish_game()


    def _reset_ball(self) -> None:
        self.ball_x = 0.5
        self.ball_y = 0.5
        self.ball_speed_x = self.BALL_SPEED * random.choice([-1, 1])
        self.ball_speed_y = self.BALL_SPEED * random.uniform(-0.5, 0.5)
        self.paddle1_y = 0.5
        self.paddle2_y = 0.5
        self.player1_ready = False
        self.player2_ready = False

    def move_paddle(self, player: int, direction: str) -> None:
        movement = -0.02 if direction == 'up' else 0.02
        lower_bound = self.PADDLE_HEIGHT / 2
        upper_bound = 1 - self.PADDLE_HEIGHT / 2
        
        # debug
        if player == 1 or player == 3:
            new_position = self.paddle1_y + movement
            if lower_bound <= new_position <= upper_bound:
                self.paddle1_y = new_position
        else:
            new_position = self.paddle2_y + movement
            if lower_bound <= new_position <= upper_bound:
                self.paddle2_y = new_position

    async def start_game(self) -> None:
        if self.player1_ready and self.player2_ready:
            self.game_state = GameState.PLAYING
            self._reset_ball()
        else:
            pass

    async def reset_game(self) -> None:
        await sync_to_async(self.pong_game.reset)()
        self._reset_ball()
        self.player1_ready = False
        self.player2_ready = False


    async def get_game_state(self) -> Dict[str, Any]:
        return {
            'ball_x': self.ball_x,
            'ball_y': self.ball_y,
            'paddle1_y': self.paddle1_y,
            'paddle2_y': self.paddle2_y,
            'score1': self.score1,
            'score2': self.score2,
            'game_state': self.game_state.name,
            'winner': self.pong_game.winner,
            'winner_display_name': self.winner_display_name,
            'paddle_width': self.PADDLE_WIDTH,
            'paddle_height': self.PADDLE_HEIGHT,
            'paddle_offset': self.PADDLE_OFFSET,
            'player1_ready': self.player1_ready,
            'player2_ready': self.player2_ready,
            'ball_radius': self.BALL_RADIUS,
            'connected_players': len(self.connected_players),
            'disconnected': self.game_state == GameState.DISCONNECTED,
            'speed_boost_active': self.speed_boost_active,
            'player_names': {str(k): v for k, v in self.player_names.items()}
        }

    async def handle_websocket_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        action = message.get('action')
        if action == 'move_paddle':
            player = message.get('player')
            direction = message.get('game_action')
            if player in [1, 2, 3] and direction in ['up', 'down']:
                self.move_paddle(player, direction)
        elif action == 'start_game':
            player = message.get('player')
            if player == 1:
                self.player1_ready = True
            elif player == 2:
                self.player2_ready = True
            elif player == 3:
                self.player1_ready = True
                self.player2_ready = True
            await self.start_game()
        elif action == 'reset_game':
            await self.reset_game()
        elif action == 'activate_speed_boost':
            await self.activate_speed_boost()
        return await self.get_game_state()

    async def finish_game(self) -> None:
        self.game_state = GameState.FINISHED
        print('Game finished')
        self.stop_game_loop()
        await self._finish_game_db_ops()
        await self.update_game_state()

    def move_ai(self):
        glitch = random.choices([True, False], weights=[1, 18])[0]

        if abs(self.ball_y - self.paddle2_y) < 0.01:
            return
        if glitch:
            return
        if self.paddle2_y > self.ball_y:
            self.move_paddle(2, "up")
        elif self.paddle2_y < self.ball_y:
            self.move_paddle(2, "down")
        else:
            pass
