import { navigateTo } from "./router.js";
import { PongGame } from "./pongGame.js";

export async function loadPage(app) {
    // Get the players from localStorage
    const players = JSON.parse(localStorage.getItem('localGamePlayers'));
    if (!players) {
        console.error('No players found');
        navigateTo('/start');
        return;
    }

    const challenger = players.challengerDisplayName;
    const opponent = players.opponentDisplayName;

    // fetch basic html
    fetch("/static/html/localGame.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        })
        .then(html => {
            app.innerHTML = html;
            
            // Update the game title with players
            const gameTitle = app.querySelector('#game-title');
            gameTitle.innerHTML = `
                <span class="text-primary">Challenger ${challenger}</span>
                <span class="text-white">vs.</span>
                <span class="text-danger">Opponent ${opponent}</span>
            `;
    
            // Set up hover functionality for the manual
            const manualTrigger = app.querySelector('.manual-trigger');
            const gameManual = new bootstrap.Collapse(document.getElementById('gameManual'), {
                toggle: false
            });
    
            manualTrigger.addEventListener('mouseenter', () => {
                gameManual.show();
            });
    
            manualTrigger.addEventListener('mouseleave', () => {
                gameManual.hide();
            });
    
            // Initialize the game
            const canvas = document.getElementById('pongCanvas');
            const game = new PongGame(canvas);
        })
        .catch(error => {
            console.error(error);
        });
}