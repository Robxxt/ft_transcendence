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
import * as startModule from './start.js';

// routes are being mapped to modules
const routes = {
    '/': loginModule,
    '/login': loginModule,
    '/start': startModule
    // '/game': gameModule
    // we are adding our routes here
};

function navigateTo(path) {
    window.history.pushState({}, "", window.location.origin + path);
    loadContent(path);
}

function loadContent(path) {
    
    console.log("path " + path);

    // everything is created in the <div> tag called app
    const app = document.getElementById('app');

    // clear existing content
    app.innerHTML = '';

    // loadPage(app) is the entry point function of the route
    let module = routes[path];
    if (typeof module.loadPage === 'function') {
        module.loadPage(app);
    }
}

window.onpopstate = () => {
    console.log("here");
    loadContent(window.location.pathname);
};

// Default route
document.addEventListener('DOMContentLoaded', () => {
    console.log("begin");
    let path = window.location.pathname;
    if (path == "/")
        path = "/login";
    navigateTo(path);
});
