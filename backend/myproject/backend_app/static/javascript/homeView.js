import { navigateTo } from './router.js';
import { logout, joinGameRoom } from './apiServices.js';
export function homeView() {
    console.log('homeView');
    const app = document.getElementById('app');
    const username = JSON.parse(localStorage.getItem('user')).name;
    
    if (!username) {
        // navigate('/login');
        return;
    }

    app.innerHTML = `
        <h1 class="text-center mb-4">Welcome, ${username}!</h1>
        <div class="text-center">
            <button id="join-game-btn" class="btn btn-primary mb-2">Join Game Room</button>
            <button id="set-ai-play-btn" data-clicked="false" class="btn btn-primary mb-2">Set AI play</button>
            <button id="logout-btn" class="btn btn-danger">Logout</button>
        </div>
    `;
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('join-game-btn').addEventListener('click', async () => {
        const isClickedStr = document.getElementById('set-ai-play-btn').getAttribute('data-clicked');
        const isClicked = isClickedStr == "false" ? false : true;
        try {
            const response = await joinGameRoom(isClicked);
            const roomId = response.id;
            console.log('navigate to game room:', roomId);
            // navigate(`/game-room/${roomId}`);
        } catch (error) {
            console.error('Error joining game room:', error);
            alert('Failed to join game room. Please try again.');
        }
    });
    document.getElementById('set-ai-play-btn').addEventListener('click', () => {
        document.getElementById('set-ai-play-btn').classList.add('btn-dark');
        document.getElementById('set-ai-play-btn').setAttribute('data-clicked', 'true');
    });
}
