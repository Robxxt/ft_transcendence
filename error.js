export function loadPage(app) {
    app.innerHTML = `
        <div class="container">
            <h1>404</h1>
            <p>Oops! The page you are looking for does not exist.</p>
            <a href="/" data-link>Go to Home</a>
        </div>`;
}