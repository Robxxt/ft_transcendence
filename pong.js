// pong.js
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
    }
  
    update() {
      this.moveBall();
      this.checkCollisions();
      this.moveComputerPaddle();
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
        this.resetBall();
      } else if (this.ballX > this.canvas.width) {
        this.score1++;
        this.resetBall();
      }
    }
  
    moveComputerPaddle() {
      const paddleCenter = this.paddle2Y + this.paddleHeight / 2;
      if (paddleCenter < this.ballY - 35) {
        this.paddle2Y += 6;
      } else if (paddleCenter > this.ballY + 35) {
        this.paddle2Y -= 6;
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
    }
  
    handleMouseMove(event) {
      const rect = this.canvas.getBoundingClientRect();
      const mouseY = event.clientY - rect.top - this.paddleHeight / 2;
      this.paddle1Y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, mouseY));
    }
  
    start() {
      this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
      this.gameLoop();
    }
  
    gameLoop() {
      this.update();
      this.draw();
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
  
  // Export the PongGame class
export default PongGame;

export function loadPage(app) {
    // document.getElementById('app').innerHTML = `
    app.innerHTML = `
      <div class="container mt-5">
        <h1 class="text-center mb-4">Pong Game</h1>
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