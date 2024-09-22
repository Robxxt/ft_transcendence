// global vars
const maxUsers = 8;
let userCount = 1;

const form = document.getElementById('registrationForm');
const addUserButton = document.getElementById('addUserButton');
const userInputs = document.getElementById('userInputs');

// registers event listener to div 1
deleteButton1 = userInputs.querySelector('.deletePlayer');
deleteButton1.addEventListener('click', () => {
    removePlayerInput(deleteButton1);
});

// adds another input div
addUserButton.addEventListener('click', () => {
    if (userCount < maxUsers) {
        userCount++;
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        inputGroup.id = `input-group-${userCount}`;
        inputGroup.innerHTML = `
            <label for="playername${userCount}">Player ${userCount}:</label>
            <div class="input-group-under">
            <input type="text" id="playername${userCount}" name="playername${userCount}" required>
            <button type="button" class="deletePlayer">X</button>
            </div>
            `;
        let button = inputGroup.querySelector('.deletePlayer');
        button.addEventListener('click', () => {
            removePlayerInput(button);
        });
        userInputs.appendChild(inputGroup);
    } else {
        alert('Maximum number of users reached');
    }
});
    
// removes the div with id input-group-i
function removePlayerInput(button) {
    const contentDiv = button.parentElement.parentElement;
    const idStr = contentDiv.id;
    if (contentDiv) {
        contentDiv.remove();
    }
    adjustPlayerNumbers(idStr);
}

function adjustPlayerNumbers(idStr) {
    // get index of to be deleted div element
    const id = Number(idStr.at(idStr.length - 1));

    // loops over all divs that are greater than id and sets them one down
    for (let i = id + 1; i <= userCount; i++) {
        const playerInput = document.getElementById(`input-group-${i}`);
        // adjust label
        const label = playerInput.querySelector("label");
        label.setAttribute('for', `playername${i - 1}`);
        label.textContent = `Player ${i - 1}`;
        // adjust input field
        const inputField = document.getElementById(`playername${i}`);
        inputField.id = `playername${i - 1}`
        inputField.setAttribute('name', `playername${i - 1}`)
        // adjust div id at last
        playerInput.id = `input-group-${i - 1}`;
    }
    userCount--;
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    // assemble player names into array
    const playernames = [];
    for (let i = 1; i <= userCount; i++) {
        const playernameInput = document.getElementById(`playername${i}`);
        if (playernameInput.value) {
            playernames.push(playernameInput.value);
        }
    }

    // debug
    console.log(JSON.stringify({ playernames: playernames }));

    // send playernames to the server
    fetch('BACKEND_ENDPOINT', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playernames: playernames })
    })
    .then(response => response.json())
    .then(data => {
        // here is the control going over to Fabian
        alert('Game is starting!');
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
