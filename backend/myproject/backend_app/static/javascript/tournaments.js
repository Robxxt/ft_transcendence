import { apiRequest } from './apiServices.js';
const API_URL = 'api/tournaments/';
const REFRESH_INTERVAL = 5000;

let intervalId = null;

function createTournamentsHTML() {
    return `
        <div class="container py-5">
            <h1 class="text-center mb-4">Active Tournaments</h1>
            
            <div id="loading-spinner" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>

            <div id="tournaments-container" class="row g-4">
            </div>

            <div id="error-alert" class="alert alert-danger d-none" role="alert">
                Failed to load tournaments. Please try again later.
            </div>
        </div>
    `;
}

async function fetchTournaments() {
    try {
        const response = await apiRequest(API_URL, 'GET');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tournaments = await response.json();
        return tournaments;
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        throw error;
    }
}

function createTournamentCard(tournament) {
    return `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${escapeHtml(tournament.tournament_name)}</h5>
                    <div class="mt-3">
                        <h6 class="mb-3">Players:</h6>
                        <ul class="list-unstyled">
                            ${tournament.player1_name ? `<li>Player 1: ${escapeHtml(tournament.player1_name)}</li>` : ''}
                            ${tournament.player2_name ? `<li>Player 2: ${escapeHtml(tournament.player2_name)}</li>` : ''}
                            ${tournament.player3_name ? `<li>Player 3: ${escapeHtml(tournament.player3_name)}</li>` : ''}
                            ${tournament.player4_name ? `<li>Player 4: ${escapeHtml(tournament.player4_name)}</li>` : ''}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

async function updateTournaments() {
    const tournamentsContainer = document.getElementById('tournaments-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorAlert = document.getElementById('error-alert');
    
    if (!tournamentsContainer) return;

    try {
        errorAlert.classList.add('d-none');
        const tournaments = await fetchTournaments();
        console.log('Received tournaments:', tournaments);
        
        if (tournaments.length === 0) {
            tournamentsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">No active tournaments found.</p>
                </div>
            `;
        } else {
            tournamentsContainer.innerHTML = tournaments
                .map(tournament => createTournamentCard(tournament))
                .join('');
        }
    } catch (error) {
        console.error('Update error:', error);
        errorAlert.classList.remove('d-none');
    } finally {
        loadingSpinner.classList.add('d-none');
    }
}

export function loadPage(appDiv) {
    if (intervalId) {
        clearInterval(intervalId);
    }

    appDiv.innerHTML = createTournamentsHTML();
    updateTournaments();
    intervalId = setInterval(updateTournaments, REFRESH_INTERVAL);

    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
}