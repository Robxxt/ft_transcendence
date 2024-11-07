import { navigateTo } from "./router.js";

class PongGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Game objects
        this.paddleHeight = 80;
        this.paddleWidth = 10;
        this.ballSize = 8;
        
        // Initial positions
        this.leftPaddle = { x: 50, y: canvas.height/2, score: 0 };
        this.rightPaddle = { x: canvas.width - 50, y: canvas.height/2, score: 0 };
        this.ball = {
            x: canvas.width/2,
            y: canvas.height/2,
            dx: 5,
            dy: 3
        };
        
        // Game state
        this.gameLoop = null;
        this.gameStarted = false;
        
        // Paddle movement
        this.keyState = {};
        
        // Bind event listeners
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(e) {
        this.keyState[e.key.toLowerCase()] = true;
        if (!this.gameStarted) {
            this.start();
        }
    }
    
    handleKeyUp(e) {
        this.keyState[e.key.toLowerCase()] = false;
    }
    
    start() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.gameLoop = setInterval(() => this.update(), 1000/60); // 60 FPS
        }
    }
    
    update() {
        // Move paddles
        if (this.keyState['w']) this.leftPaddle.y = Math.max(this.paddleHeight/2, this.leftPaddle.y - 5);
        if (this.keyState['s']) this.leftPaddle.y = Math.min(this.canvas.height - this.paddleHeight/2, this.leftPaddle.y + 5);
        if (this.keyState['o']) this.rightPaddle.y = Math.max(this.paddleHeight/2, this.rightPaddle.y - 5);
        if (this.keyState['l']) this.rightPaddle.y = Math.min(this.canvas.height - this.paddleHeight/2, this.rightPaddle.y + 5);
        
        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with top and bottom
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
            this.ball.dy *= -1;
        }
        
        // Ball collision with paddles
        if (this.checkPaddleCollision(this.leftPaddle) || this.checkPaddleCollision(this.rightPaddle)) {
            this.ball.dx *= -1.1; // Increase speed slightly
        }
        
        // Score points
        if (this.ball.x <= 0) {
            this.rightPaddle.score++;
            this.resetBall('left');
        } else if (this.ball.x >= this.canvas.width) {
            this.leftPaddle.score++;
            this.resetBall('right');
        }
        
        // Check win condition
        if (this.leftPaddle.score >= 3 || this.rightPaddle.score >= 3) {
            this.gameOver();
        }
        
        this.draw();
    }
    
    checkPaddleCollision(paddle) {
        return this.ball.x >= paddle.x - this.paddleWidth/2 &&
               this.ball.x <= paddle.x + this.paddleWidth/2 &&
               this.ball.y >= paddle.y - this.paddleHeight/2 &&
               this.ball.y <= paddle.y + this.paddleHeight/2;
    }
    
    resetBall(direction) {
        this.ball.x = this.canvas.width/2;
        this.ball.y = this.canvas.height/2;
        this.ball.dx = direction === 'left' ? 5 : -5;
        this.ball.dy = (Math.random() * 6) - 3;
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.gameStarted = false;
        
        // Draw winner message
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        const winner = this.leftPaddle.score >= 3 ? 'Opponent' : 'Challenger';
        this.ctx.fillText(`${winner} Wins!`, this.canvas.width/2 - 100, this.canvas.height/2);
        
        // Restart game after delay
        setTimeout(() => {
            this.leftPaddle.score = 0;
            this.rightPaddle.score = 0;
            this.resetBall('left');
        }, 3000);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw paddles
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.leftPaddle.x - this.paddleWidth/2, 
                         this.leftPaddle.y - this.paddleHeight/2, 
                         this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.rightPaddle.x - this.paddleWidth/2, 
                         this.rightPaddle.y - this.paddleHeight/2, 
                         this.paddleWidth, this.paddleHeight);
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw scores
        this.ctx.font = '48px Arial';
        this.ctx.fillText(this.leftPaddle.score, this.canvas.width/4, 50);
        this.ctx.fillText(this.rightPaddle.score, 3 * this.canvas.width/4, 50);
        
        // Draw center line
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width/2, 0);
        this.ctx.lineTo(this.canvas.width/2, this.canvas.height);
        this.ctx.stroke();
    }
}

export async function loadPage(app) {
    // Get the players from localStorage
    const players = JSON.parse(localStorage.getItem('localGamePlayers'));
    if (!players) {
        console.error('No players found');
        navigateTo('/pong');
        return;
    }

    const challenger = players.challenger;
    const opponent = players.opponent;

    // fetch basic html
    fetch("/static/html/localGame.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        })
        .then(html => {
            app.innerHTML = html;
            
            // Update the game title with players
            const gameTitle = app.querySelector('#game-title');
            gameTitle.innerHTML = `
                <span class="text-primary">Challenger ${challenger}</span>
                <span class="text-white">vs.</span>
                <span class="text-danger">Opponent ${opponent}</span>
            `;
    
            // Set up hover functionality for the manual
            const manualTrigger = app.querySelector('.manual-trigger');
            const gameManual = new bootstrap.Collapse(document.getElementById('gameManual'), {
                toggle: false
            });
    
            manualTrigger.addEventListener('mouseenter', () => {
                gameManual.show();
            });
    
            manualTrigger.addEventListener('mouseleave', () => {
                gameManual.hide();
            });
    
            // Initialize the game
            const canvas = document.getElementById('pongCanvas');
            const game = new PongGame(canvas);
        })
        .catch(error => {
            console.error(error);
        });
}