import { navigateTo } from './router.js';

export function loadPage(app) {
    fetch('gameHistory.html')
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
                navigateTo("/login");
                return;
            }
            
            app.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
}
