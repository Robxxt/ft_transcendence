export function loadPage(app) {
    console.log("start");
    fetch('start.html')
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