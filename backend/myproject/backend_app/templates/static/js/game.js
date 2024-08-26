const gameBoard = document.getElementById('game-board');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const ball = document.getElementById('ball');
const player1Score = document.getElementById('player1-score');
const player2Score = document.getElementById('player2-score');

let gameState = {
    player1Position: 0.5,
    player2Position: 0.5,
    ballX: 0.5,
    ballY: 0.5,
    ballDX: 0.01,
    ballDY: 0.01,
    player1Score: 0,
    player2Score: 0,
    isActive: false
};

function updateGameState(newState) {
    gameState = { ...gameState, ...newState };
    updateDisplay();
}

function updateDisplay() {
    player1.style.top = `${gameState.player1Position * 100}%`;
    player2.style.top = `${gameState.player2Position * 100}%`;
    ball.style.left = `${gameState.ballX * 100}%`;
    ball.style.top = `${gameState.ballY * 100}%`;
    player1Score.textContent = gameState.player1Score;
    player2Score.textContent = gameState.player2Score;
}

document.addEventListener('keydown', (event) => {
    if (!gameState.isActive) return;

    switch (event.key) {
        case 'ArrowUp':
            gameState.player1Position = Math.max(0, gameState.player1Position - 0.05);
            break;
        case 'ArrowDown':
            gameState.player1Position = Math.min(1, gameState.player1Position + 0.05);
            break;
        case 'w':
            gameState.player2Position = Math.max(0, gameState.player2Position - 0.05);
            break;
        case 's':
            gameState.player2Position = Math.min(1, gameState.player2Position + 0.05);
            break;
    }
    updateDisplay();
});

// This function will be called by the WebSocket to update the game state
function receiveGameState(newState) {
    updateGameState(newState);
}