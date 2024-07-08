export function loadPage(app) {
    fetch('profile.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            app.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
}
