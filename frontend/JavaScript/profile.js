import { navigateTo } from './router.js';

export function loadPage(app) {
    fetch('frontend/HTML/profile.html')
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
        .then(response => response.json())
        .then(data => {
            avatarUploadStatus.textContent = 'Avatar uploaded successfully!';
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

    passwordForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            passwordChangeStatus.textContent = 'New password and confirmation do not match.';
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


function handleWinLossRecordDiv(app) {
    const username = localStorage.getItem("user");
    const winLossRecordDiv = document.getElementById('winLossRecord');

    fetch(`/winLossRecord?username=${username}`)
        .then(response => response.json())
        .then(data => {
            const winLossHTML = `
                <h5>Win Loss Record</h5>
                <p>Wins: ${data.wins}</p>
                <p>Losses: ${data.losses}</p>
            `;
            winLossRecordDiv.innerHTML = winLossHTML;
        })
        .catch(error => {
            console.error('Error fetching win/loss record:', error);
        });
}

function handleGameHistoryDiv(app) {
    const username = localStorage.getItem("user");
    const gameList = document.getElementById('gameList');

    fetch(`/gameList?username=${username}`)
    .then(response => response.json())
    .then(data => {
        for (const item of data) {
            gameList.appendChild(document.createTextNode(JSON.stringify(item)));
            gameList.appendChild(document.createElement('br'));
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

            const statusImage = document.createElement('img');
            statusImage.alt = friend.online ? '🟢' : '🔴';
            listItem.appendChild(statusImage);

            listItem.appendChild(document.createTextNode(friend.friend));

            gameList.appendChild(listItem);
        }    
    })
    .catch(error => {
        avatarUploadStatus.textContent = 'Error uploading avatar. Please try again.';
    });
}
