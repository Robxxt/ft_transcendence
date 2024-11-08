import { apiRequest, API_BASE_URL } from './apiServices.js';
import { navigateTo } from './router.js';


const WEBSOCKET_BASE_URL = `ws://${window.location.host}`;
let currentGameSocket = null;
let currentChatSocket = null;
let keyListenerAttached = false;
let gameRoomData = null;

export async function gameRoomView(roomId) {
    const app = document.getElementById('app');

    try {
        // Clean up previous game state
        cleanupGameRoom();
        
        console.log("trying to access!");
        const [templateHtml, data] = await Promise.all([
            fetchTemplate('/static/html/gameRoom.html'),
            fetchGameRoomData(roomId)
        ]);

        gameRoomData = data;
        renderGameRoom(app, templateHtml, roomId, data);
        
        await waitForDOMElements(['pong-canvas', 'start-game-btn', 'start-game-btn-container']);
        
        setupGame(roomId, data);
        setupChatWebSocket(roomId, data);
        updateRoomState(data.state);
    } catch (error) {
        handleError(app, error);
    }
}

// Helper function to wait for DOM elements
function waitForDOMElements(elementIds, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function checkElements() {
            const allElementsPresent = elementIds.every(id => document.getElementById(id));
            
            if (allElementsPresent) {
                resolve();
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                reject(new Error(`Timeout waiting for elements: ${elementIds.join(', ')}`));
                return;
            }
            
            // Check again in 50ms
            setTimeout(checkElements, 50);
        }
        
        checkElements();
    });
}

function cleanupGameRoom() {
    // Close existing WebSocket connections
    if (currentGameSocket) {
        currentGameSocket.close();
        currentGameSocket = null;
    }
    if (currentChatSocket) {
        currentChatSocket.close();
        currentChatSocket = null;
    }

    // Remove existing key event listener
    if (keyListenerAttached) {
        document.removeEventListener('keydown', handleKeyPress);
        keyListenerAttached = false;
    }
    
    // Reset game data
    gameRoomData = null;
}


async function fetchTemplate(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load template');
    return response.text();
}

async function fetchGameRoomData(roomId) {
    const response = await apiRequest(`/api/game-room/${roomId}/`, 'GET'); // NO Idea y but I had to hardcode it even if in cosole log looks correct
    if (!response.ok) throw new Error('Failed to fetch game room data');
    return response.json();
}

function renderGameRoom(app, templateHtml, roomId, data) {
    app.innerHTML = templateHtml;
    document.getElementById('room-id').textContent = roomId;
    document.getElementById('username').textContent = data.current_user?.display_name || 'Unknown Player';
}

function updateRoomState(state) {
    const waitingOverlay = document.getElementById('waiting-overlay');
    waitingOverlay.classList.toggle('d-none', state !== 'WA');
}

function handleError(app, error) {
    console.error('Error:', error);
    app.innerHTML = `
        <div class="container">
            <p class="text-center text-danger">Error loading game room: ${error.message}</p>
            <p class="text-center">Please try again or check the console for more details.</p>
        </div>
    `;
}

function setupGame(roomId, data) {
    currentGameSocket = new WebSocket(`${WEBSOCKET_BASE_URL}/ws/game/${roomId}/`);
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');

    currentGameSocket.onopen = () => {
        console.log("Game WebSocket connection established.");
        setupGameControls(currentGameSocket, data);
    };

    currentGameSocket.onmessage = (event) => handleGameMessage(event, ctx, canvas);
    currentGameSocket.onerror = (event) => console.error("Game WebSocket error:", event);
    currentGameSocket.onclose = () => console.log("Game WebSocket connection closed.");
}

function showDisconnectedOverlay() {
    const disconnectedOverlay = document.getElementById('disconnected-overlay');
    disconnectedOverlay.classList.remove('d-none');
    
    // Add click event to return home button
    const returnHomeBtn = document.getElementById('return-home-btn');
    returnHomeBtn.addEventListener('click', () => {
        navigateTo('/start');  // Use the navigateTo function to handle routing
    });
}

function showWinnerOverlay(winner) {
    const winnerOverlay = document.getElementById('winner-overlay');
    winnerOverlay.classList.remove('d-none');
    const winnerDisplay = document.getElementById('winner-display');
    winnerDisplay.textContent = `${winner} wins the game!`;
    // Add click event to return home button
    const returnHomeBtn = document.getElementById('winner-home-btn');
    returnHomeBtn.addEventListener('click', () => {
        navigateTo('/start');  // Use the navigateTo function to handle routing
    });
}



function handleGameMessage(event, ctx, canvas) {
    const data = JSON.parse(event.data);
    console.log("Game WebSocket message received:", data);

    if (data.action === 'game_state_update') {
        updateGameState(data.game_state, ctx, canvas);
        updateStartGameButton(
            data.game_state.game_state,
            gameRoomData.current_user.player_number,
            data.game_state.player1_ready,
            data.game_state.player2_ready,
            data.game_state.player_names
        );
        if (data.game_state.disconnected) {
            showDisconnectedOverlay();
        }
        if (data.game_state.game_state === 'FINISHED') {
            showWinnerOverlay(data.game_state.winner_display_name);
        }
    } else if (data.action === 'room_state_update') {
        updateRoomState(data.state);
    }
}

