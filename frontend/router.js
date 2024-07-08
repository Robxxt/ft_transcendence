import { createNavBar } from './navBar.js';

const routes = {
    '/': () => import('./login.js').then(module => module.loadPage(document.getElementById('app'))),
    '/login': () => import('./login.js').then(module => module.loadPage(document.getElementById('app'))),
    '/registration': () => import('./registration.js').then(module => module.loadPage(document.getElementById('app'))),
    '/start': () => import('./start.js').then(module => module.loadPage(document.getElementById('app'))),
    '/profile': () => import('./profile.js').then(module => module.loadPage(document.getElementById('app'))),
    '/dashboard': () => import('./dashboard.js').then(module => module.loadPage(document.getElementById('app'))),
};

function navigateTo(url) {
    history.pushState(null, null, url);
    router();
}

function router() {
    const path = window.location.pathname;
    const loadRoute = routes[path];
    if (loadRoute) {
        loadRoute().then(() => {
            if (path !== '/' && path !== '/login' && path != 'registration') {
                createNavBar();
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
            event.preventDefault();
            navigateTo(event.target.href);
        }
    });
    router();
});
