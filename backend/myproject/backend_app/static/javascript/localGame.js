import { navigateTo } from "./router.js";

export async function loadPage(app) {
    // fetch basic html
    fetch("/static/html/localGame.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // fill html
            app.innerHTML = html;
        })
        .catch(error => {
            console.error(error);
        });
}