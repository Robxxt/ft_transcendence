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
                this.winner = isLeftPaddleWinner ? this.opponentDisplayName : this.challengerDisplayName;
                
                // Save game results
                const gameResult = {
                    winner: this.winner,
                    scores: {
                        [this.challengerDisplayName]: isLeftPaddleWinner ? this.leftPaddle.score : this.rightPaddle.score,
                        [this.opponentDisplayName]: isLeftPaddleWinner ? this.rightPaddle.score : this.leftPaddle.score
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
                
                // Show overlay
                const overlay = document.getElementById('gameOverOverlay');
                const winnerMessage = document.getElementById('winnerMessage');
                winnerMessage.textContent = `${this.winner} Wins!`;
                overlay.classList.remove('d-none');
                
                // Add tournament-specific button behavior
                const homeButton = document.getElementById('homeButton');
                homeButton.innerHTML = 'Next Game';
                homeButton.addEventListener('click', () => {
                    if (localStorage.getItem('gameResults')) {
                        localStorage.removeItem('gameResults');
                    }
                    if (localStorage.getItem('gameState')) {
                        localStorage.removeItem('gameState');
                    }
                    
                    // Update tournament state with the winner
                    tournamentManager.updateGameResult(gameResult.winner);
            
                    if (tournamentManager.isTournamentComplete()) {
                        navigateTo('tournament-results');
                    } else {
                        loadPage(app);
                    }
                });
                
                clearInterval(this.gameLoop);
            };
        })
        .catch(error => {
            console.error('Error loading tournament game:', error);
        });
}

function showTournamentResults(app, tournamentState) {
    // Create and show tournament results page
    const resultsHtml = `
        <div class="container text-center mt-5">
            <h1 class="text-primary mb-4">Tournament Complete!</h1>
            <h2 class="text-white mb-4">Winner: ${tournamentState.tournamentWinner}</h2>
            <button class="btn btn-primary" id="newTournamentBtn">Start New Tournament</button>
        </div>
    `;
    
    app.innerHTML = resultsHtml;
    
    document.getElementById('newTournamentBtn').addEventListener('click', () => {
        const tournamentManager = new TournamentManager();
        tournamentManager.resetTournament();
        navigateTo('start');
    });
}