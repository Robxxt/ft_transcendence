class PongGame:
    def __init__(self):
        self.canvas_width = 800
        self.canvas_height = 400
        self.paddle_height = 100
        self.paddle_width = 10
        self.ball_radius = 10
        self.reset_game()

    def reset_game(self):
        self.ball_x = self.canvas_width / 2
        self.ball_y = self.canvas_height / 2
        self.ball_speed_x = 5
        self.ball_speed_y = 5
        self.paddle1_y = self.canvas_height / 2 - self.paddle_height / 2
        self.paddle2_y = self.canvas_height / 2 - self.paddle_height / 2
        self.score1 = 0
        self.score2 = 0
        self.game_over = False
        self.winner = None

    def move_paddle(self, player, direction):
        paddle_speed = 5
        if player == 1:
            if direction == 'up' and self.paddle1_y > 0:
                self.paddle1_y -= paddle_speed
            elif direction == 'down' and self.paddle1_y < self.canvas_height - self.paddle_height:
                self.paddle1_y += paddle_speed
        elif player == 2:
            if direction == 'up' and self.paddle2_y > 0:
                self.paddle2_y -= paddle_speed
            elif direction == 'down' and self.paddle2_y < self.canvas_height - self.paddle_height:
                self.paddle2_y += paddle_speed

    def update(self):
        if self.game_over:
            return

        self.ball_x += self.ball_speed_x
        self.ball_y += self.ball_speed_y

        # Ball collision with top and bottom walls
        if self.ball_y - self.ball_radius < 0 or self.ball_y + self.ball_radius > self.canvas_height:
            self.ball_speed_y = -self.ball_speed_y

        # Ball collision with paddles
        if (self.ball_x - self.ball_radius < self.paddle_width and self.ball_y > self.paddle1_y and self.ball_y < self.paddle1_y + self.paddle_height) or \
           (self.ball_x + self.ball_radius > self.canvas_width - self.paddle_width and self.ball_y > self.paddle2_y and self.ball_y < self.paddle2_y + self.paddle_height):
            self.ball_speed_x = -self.ball_speed_x

        # Ball out of bounds
        if self.ball_x < 0:
            self.score2 += 1
            self.check_game_over()
            self.reset_ball()
        elif self.ball_x > self.canvas_width:
            self.score1 += 1
            self.check_game_over()
            self.reset_ball()

    def check_game_over(self):
        if self.score1 >= 2:
            self.game_over = True
            self.winner = 'Player 1'
        elif self.score2 >= 2:
            self.game_over = True
            self.winner = 'Player 2'

    def reset_ball(self):
        self.ball_x = self.canvas_width / 2
        self.ball_y = self.canvas_height / 2
        self.ball_speed_x = -self.ball_speed_x
        self.ball_speed_y = 5 if random.random() > 0.5 else -5

    def get_state(self):
        return {
            'ball_x': self.ball_x,
            'ball_y': self.ball_y,
            'paddle1_y': self.paddle1_y,
            'paddle2_y': self.paddle2_y,
            'score1': self.score1,
            'score2': self.score2,
            'game_over': self.game_over,
            'winner': self.winner
        }