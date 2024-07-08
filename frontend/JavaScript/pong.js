class PongGame {
    constructor() {
      this.canvas = document.getElementById('pongCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.ballX = this.canvas.width / 2;
      this.ballY = this.canvas.height / 2;
      this.ballSpeedX = 5;
      this.ballSpeedY = 5;
      this.paddle1Y = this.canvas.height / 2 - 50;
      this.paddle2Y = this.canvas.height / 2 - 50;
      this.score1 = 0;
      this.score2 = 0;
      this.paddleHeight = 100;
      this.paddleWidth = 10;
      this.gameOver = false;
      this.winner = null;
  
      this.keys = {
        w: false,
        s: false,
        arrowUp: false,
        arrowDown: false
      };
  
      window.addEventListener('keydown', this.handleKeyDown.bind(this));
      window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
  
    handleKeyDown(e) {
      if (e.key === 'w') this.keys.w = true;
      if (e.key === 's') this.keys.s = true;
      if (e.key === 'ArrowUp') this.keys.arrowUp = true;
      if (e.key === 'ArrowDown') this.keys.arrowDown = true;
    }
  
    handleKeyUp(e) {
      if (e.key === 'w') this.keys.w = false;
      if (e.key === 's') this.keys.s = false;
      if (e.key === 'ArrowUp') this.keys.arrowUp = false;
      if (e.key === 'ArrowDown') this.keys.arrowDown = false;
    }
  
    update() {
      if (this.gameOver) return;
  
      this.movePaddles();
      this.moveBall();
      this.checkCollisions();
    }
  
    movePaddles() {
      // Player 1 (Left paddle)
      if (this.keys.w && this.paddle1Y > 0) {
        this.paddle1Y -= 5;
      }
      if (this.keys.s && this.paddle1Y < this.canvas.height - this.paddleHeight) {
        this.paddle1Y += 5;
      }
  
      // Player 2 (Right paddle)
      if (this.keys.arrowUp && this.paddle2Y > 0) {
        this.paddle2Y -= 5;
      }
      if (this.keys.arrowDown && this.paddle2Y < this.canvas.height - this.paddleHeight) {
        this.paddle2Y += 5;
      }
    }
  
    moveBall() {
      this.ballX += this.ballSpeedX;
      this.ballY += this.ballSpeedY;
    }
  
    checkCollisions() {
      // Ball collision with top and bottom walls
      if (this.ballY < 0 || this.ballY > this.canvas.height) {
        this.ballSpeedY = -this.ballSpeedY;
      }
  
      // Ball collision with paddles
      if (
        (this.ballX < 20 && this.ballY > this.paddle1Y && this.ballY < this.paddle1Y + this.paddleHeight) ||
        (this.ballX > this.canvas.width - 20 && this.ballY > this.paddle2Y && this.ballY < this.paddle2Y + this.paddleHeight)
      ) {
        this.ballSpeedX = -this.ballSpeedX;
      }
  
      // Ball out of bounds
      if (this.ballX < 0) {
        this.score2++;
        this.checkGameOver();
        this.resetBall();
      } else if (this.ballX > this.canvas.width) {
        this.score1++;
        this.checkGameOver();
        this.resetBall();
      }
    }
  
    checkGameOver() {
      if (this.score1 >= 2) {
        this.gameOver = true;
        this.winner = 'Player 1';
      } else if (this.score2 >= 2) {
        this.gameOver = true;
        this.winner = 'Player 2';
      }
    }
  
    resetBall() {
      this.ballX = this.canvas.width / 2;
      this.ballY = this.canvas.height / 2;
      this.ballSpeedX = -this.ballSpeedX;
      this.ballSpeedY = Math.random() > 0.5 ? 5 : -5;
    }
  
    draw() {
      // Clear canvas
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
      // Draw paddles
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(10, this.paddle1Y, this.paddleWidth, this.paddleHeight);
      this.ctx.fillRect(this.canvas.width - 20, this.paddle2Y, this.paddleWidth, this.paddleHeight);
  
      // Draw ball
      this.ctx.beginPath();
      this.ctx.arc(this.ballX, this.ballY, 10, 0, Math.PI * 2);
      this.ctx.fill();
  
      // Draw scores
      this.ctx.font = '30px Arial';
      this.ctx.fillText(this.score1, 100, 50);
      this.ctx.fillText(this.score2, this.canvas.width - 100, 50);
  
      // Draw game over message
      if (this.gameOver) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Game Over! ${this.winner} wins!`, this.canvas.width / 2, this.canvas.height / 2);
      }
    }
  
    start() {
      this.gameLoop();
    }
  
    gameLoop() {
      this.update();
      this.draw();
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
  
  export default PongGame;

export function loadPage(app) {
    app.innerHTML = `
      <div class="container mt-5">
        <h1 class="text-center mb-4">Two-Player Pong Game</h1>
        <div class="row justify-content-center mb-3">
            <div class="col-auto">
                <p><strong>Player 1:</strong> Use 'W' and 'S' keys to move up and down</p>
                <p><strong>Player 2:</strong> Use 'Arrow Up' and 'Arrow Down' keys to move up and down</p>
                <p>First player to score 2 points wins!</p>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col-auto">
                <canvas id="pongCanvas" width="800" height="400"></canvas>
            </div>
        </div>
        <div class="row justify-content-center mt-3">
            <div class="col-auto">
                <button id="startButton" class="btn btn-primary">Start Game</button>
            </div>
        </div>
      </div>
    `;
    const game = new PongGame();
    const startButton = document.getElementById('startButton');

    startButton.addEventListener('click', () => {
        game.start();
        startButton.disabled = true;
    });
}