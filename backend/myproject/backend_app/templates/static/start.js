import { navigateTo } from './router.js';

let challenges = [];
let tournaments = [];

export async function loadPage(app) {
    fetch('static/start.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // check if user is logged in
            const user = localStorage.getItem("user");
            if (user && ! JSON.parse(user).isLoggedIn) {
                console.log(user);
                navigateTo("/login");
                return;
            }
            const username = JSON.parse(user).name;

            // fill html
            app.innerHTML = html;

            // event handler for the buttons
            let button = app.querySelector("#playPong");
            button.addEventListener("click", () => {
                navigateTo("/pong");
                return;
            });

            button = app.querySelector("#playTictactoe");
            button.addEventListener("click", () => {
                navigateTo("/pong");
                return;
            });
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
}
