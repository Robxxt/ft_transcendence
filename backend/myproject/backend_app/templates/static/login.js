import { navigateTo } from "./router.js";

export function loadPage(app) {
    // if user is already logged in we redirect to /start
    const user = localStorage.getItem("user");
    if (user && JSON.parse(user).isLoggedIn) {
        navigateTo("/start");
        return;
    }

    // load login page
    fetch("/static/login.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // put base html into the app div
            app.innerHTML = html;

            // event handler for form submit
            const form = app.querySelector("#loginForm");
            form.addEventListener("submit", handleFormSubmit);
        })
        .catch(error => {
            console.error(error);
        });
}

function handleFormSubmit(event) {
    const errorMessage = document.getElementById("errorMessage");

    event.preventDefault();

    // get form data
    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // post to /login
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        // if user/password is wrong
        if (response.status === 401) {
            errorMessage.textContent = "Login failed: Username / Password combination wrong.";
            errorMessage.style.color = "red";
        }
        else if (!response.ok) {
            throw new Error(response.statusText);
        }
        else {
            // reset error message
            errorMessage.textContent = "";

            // put user object into storage
            const userObject = {};
            userObject.isLoggedIn = true;
            userObject.name = data["username"];
            localStorage.setItem("user", JSON.stringify(userObject));
            navigateTo("/start");
        }
    })
    .catch(error => {
        console.error(error);
    });
}
