import { TicTacToeController, TicTacToeModel, TicTacToeView } from './tictactoe.js';

export async function loadPage(app) {
    // fetch basic html
    fetch("/static/html/index_tictac.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        })
        .then(html => {
             // fill html
            app.innerHTML = html;

            // entry point into the game
            const game = new TicTacToeController(new TicTacToeModel(), new TicTacToeView());
        })
        .catch(error => {
            console.error(error);
        });
}
