import { navigateTo } from "./router.js";

export function loadPage(app) {
    // If user is already logged in we redirect to /start
    const userObject = JSON.parse(localStorage.getItem("user"));
    if (userObject && userObject.isLoggedIn) {
        navigateTo("/start");
        return;
    }

    // Load login page
    fetch("/static/html/login.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // Put base html into the app div
            app.innerHTML = html;

            // Event handler for form submit
            const form = app.querySelector("#loginForm");
            form.addEventListener("submit", function(event) {
                handleFormSubmit(event);
            });
        })
        .catch(error => {
            console.error(error);
        });
}

function handleFormSubmit(event) {
    const errorMessage = document.getElementById("errorMessage");
    const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/api/login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {  // Check if token is present
            // Store the token and user info in localStorage
            const userObject = {
                isLoggedIn: true,
                name: username,
                token: data.token
            };
            localStorage.setItem("token", data.token);  // Store the actual token from response
            localStorage.setItem("user", JSON.stringify(userObject));
            navigateTo("/start");
        } else {
            errorMessage.textContent = "Login failed: Username / Password combination wrong.";
            errorMessage.style.color = "red";
        }
    })
    .catch(error => {
        console.error(error);
    });
}
