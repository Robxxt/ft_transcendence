import { navigateTo } from "./router.js";

export async function updateWinLoss(winnerName, players) {
    const loserName = winnerName === players.challenger ? players.opponent : players.challenger;
    
    const payload = {
        winner_name: winnerName,
        loser_name: loserName
    };

    try {
        const response = await fetch('/api/update-win-loss', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating win/loss stats:', error);
        throw error;
    }
}

export async function sendGameResultToApi(gameResult, players) {
    const challengerName = players.challenger;
    const opponentName = players.opponent;
    
    const winnerName = gameResult.winner === players.challengerDisplayName ? 
        challengerName : opponentName;

    const payload = {
        challenger_name: challengerName,
        opponent_name: opponentName,
        winner_name: winnerName,
        challenger_score: gameResult.scores[players.challengerDisplayName],
        opponent_score: gameResult.scores[players.opponentDisplayName],
        timestamp_created: gameResult.timestamp_created,
        timestamp_finish: gameResult.timestamp_finish
    };
    console.log('Sending game result to API:', payload);

    try {
        const response = await fetch('/api/save-local-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving game result:', error);
        throw error;
    }
}

 export class PongGame {
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
        this.challengerDisplayName = players?.challengerDisplayName || 'Challenger';
        this.opponentDisplayName = players?.opponentDisplayName || 'Opponent';
        this.timestamp_created = new Date().toISOString();
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        if (localStorage.getItem('gameState')) {
            this.rightPaddle.score = JSON.parse(localStorage.getItem('gameState')).right_score;
            this.leftPaddle.score = JSON.parse(localStorage.getItem('gameState')).left_score;
            this.checkScore(false);
        }
        const gameState = {
            right_score: this.rightPaddle.score,
            left_score: this.leftPaddle.score,
        };
        localStorage.setItem('gameState', JSON.stringify(gameState));
        this.draw();
    }
    
    handleKeyDown(e) {
        this.keyState[e.key.toLowerCase()] = true;
        if (!this.gameStarted  && e.key.toLowerCase() === 'r') {
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
            this.draw();
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
        // if (this.checkPaddleCollision(this.leftPaddle) || this.checkPaddleCollision(this.rightPaddle)) {
        //     this.ball.dx *= -1.1;
        // }
        if (this.checkLeftPaddleCollision() || this.checkRightPaddleCollision()) {
            this.ball.dx *= -1.1;
        }
        
        this.checkScore(true);
        
        this.draw();
    }

    checkScore(store) {
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
            this.gameOver(store);
        }
    }
    checkLeftPaddleCollision() {
        const ballLeft = this.ball.x - this.ballSize/2;
        if (ballLeft <= this.leftPaddle.x + this.paddleWidth/2 &&
            ballLeft >= this.leftPaddle.x - this.paddleWidth/2 &&
            this.ball.y >= this.leftPaddle.y - this.paddleHeight/2 &&
            this.ball.y <= this.leftPaddle.y + this.paddleHeight/2) {
            const relativeIntersectY = (this.ball.y - this.leftPaddle.y) / (this.paddleHeight/2);
            this.ball.dy = relativeIntersectY * 5;
            return true;
        }
    }
    
    checkRightPaddleCollision() {
        const ballRight = this.ball.x + this.ballSize/2;
        if (ballRight >= this.rightPaddle.x - this.paddleWidth/2 &&
            ballRight <= this.rightPaddle.x + this.paddleWidth/2 &&
            this.ball.y >= this.rightPaddle.y - this.paddleHeight/2 &&
            this.ball.y <= this.rightPaddle.y + this.paddleHeight/2) {
            const relativeIntersectY = (this.ball.y - this.rightPaddle.y) / (this.paddleHeight/2);
            this.ball.dy = relativeIntersectY * 5;
            return true;
        }
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
    
    gameOver(store) {
        console.log('Game Over');
        this.isGameOver = true;
        const isLeftPaddleWinner = this.leftPaddle.score >= 3;
        this.winner = isLeftPaddleWinner ? this.challengerDisplayName : this.opponentDisplayName;
        
        const gameResult = {
            winner: this.winner,
            scores: {
                [this.challengerDisplayName]: this.leftPaddle.score,
                [this.opponentDisplayName]: this.rightPaddle.score
            },
            timestamp_created: this.timestamp_created,
            timestamp_finish: new Date().toISOString()
        };
        
        localStorage.setItem('gameResults', JSON.stringify(gameResult));
        
        if (store) {
            const players = JSON.parse(localStorage.getItem('localGamePlayers'));
            
            sendGameResultToApi(gameResult, players)
                .catch(error => console.error('Failed to save game result:', error));
                
            const winnerName = gameResult.winner === players.challengerDisplayName ? 
                players.challenger : players.opponent;
                
            updateWinLoss(winnerName, players)
                .catch(error => console.error('Failed to update win/loss stats:', error));
        }
        
        const overlay = document.getElementById('gameOverOverlay');
        const winnerMessage = document.getElementById('winnerMessage');
        winnerMessage.textContent = `${this.winner} Wins!`;
        overlay.classList.remove('d-none');
        
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
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.leftPaddle.x - this.paddleWidth/2, 
                         this.leftPaddle.y - this.paddleHeight/2, 
                         this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.rightPaddle.x - this.paddleWidth/2, 
                         this.rightPaddle.y - this.paddleHeight/2, 
                         this.paddleWidth, this.paddleHeight);
        
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.font = '48px Arial';
        this.ctx.fillText(this.leftPaddle.score, this.canvas.width/4, 50);
        this.ctx.fillText(this.rightPaddle.score, 3 * this.canvas.width/4, 50);
        
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width/2, 0);
        this.ctx.lineTo(this.canvas.width/2, this.canvas.height);
        this.ctx.stroke();

        if (this.isGameOver && this.winner) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${this.winner} Wins!`, this.canvas.width/2, this.canvas.height/2);
            this.ctx.textAlign = 'start';
        }
    }
}

