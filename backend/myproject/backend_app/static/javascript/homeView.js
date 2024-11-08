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

async function getDisplayName(foreignUsername = null) {
    try {
        const url = foreignUsername 
            ? `/api/getDisplayName/?foreignusername=${encodeURIComponent(foreignUsername)}`
            : '/api/getDisplayName/';
            
        const response = await fetch(url, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch display name');
        const data = await response.json();
        return data.display_name;
    } catch (error) {
        console.error('Error fetching display name:', error);
        return null;
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
            <button id="local-tournament-btn" class="btn btn-primary mb-2">Local Tournament</button>
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

        <!-- Local Tournament Modal -->
        <div class="modal fade" id="localTournamentModal" tabindex="-1" aria-labelledby="localTournamentModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="localTournamentModalLabel">Select Tournament Opponents</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="localTournamentForm">
                            <div class="mb-3">
                                <label for="opponent1" class="form-label">First Opponent:</label>
                                <select class="form-select tournament-opponent" id="opponent1" required>
                                    <option value="" selected disabled>Loading opponents...</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="opponent2" class="form-label">Second Opponent:</label>
                                <select class="form-select tournament-opponent" id="opponent2" required>
                                    <option value="" selected disabled>Loading opponents...</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="opponent3" class="form-label">Third Opponent:</label>
                                <select class="form-select tournament-opponent" id="opponent3" required>
                                    <option value="" selected disabled>Loading opponents...</option>
                                </select>
                            </div>
                            <div id="tournament-error" class="alert alert-danger d-none">
                                Please select three different opponents
                            </div>
                            <div class="text-end">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="submit" class="btn btn-primary">Start Tournament</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize the Bootstrap modal
    const localGameModal = new bootstrap.Modal(document.getElementById('localGameModal'));
    const localTournamentModal = new bootstrap.Modal(document.getElementById('localTournamentModal'));

    // Add event listener for local game button
    document.getElementById('local-game-btn').addEventListener('click', () => {
        localGameModal.show();
    });

    document.getElementById('local-tournament-btn').addEventListener('click', () => {
        localTournamentModal.show();
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

    document.getElementById('localTournamentModal').addEventListener('show.bs.modal', async () => {
        const opponents = document.querySelectorAll('.tournament-opponent');
        opponents.forEach(select => {
            select.innerHTML = '<option value="" selected disabled>Loading opponents...</option>';
        });
        
        const friends = await getFriendsList();
        const optionsHTML = `
            <option value="" selected disabled>Select an opponent</option>
            ${friends.map(friend => `<option value="${friend.id}">${friend.username}</option>`).join('')}
        `;
        
        opponents.forEach(select => {
            select.innerHTML = optionsHTML;
        });
    });


    document.getElementById('localGameForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get the current user's name and display name
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const challenger = currentUser.name;
        const challengerDisplayName = await getDisplayName();

        // Get the selected opponent from the dropdown
        const opponentSelect = document.getElementById('opponent');
        const opponent = opponentSelect.options[opponentSelect.selectedIndex].text;
        const opponentDisplayName = await getDisplayName(opponent);

        // Save both players to localStorage with their display names
        const gamePlayers = {
            challenger: challenger,
            challengerDisplayName: challengerDisplayName || challenger, // fallback to username if display name fetch fails
            opponent: opponent,
            opponentDisplayName: opponentDisplayName || opponent // fallback to username if display name fetch fails
        };
        localStorage.setItem('localGamePlayers', JSON.stringify(gamePlayers));
        if (localStorage.getItem('gameResults')) {
            localStorage.removeItem('gameResults');
        }
        if (localStorage.getItem('gameState')) {
            localStorage.removeItem('gameState');
        }
        // Close modal and navigate
        localGameModal.hide();
        navigateTo('/local-game');
    });
    document.getElementById('localTournamentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get selected opponents
        const opponent1 = document.getElementById('opponent1');
        const opponent2 = document.getElementById('opponent2');
        const opponent3 = document.getElementById('opponent3');

        // Get the selected values
        const selectedOpponents = new Set([
            opponent1.options[opponent1.selectedIndex].text,
            opponent2.options[opponent2.selectedIndex].text,
            opponent3.options[opponent3.selectedIndex].text
        ]);

        // Check if we have three distinct opponents
        if (selectedOpponents.size !== 3) {
            document.getElementById('tournament-error').classList.remove('d-none');
            return;
        }

        // Hide error message if visible
        document.getElementById('tournament-error').classList.add('d-none');

        // Get current user info
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const challenger = currentUser.name;
        const challengerDisplayName = await getDisplayName();

        // Get display names for all opponents
        const opponents = Array.from(selectedOpponents);
        const opponentDisplayNames = await Promise.all(
            opponents.map(async (opponent) => ({
                username: opponent,
                displayName: await getDisplayName(opponent) || opponent
            }))
        );

        // Create tournament players object
        const tournamentPlayers = {
            challenger: challenger,
            challengerDisplayName: challengerDisplayName || challenger,
            opponents: opponentDisplayNames
        };

        // Store tournament data
        localStorage.setItem('localTournamentPlayers', JSON.stringify(tournamentPlayers));
        
        // Clear any existing tournament state
        if (localStorage.getItem('tournamentResults')) {
            localStorage.removeItem('tournamentResults');
        }
        if (localStorage.getItem('tournamentState')) {
            localStorage.removeItem('tournamentState');
        }
        if (localStorage.getItem('gameResults')) {
            localStorage.removeItem('gameResults');
        }
        if (localStorage.getItem('gameState')) {
            localStorage.removeItem('gameState');
        }
        // Close modal and navigate
        localTournamentModal.hide();
        navigateTo('/local-tournament');
    });
}