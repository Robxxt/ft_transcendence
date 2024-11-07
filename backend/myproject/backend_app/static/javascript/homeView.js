import { navigateTo } from './router.js';
import { joinGameRoom } from './apiServices.js';

async function getFriendsList() {
    try {
        const response = await fetch('/api/friendList/', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch friends');
        return await response.json();
    } catch (error) {
        console.error('Error fetching friends:', error);
        return [];
    }
}

export function homeView() {
    const app = document.getElementById('app');
    const username = JSON.parse(localStorage.getItem('user')).name;

    if (!username) {
        console.log("no name")
        return;
    }

    app.innerHTML = `
        <h1 class="text-center mb-4">Welcome, ${username}!</h1>
        <div class="text-center">
            <button id="local-game-btn" class="btn btn-primary mb-2">Local Game</button>
            <button id="join-game-btn" class="btn btn-primary mb-2">Online Game</button>
            <button id="set-ai-play-btn" data-clicked="false" class="btn btn-primary mb-2">Set AI play</button>
            <button id="tournament-btn" class="btn btn-primary mb-2r">Local Tournament</button>
        </div>

        <!-- Local Game Modal -->
        <div class="modal fade" id="localGameModal" tabindex="-1" aria-labelledby="localGameModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="localGameModalLabel">Select Opponent</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="localGameForm">
                            <div class="mb-3">
                                <label for="opponent" class="form-label">Choose your opponent:</label>
                                <select class="form-select" id="opponent" required>
                                    <option value="" selected disabled>Loading opponents...</option>
                                </select>
                            </div>
                            <div class="text-end">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" class="btn btn-primary">Play</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize the Bootstrap modal
    const localGameModal = new bootstrap.Modal(document.getElementById('localGameModal'));

    // Add event listener for local game button
    document.getElementById('local-game-btn').addEventListener('click', () => {
        localGameModal.show();
    });

    document.getElementById('tournament-btn').addEventListener('click', () => {
        navigateTo('/tournaments');
    });

    document.getElementById('join-game-btn').addEventListener('click', async () => {
        const isClickedStr = document.getElementById('set-ai-play-btn').getAttribute('data-clicked');
        const isClicked = isClickedStr == "false" ? false : true;
        try {
            const response = await joinGameRoom(isClicked);
            const roomId = response.id;
            console.log('navigate to game room:', roomId);
            navigateTo(`/game-room/${roomId}`);
        } catch (error) {
            console.error('Error joining game room:', error);
            alert('Failed to join game room. Please try again.');
        }
    });

    document.getElementById('set-ai-play-btn').addEventListener('click', () => {
        document.getElementById('set-ai-play-btn').classList.add('btn-dark');
        document.getElementById('set-ai-play-btn').setAttribute('data-clicked', 'true');
    });

    // Load friends list when modal is shown
    document.getElementById('localGameModal').addEventListener('show.bs.modal', async () => {
        const opponentSelect = document.getElementById('opponent');
        opponentSelect.innerHTML = '<option value="" selected disabled>Loading opponents...</option>';
        
        const friends = await getFriendsList();
        opponentSelect.innerHTML = `
            <option value="" selected disabled>Select an opponent</option>
            ${friends.map(friend => `<option value="${friend.id}">${friend.username}</option>`).join('')}
        `;
    });

    document.getElementById('localGameForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get the current user's name from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const challenger = currentUser.name;

        // Get the selected opponent from the dropdown
        const opponentSelect = document.getElementById('opponent');
        const opponent = opponentSelect.options[opponentSelect.selectedIndex].text;

        // Save both players to localStorage
        const gamePlayers = {
            challenger: challenger,
            opponent: opponent
        };
        localStorage.setItem('localGamePlayers', JSON.stringify(gamePlayers));

        // Close modal and navigate
        localGameModal.hide();
        navigateTo('/local-game');
    });
}