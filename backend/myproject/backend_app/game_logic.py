from typing import Optional
from .models import PongGame
import asyncio
import time


class GameLogic:
    def __init__(self, game: PongGame) -> None:
        self.game: PongGame = game  # This makes it clear that `self.game` is of type `PongGame`

    def update_game(self) -> None:
        if not self.game.is_active:
            return

        # Move ball
        self.game.ball_x += self.game.ball_speed_x
        self.game.ball_y += self.game.ball_speed_y

        self._handle_collisions()
        self._check_scoring()

        self.game.save()

    def _handle_collisions(self) -> None:
        # Ball collision with top and bottom walls
        if self.game.ball_y <= 0 or self.game.ball_y >= 1:
            self.game.ball_speed_y = -self.game.ball_speed_y

        # Ball collision with paddles
        paddle_width: float = 0.02
        paddle_height: float = 0.2
        if (self.game.ball_x <= paddle_width and self.game.paddle1_y <= self.game.ball_y <= self.game.paddle1_y + paddle_height) or \
           (self.game.ball_x >= 1 - paddle_width and self.game.paddle2_y <= self.game.ball_y <= self.game.paddle2_y + paddle_height):
            self.game.ball_speed_x = -self.game.ball_speed_x

    def _check_scoring(self) -> None:
        if self.game.ball_x < 0:
            self.game.score2 += 1
            self._handle_point_scored()
        elif self.game.ball_x > 1:
            self.game.score1 += 1
            self._handle_point_scored()

    def _handle_point_scored(self) -> None:
        if self.game.score1 >= 2:
            self.game.winner = 'Player 1'
            self.game.is_active = False
        elif self.game.score2 >= 2:
            self.game.winner = 'Player 2'
            self.game.is_active = False

        if self.game.winner:
            self.game.reset()
        else:
            self.game.game_state = 'scored'
            self._reset_ball()

    def _reset_ball(self) -> None:
        self.game.ball_x = 0.5
        self.game.ball_y = 0.5
        self.game.ball_speed_x = 0.005 if self.game.ball_speed_x > 0 else -0.005
        self.game.ball_speed_y = 0.005 if self.game.ball_speed_y > 0 else -0.005

    def move_paddle(self, player: int, position: float) -> None:
        if player == 1:
            self.game.paddle1_y = max(0, min(position, 0.8))
        else:
            self.game.paddle2_y = max(0, min(position, 0.8))
        self.game.save()

    def start_game(self) -> None:
        self.game.is_active = True
        self.game.game_state = 'playing'
        self.game.save()

    def get_game_state(self) -> dict[str, Optional[float | int | bool | str]]:
        return {
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