function updateGameState(gameState, ctx, canvas) {
        const paddleWidth = gameState.paddle_width * canvas.width;
        const paddleHeight = gameState.paddle_height * canvas.height;
        const paddleOffset = gameState.paddle_offset * canvas.width;
        const ballRadius = gameState.ball_radius * canvas.height;
    
        // Fill the canvas with black
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        // Draw paddles
        ctx.fillStyle = 'white';
        // Left paddle (paddle1)
        ctx.fillRect(
            paddleOffset, 
            (gameState.paddle1_y * canvas.height) - (paddleHeight / 2), 
            paddleWidth, 
            paddleHeight
        );
        // Right paddle (paddle2)
        ctx.fillRect(
            canvas.width - paddleWidth - paddleOffset, 
            (gameState.paddle2_y * canvas.height) - (paddleHeight / 2), 
            paddleWidth, 
            paddleHeight
        );
    
        // Draw ball
        ctx.beginPath();
        ctx.arc(gameState.ball_x * canvas.width, gameState.ball_y * canvas.height, ballRadius, 0, Math.PI * 2);
        ctx.fill();
    
        // Draw scores
        ctx.font = '24px Arial';
        ctx.fillText(gameState.score1, canvas.width / 4, 30);
        ctx.fillText(gameState.score2, 3 * canvas.width / 4, 30);
    
        if (gameState.speed_boost_active) {
            ctx.fillStyle = 'yellow';
            ctx.font = '20px Arial';
            ctx.fillText('SPEED BOOST!', canvas.width / 2 - 60, 20);
        }
        // Check if game is finished
        if (gameState.game_state === 'FINISHED') {
            ctx.fillStyle = 'red';
            ctx.font = '48px Arial';
            ctx.fillText(`${gameState.winner_display_name} wins!`, canvas.width / 2 - 100, canvas.height / 2);
        }
    }


    function setupGameControls(gameSocket, data) {
        // Remove existing listener if it exists
        if (keyListenerAttached) {
            document.removeEventListener('keydown', handleKeyPress);
        }
        
        // Create a bound version of handleKeyPress that includes gameSocket and data
        const keyPressHandler = (event) => handleKeyPress(event, gameSocket, data);
        document.addEventListener('keydown', keyPressHandler);
        keyListenerAttached = true;
        
        setupStartGameButton(gameSocket, data);
    }

    function handleKeyPress(event, gameSocket, data) {
        if (!gameSocket || gameSocket.readyState !== WebSocket.OPEN || !gameRoomData) {
            return;
        }
    
        const actions = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            ' ': 'activate_speed_boost'
        };
    
        const action = actions[event.key];
        if (action) {
            gameSocket.send(JSON.stringify({
                action: action === 'activate_speed_boost' ? 'activate_speed_boost' : 'move_paddle',
                game_action: action,
                player: data.current_user.player_number
            }));
        }
    }

function setupStartGameButton(gameSocket, data) {
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            if (!startGameBtn.disabled) {
                gameSocket.send(JSON.stringify({
                    action: 'start_game',
                    player: data.current_user.player_number,
                }));
            }
        });
    } else {
        console.error("Start game button not found in the DOM");
    }
}

function updateStartGameButton(gameState, playerNumber, player1Ready, player2Ready, playerNames) {
    const startGameBtn = document.getElementById('start-game-btn');
    const startGameBtnContainer = document.getElementById('start-game-btn-container');
    
    if (!startGameBtn || !startGameBtnContainer) {
        console.error("Start game button or its container not found in the DOM");
        return;
    }
    
    console.log("Updating button state:", { gameState, playerNumber, player1Ready, player2Ready, playerNames });

    // debug
    console.log("debug " + gameState);

    if (gameState === 'FINISHED') {
        // Remove the button when the game is finished
        startGameBtnContainer.innerHTML = '';
        console.log("Game finished, button removed");
    } else if (gameState === 'PLAYING') {
        startGameBtn.disabled = true;
        startGameBtn.textContent = 'Game in Progress';
        startGameBtn.style.display = 'inline-block';
    } else {
        startGameBtn.style.display = 'inline-block';
        if (playerNumber === 1) {
            startGameBtn.disabled = player1Ready;
            startGameBtn.textContent = player1Ready ? `Waiting for ${playerNames['2']}` : 'Start Game';
        } else if (playerNumber === 2) {
            startGameBtn.disabled = player2Ready;
            startGameBtn.textContent = player2Ready ? `Waiting for ${playerNames['1']}` : 'Start Game';
        }
    }
}

// Chat WebSocket setup
function setupChatWebSocket(roomId, data) {
    currentChatSocket = new WebSocket(`${WEBSOCKET_BASE_URL}/ws/game-room/${roomId}/`);
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message-btn');

    currentChatSocket.onopen = () => console.log("Chat WebSocket connection established.");
    currentChatSocket.onmessage = (event) => handleChatMessage(event, chatMessages);
    currentChatSocket.onerror = (event) => console.error("Chat WebSocket error:", event);
    currentChatSocket.onclose = () => console.log("Chat WebSocket connection closed.");

    sendMessageBtn.addEventListener('click', () => sendMessage(currentChatSocket, chatInput, data));
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage(currentChatSocket, chatInput, data);
        }
    });
}

function handleChatMessage(event, chatMessages) {
    const data = JSON.parse(event.data);
    console.log("Chat WebSocket message received:", data);

    chatMessages.innerHTML += `
        <div class="card mb-2">
            <div class="card-body py-2">
                <p class="card-text mb-0">
                    <strong>${data.username}</strong> (${data.timestamp}): ${data.message}
                </p>
            </div>
        </div>
    `;

    // Scroll to the bottom of the chat
    const chatContainer = document.getElementById('chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function sendMessage(chatSocket, chatInput, data) {
    const message = chatInput.value.trim();
    if (message) {
        chatSocket.send(JSON.stringify({
            'username': data.current_user.display_name,
            'message': message,
            'timestamp': new Date().toLocaleTimeString()
        }));
        chatInput.value = '';
    }
}

export function getGameRoomData() {
    return gameRoomData;
}