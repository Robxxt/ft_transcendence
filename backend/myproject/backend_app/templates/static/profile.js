import { navigateTo } from './router.js';
import { loadAvatar } from './navBar.js';

export function loadPage(app) {
    fetch('static/profile.html')
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
                navigateTo("/login");
                return;
            }

            // load Html
            app.innerHTML = html;

            // JS for changePassword div
            handleChangePasswordDiv(app);

            // JS for changeAvatar div
            handleChangeAvatarDiv(app);

            // JS for setDisplayName
            handleSetDisplayName(app);

            // JS for winLossRecord div
            handleWinLossRecordDiv(app);

            // JS for gameHistoryLink div
            handleGameHistoryDiv(app);

            // JS for friends div
            handleFriendsDiv(app);
        })
        .catch(error => {
            console.error('Error loading page:', error);
        });
}

function handleChangeAvatarDiv(app) {
    const avatarForm = document.getElementById('avatarForm');
    const avatarInput = document.getElementById('avatarInput');
    const avatarUploadStatus = document.getElementById('avatarUploadStatus');

    avatarForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData();
        const file = avatarInput.files[0];

        if (!file) {
            avatarUploadStatus.textContent = 'Please select a file to upload.';
            return;
        }

        formData.append('avatar', file);

        fetch('/changeAvatar', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.status == 200) {
                avatarUploadStatus.textContent = 'Avatar uploaded successfully!';
                loadAvatar();
            }
            else
                throw new Error();
        })
        .catch(error => {
            avatarUploadStatus.textContent = 'Error uploading avatar. Please try again.';
        });
    });
}

function handleChangePasswordDiv(app) {
    const passwordForm = document.getElementById('passwordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordChangeStatus = document.getElementById('passwordChangeStatus');

    newPasswordInput.addEventListener('input', validatePassword);

    passwordForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword || !confirmPassword()) {
            passwordChangeStatus.textContent = 'New password and confirmation do not match or password not ruleconform.';
            return;
        }

        // Create the payload for the request
        const payload = {
            currentPassword: currentPassword,
            newPassword: newPassword
        };

        fetch('/changePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                passwordChangeStatus.textContent = 'Password changed successfully!';
            } else {
                passwordChangeStatus.textContent = 'Error changing password: ' + data.message;
            }
        })
        .catch(error => {
            passwordChangeStatus.textContent = 'Error changing password. Please try again.';
        });
    });
}

function handleSetDisplayName(app) {
    const form = document.getElementById("setDisplayName");
    const displayName = document.getElementById("displayName");
    const status = document.getElementById("displayNameStatus");

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        fetch('/setDisplayName', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              displayName: displayName.value
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            if (data.nameExists === true)
                status.innerHTML = "Name sadly already taken. But twas a cool name.";
            else 
                status.innerHTML = "Updated the display name."
          })
          .catch(error => {
            console.error('Error:', error);
          });       
    })
}

function handleWinLossRecordDiv(app) {
    const username = localStorage.getItem("user");
    const winLossRecordDiv = document.getElementById('winLossRecord');

    fetch(`/winLossRecord?username=${username}`)
        .then(response => response.json())
        .then(data => {
            const winLossHTML = `
                <h1 class="display-l" style="color: magenta;">${data.wins} : ${data.losses}</h1>
            `;
            winLossRecordDiv.innerHTML += winLossHTML;
        })
        .catch(error => {
            console.error('Error fetching win/loss record:', error);
        });
}

function handleGameHistoryDiv(app) {
    const username = localStorage.getItem("user");
    const gamesTable = document.getElementById('gamesTable');

    fetch(`/gameList?username=${username}`)
    .then(response => response.json())
    .then(data => {
        for (const item of data) {
            let newRow = gamesTable.insertRow();
            let cell1 = newRow.insertCell(0);
            let cell2 = newRow.insertCell(1);
            let cell3 = newRow.insertCell(2);
            let cell4 = newRow.insertCell(3);
            let cell5 = newRow.insertCell(4);
            let cell6 = newRow.insertCell(5);
            cell1.textContent = item.date;
            cell2.textContent = item.time;
            cell3.textContent = item.player1;
            cell4.textContent = item.player2;
            cell5.textContent = item.winner;
            cell6.textContent = item.result;
        }    
    })
    .catch(error => {
        avatarUploadStatus.textContent = 'Error uploading avatar. Please try again.';
    });
}

function handleFriendsDiv(app) {
    const username = localStorage.getItem("user");
    const gameList = document.getElementById('friendList');

    fetch(`/friendList?username=${username}`)
    .then(response => response.json())
    .then(data => {
        for (const friend of data) {
            const listItem = document.createElement('li');

            if (friend.online)
                listItem.innerHTML = `<span class="badge bg-success">online</span>`;
            else 
                listItem.innerHTML = `<span class="badge bg-dark">offline</span>`;
            listItem.innerHTML += ` ${friend.friend}`;

            gameList.appendChild(listItem);
        }    
    })
    .catch(error => {
        avatarUploadStatus.textContent = 'Error uploading avatar. Please try again.';
    });
}

function validatePassword() {
    const password = document.getElementById('newPassword').value;
    const passwordRegex = /^[a-zA-Z0-9]{8,20}$/;
    if (!passwordRegex.test(password)) {
        document.getElementById('passwordChangeStatus').textContent = 'Password must be 8-20 characters long and alphanumeric.';
        return false;
    } else {
        document.getElementById('passwordChangeStatus').textContent = '';
        return true;
    }
}
