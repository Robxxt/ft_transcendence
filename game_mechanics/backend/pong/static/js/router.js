import { homeView } from './homeView.js';
import { authView } from './authView.js';
import { gameRoomView } from './gameRoomView.js';

// Define routes with dynamic params
const routes = {
    '/': homeView,
    '/login': () => authView('login'),
    '/register': () => authView('register'),
    '/game-room/:id': gameRoomView,
};

export function router() {
    const path = window.location.hash.slice(1) || '/';

    // Find a matching route with dynamic params
    const route = Object.keys(routes).find(route => {
        const regex = new RegExp(`^${route.replace(':id', '\\d+')}$`);
        return regex.test(path);
    });

    if (route) {
        // Extract dynamic parameters (id)
        const params = path.match(/\d+/);
        if (params && route.includes(':id')) {
            // Call the view with the extracted id
            routes[route](params[0]);
        } else {
            // Static view
            routes[route]();
        }
    } else {
        errorView();
    }
}

// Navigate function to handle routing
export function navigate(path) {
    window.location.hash = path;
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

function errorView() {
    const app = document.getElementById('app');
    app.innerHTML = '<h1>404 - Page Not Found</h1>';
}
