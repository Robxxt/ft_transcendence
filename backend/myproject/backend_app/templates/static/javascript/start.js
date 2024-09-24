import { navigateTo } from "./javascript/router.js";

export async function loadPage(app) {
    // check if user is logged in
    const user = localStorage.getItem("user");
    if (!user || !JSON.parse(user).isLoggedIn) {
        navigateTo("/login");
        return;
    }

    // check if user name is present
    if (!JSON.parse(user).name) {
        localStorage.removeItem("user");
        navigateTo("/login");
        return;
    }

    // fetch basic html
    fetch(staticUrl + "/start.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        })
        .then(html => {
             // fill html
            app.innerHTML = html;

            // event handler for the buttons
            let button;
            button = app.querySelector("#playPong");
            button.addEventListener("click", () => {
                navigateTo("/pong");
                return;
            });

            button = app.querySelector("#playTictactoe");
            button.addEventListener("click", () => {
                navigateTo("/pong"); // here we have to change it to tictactoe!
                return;
            });
        })
        .catch(error => {
            console.error(error);
        });
}
