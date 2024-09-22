import { navigateTo } from './router.js';

export function loadPage(app) {
    fetch('static/start.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // check if user is logged in
            const user = localStorage.getItem("user");
            if (user && ! JSON.parse(user).isLoggedIn) {
                console.log(user);
                navigateTo("/login");
                return;
            }

            // fill html
            app.innerHTML = html;

            // challenge list
            getChallenges();

            // open new invitation button
            const invitationButton = document.getElementById('invitation');
            invitationButton.addEventListener('click', handleInvitation);
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
}

function getChallenges() {
    const challengesDiv = document.getElementById('challenges');
    const username = JSON.parse(localStorage.getItem('user')).name;

    fetch('/openChallenges')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        for (const challenge of data) {
            // we also have to check if the other player is online!
            if (challenge.player !== username) {
                challengesDiv.appendChild(document.createTextNode(challenge.player + " challenges you to a match of Pong. Do you accept?"));
                const button = document.createElement("button");
                button.setAttribute('id','play_' + challenge.player);
                button.textContent = 'Play ' + challenge.player + ' !';
                button.addEventListener('click', () => answerChallenge(button.id));
                challengesDiv.appendChild(button);
                challengesDiv.appendChild(document.createElement('br'));
            }
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

}

function handleInvitation() {
    const username = JSON.parse(localStorage.getItem('user')).name;

    fetch('/playRandom', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        navigateTo('/pong');
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function answerChallenge(buttonId) {
    const username = JSON.parse(localStorage.getItem('user')).name;
    const player1 = buttonId.substring(5);

    fetch('/playChosen', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player1 : player1, player2: username }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        navigateTo('/pong');
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    }); 
}