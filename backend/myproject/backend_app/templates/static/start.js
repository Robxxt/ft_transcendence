import { navigateTo } from './router.js';

let challenges = [];
let tournaments = [];

export async function loadPage(app) {
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
            const username = JSON.parse(user).name;

            // fill html
            app.innerHTML = html;

            // fill "just play pong" button
            fillJustPlayPongButton(app, username);

            // challenge list
            fillChallengesList(app, username);

            // tournaments list
            //fillTournamentsList(app, username);
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
}

function createMatchInStorage(players, username) {
    const gameString = JSON.stringify(players);
    localStorage.setItem("match", gameString);      
}

function justPlayPongButtonLogic(app, username) {
    // if there is no open challenge, we open a challenge
    if (challenges.length === 0) {
        fetch(`/openChallenge?player=${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Error fetching challenges:', error);
        });

        // display challenges again
        location.href = location.href;
    }
    // if there is just our own challenge, we display a status line
    else if (challenges.length === 1 && challenges[0] === username) {
        const statusLine = app.querySelector("#statusLine");
        statusLine.innerHTML = "You have already issued a challenge and no other challenge is there.";
    }
    // if there are other challenges, we choose one randomly
    else {
        const randomIndex = Math.floor(Math.random() * challenges.length);
        const player = challenges[randomIndex];
        fetch(`/acceptChallenge?player=${player}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // create match object in storage
            const players = [player, username];
            createMatchInStorage(players, username);
                
            // navigate to game
            navigateTo('/pong')
        })
        .catch(error => {
            console.error('Error fetching challenges:', error);
        });
    }
}

function fillJustPlayPongButton(app, username) {
    const randomButton = app.querySelector('#invitationRandom');

    randomButton.onclick = function() {
        fetch('/getChallenges')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            challenges = data;
            justPlayPongButtonLogic(app, username);
        })
        .catch(error => {
            console.error('Error fetching challenges:', error);
        });
    }
}

function answerChallenge(buttonId, username) {
    const player1 = buttonId.substring(5);
    const players = [player1, username]

    createMatchInStorage(players, username);
    navigateTo("/pong");
}

function challengesListLogic(app, username) {
    const ulElement = app.querySelector("#challengesList");

    // empty list for reloads
    ulElement.innerHTML = "";

    fetch('/getChallenges')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        for (const player of data) {
            // we also have to check if the other player is online!
            if (player !== username) {
                const liElement = document.createElement('li');
                liElement.textContent = player + " challenges you to a match of Pong. Do you accept?";
                const buttonElement = document.createElement('button');
                buttonElement.textContent = 'Play ' + player + ' !';
                buttonElement.setAttribute('id','play_' + player);
                buttonElement.addEventListener('click', () => answerChallenge(buttonElement.id, username));
                liElement.appendChild(buttonElement);
                ulElement.appendChild(liElement);
            }
            else {
                const liElement = document.createElement('li');
                liElement.textContent = "Your own challenge";
                ulElement.appendChild(liElement);
            }
        }
    })
    .catch(error => {
        console.error('Error fetching challenges:', error);
    });
}

function fillChallengesList(app, username) {
    const reloadButton = app.querySelector('#reload');

    // reload button
    reloadButton.onclick = function () {challengesListLogic(app, username)};

    // list
    challengesListLogic(app, username);
}


function participateInTournament(buttonElementId, username) {

}

function tournamentsListLogic(app, username) {
    const ulElement = app.querySelector("#tournamentsList");

    // empty list for reloads
    ulElement.innerHTML = "";

    fetch('/getTournamentInvitations')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // fill tournaments
        tournaments = data;

        for (const tournament of data) {
            const name = tournament.name;
            const size = tournament.size;

            const liElement = document.createElement('li');
            liElement.textContent = name + " : ";
            const buttonElement = document.createElement('button');
            buttonElement.textContent = 'Participate in this tournament!';
            buttonElement.setAttribute('id', name);
            buttonElement.setAttribute('size', size.toString());
            buttonElement.addEventListener('click', () => participateInTournament(buttonElement.id, username));
            liElement.appendChild(buttonElement);
            ulElement.appendChild(liElement);
        }
    })
    .catch(error => {
        console.error('Error fetching tournaments:', error);
    });
}

function fillTournamentsList(app, username) {
    const startTournamentButton = app.querySelector('#startTournament');

    // reload button
    // startTournamentButton.onclick = function () {startTournamentOnClick(startTournamentButton.id, username)};

    // list
    tournamentsListLogic(app, username);
}
