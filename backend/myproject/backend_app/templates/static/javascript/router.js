import { createNavBar } from staticUrl + '/javascript/navBar.js';

const routes = {
    '/': () => import(staticUrl + '/javascript/login.js').then(module => module.loadPage(document.getElementById('app'))),
    '/login': () => import(staticUrl + '/javascript/login.js').then(module => module.loadPage(document.getElementById('app'))),
    '/registration': () => import(staticUrl + '/javascript/registration.js').then(module => module.loadPage(document.getElementById('app'))),
    '/start': () => import(staticUrl + '/javascript/start.js').then(module => module.loadPage(document.getElementById('app'))),
    '/profile': () => import(staticUrl + '/javascript/profile.js').then(module => module.loadPage(document.getElementById('app'))),
    '/dashboard': () => import(staticUrl + '/javascript/dashboard.js').then(module => module.loadPage(document.getElementById('app'))),
    '/pong': () => import(staticUrl + '/javascript/pong.js').then(module => module.loadPage(document.getElementById('app'))),
};

export function navigateTo(url) {
    history.pushState(null, null, url);
    router();
}

function router() {
    const path = window.location.pathname;
    const loadRoute = routes[path] || routes['/'];;
    
    // set user item in local storage if it didn't exist yet
    if (localStorage.getItem("user") == null)
        localStorage.setItem("user", JSON.stringify({isLoggedIn : false}));

    // get logged in status
    const userObject = JSON.parse(localStorage.getItem("user"));
    const isLoggedIn = userObject.isLoggedIn;

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

// do we still need this?
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', event => {
        if (event.target.matches('[data-link]')) {
            event.preventDefault();
            navigateTo(event.target.href);
        }
    });
    router();
});
