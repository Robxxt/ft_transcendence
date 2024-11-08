import { navigateTo } from "./router.js";

export function loadPage(app) {
    // If user is already logged in we redirect to /start
    const userObject = JSON.parse(localStorage.getItem("user"));
    if (userObject && userObject.isLoggedIn) {
        navigateTo("/start");
        return;
    }
            
    // load registration page
    fetch("/static/html/registration.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // put in base html in app div
            app.innerHTML = html;

            // register event listener for submit
            const form = app.querySelector("#registrationForm");
            form.addEventListener("submit", handleFormSubmit);

            // add event listeners for checking the input while typing
            let inputField;
            inputField = app.querySelector("#username");
            inputField.addEventListener("input", validateUsername);
            inputField = app.querySelector("#password");
            inputField.addEventListener("input", validatePassword);
            inputField = app.querySelector("#passwordRepetition");
            inputField.addEventListener("input", validatePasswordRepetition);
        })
        .catch(error => {
            console.error(error);
        });
}

function handleFormSubmit(event) {
    event.preventDefault();

    // check username and password again
    if (!validateUsername() || !validatePasswordRepetition() || !validatePassword())
        return;

    // set data
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const data = {username: username, password: password};

    // post form data
    fetch("/api/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 201 || response.status == 400) {
            return response.json();
        }
        else
            throw new Error(response.statusText);
    })
    .then(data => {
        if (data) {
            if (data.error === 0) {
                const userObject = {"name" : username, "isLoggedIn" : true};
                localStorage.setItem("user", JSON.stringify(userObject));
                localStorage.setItem("token", data.token);
                navigateTo("/start");
            }
            else if (data.error === 1)
                printSubmitError(data["errors"]);
        }
    })
    .catch(error => {
        console.error(error);
    });
}

/*
Username must be alphanumeric.
*/
function validateUsername() {
    const username = document.getElementById("username").value;
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
        document.getElementById("usernameError").textContent = "Username must be alphanumeric.";
        return false;
    } else {
        document.getElementById("usernameError").textContent = "";
        return true;
    }
}

/*
Password must be 8-20 characters long and alphanumeric.
*/
function validatePassword() {
    // reset password repetition if user wants to change password after he has input the repetition
    document.getElementById("passwordRepetition").value = "";
    document.getElementById("passwordRepetitionError").textContent = "";

    const password = document.getElementById("password").value;
    const passwordRegex = /^[a-zA-Z0-9]{8,20}$/;
    if (!passwordRegex.test(password)) {
        document.getElementById("passwordError").textContent = "Password must be 8-20 characters long and alphanumeric.";
        return false;
    } else {
        document.getElementById("passwordError").textContent = "";
        return true;
    }
}

function validatePasswordRepetition() {
    const password = document.getElementById("password").value;
    const passwordRepetition = document.getElementById("passwordRepetition").value;

    if (password !== passwordRepetition) {
        document.getElementById("passwordRepetitionError").textContent = "Passwords don't match.";
        return false;
    } else {
        document.getElementById("passwordRepetitionError").textContent = "";
        return true;
    }
}

function printSubmitError(errors) {
    const submitError = document.getElementById("submitError");

    for (const key in errors) {
        let str = errors[key][0];
        str = str.charAt(0).toUpperCase() + str.slice(1);
        submitError.textContent = str;
    }
}
