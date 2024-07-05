export function loadPage(app) {
    fetch('login.html')
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
    .then(data => {
        window.location.href = '/start';
    })
    .catch(error => {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Login failed: ' + error.message;
        errorMessage.style.color = 'red';
        form.appendChild(errorMessage);
    });
}
