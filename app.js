// app.js

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById('app');

    // Define routes
    const routes = {
        '/': '<h1>Home</h1><p>Welcome to the home page.</p>',
        '/profile': '<h1>Profile</h1><p>This is your profile page.</p>',
        '/settings': '<h1>Settings</h1><p>Here are your settings.</p>',
        '/pagename' : createPageWithNamePagename(app)
    };

    // Function to render content based on the current path
    const render = (path) => {
        app.innerHTML = routes[path] || '<h1>404</h1><p>Page not found.</p>';
    };

    // Function to handle navigation
    const navigate = (path) => {
        console.log(path);
        window.history.pushState({}, '', window.location.origin + path);
        render(path);
    };

    // Event listener for back/forward button navigation
    window.addEventListener('popstate', () => {
        render(window.location.pathname);
    });

    // Initial render
    render(window.location.pathname);

    // Example of navigation without libraries
    document.body.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.target.tagName == 'A') {
            navigate(event.target.getAttribute('href'));
        }
    });

    // Add navigation links for demonstration
    app.innerHTML = `
        <nav>
            <a href="/">Home</a> |
            <a href="/profile">Profile</a> |
            <a href="/settings">Settings</a>
            <button type="button" id="examplebutton">Here we go to page with name pagename</button> 
        </nav>
        ${routes[window.location.pathname] || '<h1>404</h1><p>Page not found.</p>'}
    `;


    // my example
    const examplebutton = document.getElementById("examplebutton");
    examplebutton.addEventListener('click', () => {
        console.log("test");
        navigate("/pagename");
    })

    function createPageWithNamePagename(app) {
        return `test`;
    }
});
