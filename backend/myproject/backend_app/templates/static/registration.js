import { navigateTo } from './router.js';

export function loadPage(app) {
    fetch('/static/registration.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // check if user is logged in
            const user = localStorage.getItem("user");
            if (user && JSON.parse(user).isLoggedIn) {
                navigateTo("/start");
                return;
            }
            
            app.innerHTML = html;

            // register event listener for submit
            const form = app.querySelector('#registrationForm');
            if (form) {
                form.addEventListener('submit', handleFormSubmit);
            }

            // check input before sending
            let inputField = app.querySelector('#username');
            if (inputField) {
                inputField.addEventListener('input', validateUsername);
            }
            inputField = app.querySelector('#password');
            if (inputField) {
                inputField.addEventListener('input', validatePassword);
            }
            inputField = app.querySelector('#passwordRepetition');
            if (inputField) {
                inputField.addEventListener('input', validatePasswordRepetition);
            }
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
}

function handleFormSubmit(event) {
    event.preventDefault();

    // check username and password again
    if (!validateUsername() || !validatePasswordRepetition() || !validatePassword())
        return;

    // set data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const data = {username: username, password: password};

    fetch('/api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 200) {
            const userObject = {"name" : username, "isLoggedIn" : true};
            localStorage.setItem("user", JSON.stringify(userObject));
            return {'error': 0};
        }
        else if (response.status == 400)
            return response.json();
        else
            throw new Error('Unexpected response');
    })
    .then(data => {
        if (data) {
            if (data.error == 0)
                navigateTo('/start');
            else if (data.error == 1)
                printSubmitError(1);
            else if (data.error == 2)
                printSubmitError(2);
            else
                printSubmitError(3);
        }
    })
    .catch(error => {
        console.log(error.message);
    });
}

function validateUsername() {
    const username = document.getElementById('username').value;
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
        document.getElementById('usernameError').textContent = 'Username must be alphanumeric.';
        return false;
    } else {
        document.getElementById('usernameError').textContent = '';
        return true;
    }
}

function validatePassword() {
    // reset password repetition
    document.getElementById('passwordRepetition').value = '';
    document.getElementById('passwordRepetitionError').textContent = '';

    const password = document.getElementById('password').value;
    const passwordRegex = /^[a-zA-Z0-9]{8,20}$/;
    if (!passwordRegex.test(password)) {
        document.getElementById('passwordError').textContent = 'Password must be 8-20 characters long and alphanumeric.';
        return false;
    } else {
        document.getElementById('passwordError').textContent = '';
        return true;
    }
}

function validatePasswordRepetition() {
    const password = document.getElementById('password').value;
    const passwordRepetition = document.getElementById('passwordRepetition').value;
    if (password !== passwordRepetition) {
        document.getElementById('passwordRepetitionError').textContent = "Passwords don't match.";
        return false;
    } else {
        document.getElementById('passwordRepetitionError').textContent = '';
        return true;
    }
}

function printSubmitError(errorcode) {
    const submitError = document.getElementById('submitError');
    if (errorcode == 1)
        submitError.textContent = 'Player name already taken.';
    else if (errorcode == 2)
        submitError.textContent = 'Player name or password were not rule conform.';
    else
        submitError.textContent = 'Unknown error.'
}
