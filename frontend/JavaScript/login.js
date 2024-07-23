import { navigateTo } from './router.js';

export function loadPage(app) {
    fetch('frontend/HTML/login.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            app.innerHTML = html;
            const form = app.querySelector('#loginForm');
            if (form) {
                form.addEventListener('submit', handleFormSubmit);
            }
            const errorMessage = document.createElement('p');
            errorMessage.id = "errorMessage";
            form.appendChild(errorMessage); 
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
}

function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        return response.json();
    })
    .then(response => {
       const errorMessage = document.getElementById("errorMessage");
       errorMessage.textContent = "";

        const user = localStorage.getItem("user");
        if (user) {
            const userObject = JSON.parse(user);
            userObject.isLoggedIn = true;
            userObject.name = data["username"];
            localStorage.setItem("user", JSON.stringify(userObject));
            console.log(userObject, data);
        }
        navigateTo('/start');
    })
    .catch(error => {
        const errorMessage = document.getElementById("errorMessage");
        errorMessage.textContent = 'Login failed: ' + error.message;
        errorMessage.style.color = 'red';
    });
}
