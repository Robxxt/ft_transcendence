import { navigateTo } from "./router.js";

export function loadPage(app) {
    // if user is already logged in we redirect to /start
    const user = localStorage.getItem("user");
    if (user && JSON.parse(user).isLoggedIn) {
        navigateTo("/start");
        return;
    }
            
    // load registration page
    fetch("/static/registration.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // put in base html in app div
            app.innerHTML = html;

            // register event listener for submit
            const form = app.querySelector("#registrationForm");
            form.addEventListener("submit", handleFormSubmit);

            // check input before sending
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
    fetch("register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 200) {
            return {"error": 0};
        }
        else if (response.status == 400) {
            return response.json();
        }
        else
            throw new Error("Network response was not ok " + response.statusText);
    })
    .then(data => {
        if (data) {
            if (data.error == 0) {
                const userObject = {"name" : username, "isLoggedIn" : true};
                localStorage.setItem("user", JSON.stringify(userObject));
                navigateTo("/start");
            }
            else if (data.error == 1)
                printSubmitError(1);
            else if (data.error == 2)
                printSubmitError(2);
            else
                printSubmitError(3);
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

function printSubmitError(errorcode) {
    const submitError = document.getElementById("submitError");
    if (errorcode == 1)
        submitError.textContent = "Player name already taken. Choose again.";
    else if (errorcode == 2)
        submitError.textContent = "Player name or password were not rule conform.";
    else
        submitError.textContent = "Unknown error."
}
