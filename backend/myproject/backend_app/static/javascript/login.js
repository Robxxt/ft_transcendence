import { navigateTo } from "./router.js";

export function loadPage(app) {
    // If user is already logged in we redirect to /start
    // const user = localStorage.getItem("user");
    // console.log(user);console.log(JSON.parse(user).isLoggedIn);
    // if (user && JSON.parse(user).isLoggedIn) {
    //     navigateTo("/start/"); // Line giving infinite request
    //     return;
    // }

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

// function handleFormSubmit(event) {
//     const errorMessage = document.getElementById("errorMessage");
//     const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
//     event.preventDefault();

//     // Fetching username and password from form inputs
//     const username = document.getElementById("username").value;
//     const password = document.getElementById("password").value;

//     fetch("/api/login/", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json", // specifying that we're sending JSON
//             "X-CSRFToken": csrftoken
//         },
//         body: JSON.stringify({ username, password }) // converting the data to JSON
//     })
//     .then(response => {
//         // If user/password is wrong
//         if (response.status === 401) {
//             errorMessage.textContent = "Login failed: Username / Password combination wrong.";
//             errorMessage.style.color = "red";
//         } else if (!response.ok) {
//             throw new Error(response.statusText);
//         } else {
//             // Reset error message
//             errorMessage.textContent = "";

//             // Put user object into storage
//             const userObject = {};
//             userObject.isLoggedIn = true;
//             userObject.name = username;
//             userObject.token = csrftoken;
//             localStorage.setItem("token", csrftoken);
//             localStorage.setItem("user", JSON.stringify(userObject));
//             console.log("Your user", JSON.parse(localStorage.getItem('user')));
//             navigateTo("/start");
//         }
//     })
//     .catch(error => {
//         console.error(error);
//     });
// }

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
