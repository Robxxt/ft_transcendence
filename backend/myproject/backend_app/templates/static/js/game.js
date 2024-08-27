class PongGame {
    constructor() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = {};
        this.keys = {
            w: false,
            s: false,
            arrowUp: false,
            arrowDown: false,
            space: false,
        };

        this.socket = new WebSocket(`ws://${window.location.host}/ws/game/`);
        this.socket.onmessage = (e) => this.handleServerMessage(JSON.parse(e.data));
        this.socket.onopen = () => console.log('WebSocket connection opened');
        this.socket.onclose = () => console.log('WebSocket connection closed');
        this.socket.onerror = (error) => console.error('WebSocket error:', error);

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        console.log('PongGame initialized');
    }

    handleServerMessage(data) {
        console.log('Received server message:', data);
        this.gameState = data;
        this.draw();
    }

    handleKeyDown(e) {
        console.log('Key down:', e.key);
        if (e.key === 'w') this.keys.w = true;
        if (e.key === 's') this.keys.s = true;
        if (e.key === 'ArrowUp') this.keys.arrowUp = true;
        if (e.key === 'ArrowDown') this.keys.arrowDown = true;
        if (e.key === 'space') this.keys.space = true;

        this.sendPaddlePosition();
    }

    handleKeyUp(e) {
        console.log('Key up:', e.key);
        if (e.key === 'w') this.keys.w = false;
        if (e.key === 's') this.keys.s = false;
        if (e.key === 'ArrowUp') this.keys.arrowUp = false;
        if (e.key === 'ArrowDown') this.keys.arrowDown = false;
        if (e.key === 'space') {
            this.keys.space = false;
            if (this.gameState.game_state === 'waiting' || this.gameState.game_state === 'scored') {
                console.log('Sending start_game action');
                this.socket.send(JSON.stringify({ action: 'start_game' }));
            }
        }
    }

    sendPaddlePosition() {
        if (this.keys.w || this.keys.s) {
            let newPosition = this.gameState.paddle1_y;
            if (this.keys.w) newPosition -= 0.02;
            if (this.keys.s) newPosition += 0.02;
            console.log('Sending move_paddle action for player 1:', newPosition);
            this.socket.send(JSON.stringify({ action: 'move_paddle', player: 1, position: newPosition }));
        }
        if (this.keys.arrowUp || this.keys.arrowDown) {
            let newPosition = this.gameState.paddle2_y;
            if (this.keys.arrowUp) newPosition -= 0.02;
            if (this.keys.arrowDown) newPosition += 0.02;
            console.log('Sending move_paddle action for player 2:', newPosition);
            this.socket.send(JSON.stringify({ action: 'move_paddle', player: 2, position: newPosition }));
        }
    }

    draw() {
        console.log('Drawing game state:', this.gameState);
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw paddles
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(10, this.gameState.paddle1_y * this.canvas.height, 10, 80);
        this.ctx.fillRect(this.canvas.width - 20, this.gameState.paddle2_y * this.canvas.height, 10, 80);

        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.gameState.ball_x * this.canvas.width, this.gameState.ball_y * this.canvas.height, 10, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw scores
        this.ctx.font = '30px Arial';
        this.ctx.fillText(this.gameState.score1, 100, 50);
        this.ctx.fillText(this.gameState.score2, this.canvas.width - 100, 50);

        // Draw game state messages
        this.ctx.textAlign = 'center';
        if (this.gameState.game_state === 'waiting') {
            this.ctx.fillText('Press Space to Start', this.canvas.width / 2, this.canvas.height / 2);
        } else if (this.gameState.game_state === 'scored') {
            this.ctx.fillText('Point Scored! Press Space to Continue', this.canvas.width / 2, this.canvas.height / 2);
        } else if (this.gameState.winner) {
            this.ctx.fillText(`Game Over! ${this.gameState.winner} wins!`, this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    start() {
        console.log('Starting game loop');
        setInterval(() => {
            if (this.gameState.is_active) {
                console.log('Sending update_game action');
                this.socket.send(JSON.stringify({ action: 'update_game' }));
            }
        }, 1000 / 60);  // 60 FPS
    }
}
alert('Script loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const game = new PongGame();
    game.start();
});