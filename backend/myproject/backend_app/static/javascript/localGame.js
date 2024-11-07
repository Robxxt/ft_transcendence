import { navigateTo } from "./router.js";

class PongGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.paddleHeight = 80;
        this.paddleWidth = 10;
        this.ballSize = 8;
        this.leftPaddle = { x: 50, y: canvas.height/2, score: 0 };
        this.rightPaddle = { x: canvas.width - 50, y: canvas.height/2, score: 0 };
        this.ball = {
            x: canvas.width/2,
            y: canvas.height/2,
            dx: 5,
            dy: 3
        };
        this.gameLoop = null;
        this.gameStarted = false;
        this.isGameOver = false;
        this.winner = null;
        this.keyState = {};
        const players = JSON.parse(localStorage.getItem('localGamePlayers'));
        this.challenger = players?.challengerDisplayName || 'Challenger';
        this.opponent = players?.opponentDisplayName || 'Opponent';
        this.timestamp_created = new Date().toISOString();
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        if (localStorage.getItem('gameState')) {
            this.rightPaddle.score = JSON.parse(localStorage.getItem('gameState')).right_score;
            this.leftPaddle.score = JSON.parse(localStorage.getItem('gameState')).left_score;
            this.checkScore();
        }
        this.draw();
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
            this.gameLoop = setInterval(() => this.update(), 1000/60);
        }
    }
    
    update() {
        if (this.isGameOver) {
            this.draw(); // Keep drawing even after game is over
            return;
        }

        if (this.keyState['w']) this.leftPaddle.y = Math.max(this.paddleHeight/2, this.leftPaddle.y - 5);
        if (this.keyState['s']) this.leftPaddle.y = Math.min(this.canvas.height - this.paddleHeight/2, this.leftPaddle.y + 5);
        if (this.keyState['o']) this.rightPaddle.y = Math.max(this.paddleHeight/2, this.rightPaddle.y - 5);
        if (this.keyState['l']) this.rightPaddle.y = Math.min(this.canvas.height - this.paddleHeight/2, this.rightPaddle.y + 5);
        
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with top and bottom
        if (this.ball.y - this.ballSize/2 <= 0 || this.ball.y + this.ballSize/2 >= this.canvas.height) {
            this.ball.dy *= -1;
        }
        
        // Ball collision with paddles
        if (this.checkPaddleCollision(this.leftPaddle) || this.checkPaddleCollision(this.rightPaddle)) {
            this.ball.dx *= -1.1;
        }
        
        this.checkScore();
        
        this.draw();
    }

    checkScore() {
        if (this.ball.x <= 0) {
            this.rightPaddle.score++;
            this.resetGame('left');
        } else if (this.ball.x >= this.canvas.width) {
            this.leftPaddle.score++;
            this.resetGame('right');
        }
        const gameState = {
            right_score: this.rightPaddle.score,
            left_score: this.leftPaddle.score,
        };
        localStorage.setItem('gameState', JSON.stringify(gameState));
        if (this.leftPaddle.score >= 3 || this.rightPaddle.score >= 3) {
            this.gameOver();
        }
    }
    
    checkPaddleCollision(paddle) {
        return this.ball.x >= paddle.x - this.paddleWidth/2 &&
               this.ball.x <= paddle.x + this.paddleWidth/2 &&
               this.ball.y >= paddle.y - this.paddleHeight/2 &&
               this.ball.y <= paddle.y + this.paddleHeight/2;
    }
    
    resetGame(direction) {
        this.ball.x = this.canvas.width/2;
        this.ball.y = this.canvas.height/2;
        this.ball.dx = direction === 'left' ? 5 : -5;
        this.ball.dy = (Math.random() * 6) - 3;
        this.leftPaddle.y = this.canvas.height/2;
        this.rightPaddle.y = this.canvas.height/2;
        this.gameStarted = false;
        clearInterval(this.gameLoop);
    }
    
    gameOver() {
        console.log('Game Over');
        this.isGameOver = true;
        const isLeftPaddleWinner = this.leftPaddle.score >= 3;
        this.winner = isLeftPaddleWinner ? this.opponent : this.challenger;
        
        // Create game result object with both timestamps
        const gameResult = {
            winner: this.winner,
            scores: {
                [this.challenger]: isLeftPaddleWinner ? this.leftPaddle.score : this.rightPaddle.score,
                [this.opponent]: isLeftPaddleWinner ? this.rightPaddle.score : this.leftPaddle.score
            },
            timestamp_created: this.timestamp_created,
            timestamp_finish: new Date().toISOString()
        };
        
        // Store single game result (not in an array)
        localStorage.setItem('gameResults', JSON.stringify(gameResult));
        
        // Show the game over overlay
        const overlay = document.getElementById('gameOverOverlay');
        const winnerMessage = document.getElementById('winnerMessage');
        winnerMessage.textContent = `${this.winner} Wins!`;
        overlay.classList.remove('d-none');
        
        // Add event listener for the home button
        document.getElementById('homeButton').addEventListener('click', () => {
            if (localStorage.getItem('gameResults')) {
                localStorage.removeItem('gameResults');
            }
            if (localStorage.getItem('gameState')) {
                localStorage.removeItem('gameState');
            }
            navigateTo('start');
        });
        
        clearInterval(this.gameLoop);
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

        // Draw winner message if game is over
        if (this.isGameOver && this.winner) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${this.winner} Wins!`, this.canvas.width/2, this.canvas.height/2);
            this.ctx.textAlign = 'start'; // Reset text alignment
        }
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

    const challenger = players.challengerDisplayName;
    const opponent = players.opponentDisplayName;

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