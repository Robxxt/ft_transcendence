import { TournamentManager } from './tournamentManager.js';
import { PongGame, sendGameResultToApi, updateWinLoss} from './pongGame.js';
import { navigateTo } from './router.js';

export async function loadPage(app) {
    const tournamentManager = new TournamentManager();
    
    if (tournamentManager.isTournamentComplete()) {
        showTournamentResults(app, tournamentManager.state);
        return;
    }

    // Setup players for current game
    tournamentManager.setupLocalGamePlayers();

    // Modify the existing game title to show tournament progress
    const currentGame = tournamentManager.state.currentGame;
    const matchup = tournamentManager.getCurrentMatchup();
    
    // Load the game page with tournament context
    fetch("/static/html/localTournament.html")
        .then(response => response.text())
        .then(html => {
            app.innerHTML = html;
            
            // Update title to show tournament progress
            const gameTitle = app.querySelector('#game-title');
            gameTitle.innerHTML = `
                <div class="tournament-progress mb-2 text-white">Game ${currentGame} of 3</div>
                <span class="text-primary">Challenger ${matchup.challengerDisplayName}</span>
                <span class="text-white">vs.</span>
                <span class="text-danger">Opponent ${matchup.opponentDisplayName}</span>
            `;

            // Initialize the game with tournament context
            const canvas = document.getElementById('pongCanvas');
            const game = new PongGame(canvas);

            // Override the original gameOver method
            game.gameOver = function(store) {
                // Run original game over logic, but without adding the event listener
                this.isGameOver = true;
                const isLeftPaddleWinner = this.leftPaddle.score >= 3;
                this.winner = isLeftPaddleWinner ? this.challengerDisplayName : this.opponentDisplayName;
                
                // Save game results
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
                tournamentManager.updateGameResult(gameResult.winner, this.leftPaddle.score, this.rightPaddle.score);
                if (!tournamentManager.isTournamentComplete()) {
                    overlay.classList.remove('d-none');
                    const homeButton = document.getElementById('homeButton');
                    homeButton.innerHTML = 'Next Game';
                    homeButton.addEventListener('click', () => {
                        if (localStorage.getItem('gameResults')) {
                            localStorage.removeItem('gameResults');
                        }
                        if (localStorage.getItem('gameState')) {
                            localStorage.removeItem('gameState');
                        }
                        loadPage(app);
                    });
                } else {
                    showTournamentResults(app, tournamentManager.state);
                }
                
                clearInterval(this.gameLoop);
            };
        })
        .catch(error => {
            console.error('Error loading tournament game:', error);
        });
}

function showTournamentResults(app, tournamentState) {
    const matchupsArray = Object.entries(tournamentState.matchups)
        .filter(([key]) => key.startsWith('game'))
        .map(([_, game]) => ({
            challengerDisplayName: game.challengerDisplayName,
            opponentDisplayName: game.opponentDisplayName,
            challengerScore: game.challengerscore,
            opponentScore: game.opponentscore,
            winner: game.winner
        }));

    const resultsHtml = `
        <div class="container-fluid py-5 bg-dark">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <!-- Header Section -->
                    <div class="text-center mb-5">
                        <h1 class="display-4 text-primary mb-3">Tournament Complete!</h1>
                        <div class="d-inline-block bg-primary text-white px-4 py-2 rounded-pill">
                            <h2 class="h3 mb-0">Champion: ${tournamentState.tournamentWinner}</h2>
                        </div>
                    </div>

                    <!-- Tournament Bracket -->
                    <div class="tournament-bracket mb-5">
                        <div class="card bg-dark border-primary">
                            <div class="card-header bg-primary text-white">
                                <h3 class="mb-0">Tournament Bracket</h3>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    ${matchupsArray.map((game, index) => `
                                        <div class="col-md-4 mb-3">
                                            <div class="card bg-dark border-secondary h-100">
                                                <div class="card-header bg-secondary text-white">
                                                    Game ${index + 1}
                                                </div>
                                                <div class="card-body">
                                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                                        <div class="player ${game.winner === game.challengerDisplayName ? 'text-success' : 'text-white'}">
                                                            ${game.challengerDisplayName}
                                                        </div>
                                                        <div class="score badge ${game.winner === game.challengerDisplayName ? 'bg-success' : 'bg-secondary'}">
                                                            ${game.challengerScore}
                                                        </div>
                                                    </div>
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <div class="player ${game.winner === game.opponentDisplayName ? 'text-success' : 'text-white'}">
                                                            ${game.opponentDisplayName}
                                                        </div>
                                                        <div class="score badge ${game.winner === game.opponentDisplayName ? 'bg-success' : 'bg-secondary'}">
                                                            ${game.opponentScore}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="card-footer bg-dark border-secondary text-center">
                                                    <span class="badge bg-primary">Winner: ${game.winner}</span>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tournament Statistics -->
                    <div class="card bg-dark border-primary mb-4">
                        <div class="card-header bg-primary text-white">
                            <h3 class="mb-0">Tournament Statistics</h3>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h4 class="text-white mb-3">Total Points</h4>
                                    ${Object.entries(getTotalPoints(matchupsArray)).map(([player, points]) => `
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <span class="text-white">${player}</span>
                                            <span class="badge bg-primary">${points} pts</span>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="col-md-6">
                                    <h4 class="text-white mb-3">Win/Loss Record</h4>
                                    ${Object.entries(getWinLossRecord(matchupsArray)).map(([player, record]) => `
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <span class="text-white">${player}</span>
                                            <span class="badge bg-info">${record.wins}W - ${record.losses}L</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="text-center">
                        <button class="btn btn-primary btn-lg" id="HomeBtn">Return to Home</button>
                    </div>
                </div>
            </div>
        </div>

        <style>
            .tournament-bracket .card {
                transition: transform 0.2s;
            }
            .tournament-bracket .card:hover {
                transform: translateY(-5px);
            }
            .player {
                font-weight: 500;
            }
            .score {
                min-width: 30px;
                text-align: center;
            }
        </style>
    `;
    
    app.innerHTML = resultsHtml;
    
    document.getElementById('HomeBtn').addEventListener('click', () => {
        navigateTo('start');
    });
}

function getTotalPoints(matchups) {
    const points = {};
    matchups.forEach(game => {
        points[game.challengerDisplayName] = (points[game.challengerDisplayName] || 0) + game.challengerScore;
        points[game.opponentDisplayName] = (points[game.opponentDisplayName] || 0) + game.opponentScore;
    });
    return points;
}

function getWinLossRecord(matchups) {
    const records = {};
    matchups.forEach(game => {
        if (!records[game.challengerDisplayName]) {
            records[game.challengerDisplayName] = { wins: 0, losses: 0 };
        }
        if (!records[game.opponentDisplayName]) {
            records[game.opponentDisplayName] = { wins: 0, losses: 0 };
        }
        
        if (game.winner === game.challengerDisplayName) {
            records[game.challengerDisplayName].wins++;
            records[game.opponentDisplayName].losses++;
        } else {
            records[game.opponentDisplayName].wins++;
            records[game.challengerDisplayName].losses++;
        }
    });
    return records;
}