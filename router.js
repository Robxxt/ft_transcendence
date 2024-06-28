// We have a file for every route. Every file is being imported as module
// and must have a function (export it) loadPage. That is the entry point
// to that feature.
// If we change "pages", for instance when clicking on a button, we
// call navigateTo(path).
// If one enters the url manually, we get a file not found yet, since 
// the server must be configured to always serve our index page. So don't
// wonder if that does not work.


// import the module as <filenameBase>Module !!!
import * as loginModule from './login.js';
import * as pongModule from './pong.js';
import * as errorModule from './error.js';

// routes are being mapped to modules
const routes = {
    '/': loginModule,
    '/login': loginModule,
    '/pong': pongModule,
    '/404': errorModule,
    // we are adding our routes here
};

function navigateTo(path) {
    console.log('Navigating to:', path);
    window.history.pushState({}, "", window.location.origin + path);
    loadContent(path);
}

function loadContent(path) {
    // everything is created in the <div> tag called app
    const app = document.getElementById('app');

    // clear existing content
    app.innerHTML = '';

    // loadPage(app) is the entry point function of the route
    // let module = routes[path];
    const route = routes[path] || routes['/404'];
    if (typeof route.loadPage === 'function') {
        route.loadPage(app);
    } else {
        console.error(`Route ${path} does not have a loadPage function`);
    }
}

window.onpopstate = () => {
    loadContent(window.location.pathname);
};

function initRouter() {
    // Add event listeners for internal navigation
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigateTo(new URL(e.target.href).pathname);
        }
    });

    // Load initial content
    const path = window.location.pathname === '/' ? '/login' : window.location.pathname;
    console.log('Initial path:', path);
    navigateTo(path);
}

// Start the router when the DOM is ready
document.addEventListener('DOMContentLoaded', initRouter);

