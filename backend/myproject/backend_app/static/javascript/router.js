import { createNavBar } from './navBar.js';

const routes = {
    '/': () => import('/static/javascript/login.js').then(module => module.loadPage(document.getElementById('app'))),
    '/login': () => import('/static/javascript/login.js').then(module => module.loadPage(document.getElementById('app'))),
    '/registration': () => import('/static/javascript/registration.js').then(module => module.loadPage(document.getElementById('app'))),
    '/start': () => import('/static/javascript/start.js').then(module => module.loadPage(document.getElementById('app'))),
    '/profile': () => import('/static/javascript/profile.js').then(module => module.loadPage(document.getElementById('app'))),
    '/pong': () => import('/static/javascript/pong.js').then(module => module.loadPage(document.getElementById('app'))),
};

export function navigateTo(url) {
    history.pushState(null, null, url);
    router();
}

function router() {
    const path = window.location.pathname;
    const loadRoute = routes[path];

    // get logged in status
    const isLoggedIn = true; // debug

    if (loadRoute) {
        loadRoute().then(() => {
            // create NavBar depending on login status
            if (isLoggedIn) {
                createNavBar();
            }
            else {
                const navBar = document.getElementById('navBar');
                navBar.innerHTML = '';
            }
        });
    } else {
        const appDiv = document.getElementById('app');
        appDiv.innerHTML = '<h2>404</h2><p>Page not found.</p>';
    }
}

window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', event => {
        if (event.target.matches('[data-link]')) {
            console.log("here");
            event.preventDefault();
            navigateTo(event.target.href);
        }
    });
    router();
});
