import { navigateTo } from "./router.js";
import { loadAvatar } from "./navBar.js";

export function loadPage(app) {
    // check if user is logged in
    const userObject = localStorage.getItem("user");
    if (!userObject || !JSON.parse(userObject).isLoggedIn) {
        navigateTo("/login");
        return;
    }

    // check if user name is present
    let username;
    if (!userObject || !JSON.parse(userObject).name) {
        localStorage.removeItem("user");
        navigateTo("/login");
        return;
    }
    else {
        username = JSON.parse(userObject).name;
    }

    // fetch basic html
    fetch("/static/html/profile.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // load html
            app.innerHTML = html;

            // JS for changePassword div
            handleChangePasswordDiv(app, username);

            // JS for changeAvatar div
            handleChangeAvatarDiv(app, username);

            // JS for setDisplayName
            handleSetDisplayName(app, username);

            // JS for winLossRecord div
            handleWinLossRecordDiv(app, username);

            // JS for gameHistoryLink div
            handleGameHistoryDiv(app);

            // JS for friends div
            handleFriendsDiv(app);

            // JS for addFrinends div
            handleAddFriendsDiv(app, username);
        })
        .catch(error => {
            console.error(error);
        });
}

function validatePassword() {
    const password = document.getElementById("newPassword").value;
    const passwordRegex = /^[a-zA-Z0-9]{8,20}$/;
    if (!passwordRegex.test(password)) {
        document.getElementById("passwordChangeStatus").textContent = "Password must be 8-20 characters long and alphanumeric.";
        return false;
    } else {
        document.getElementById("passwordChangeStatus").textContent = "";
        return true;
    }
}

function confirmPassword() {
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (newPassword !== confirmPassword) {
        document.getElementById("passwordChangeStatus").textContent = "Passwords don't match.";
        return false;
    } else {
        document.getElementById("passwordChangeStatus").textContent = "";
        return true;
    }
}

function handleChangePasswordDiv(app, username) {
    const token = localStorage.getItem('token');
    const passwordForm = document.getElementById("passwordForm");
    const currentPasswordInput = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const passwordChangeStatus = document.getElementById("passwordChangeStatus");

    newPasswordInput.addEventListener("input", validatePassword);
    confirmPasswordInput.addEventListener("input", confirmPassword);

    passwordForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmationPassword = confirmPasswordInput.value;

        // Check if new password and confirm password match
        if (newPassword !== confirmationPassword || !confirmPassword()) {
            passwordChangeStatus.textContent = "New password and confirmation do not match or password not ruleconform.";
            return;
        }

        // Create the data for the request
        const data = {
            currentPassword: currentPassword,
            newPassword: newPassword
        };
        // send new password to server
        fetch("/api/changePassword/", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                passwordChangeStatus.textContent = "Password changed successfully.";
                currentPasswordInput.value = "";
                newPasswordInput.value = "";
                confirmPasswordInput.value = "";
            }
            else {
                if (response.status === 400) {
                    return response.json()
                }
                else
                    throw new Error(response.statusText);
            }
        })
        .then(data => {
            for (let key in data)
                passwordChangeStatus.textContent = data[key];
        })
        .catch(error => {
            console.error(error);
        });
    });
}

function handleChangeAvatarDiv(app, username) {
    const token = localStorage.getItem('token');
    console.log("Auth Token:", token);
    const avatarForm = document.getElementById("avatarForm");
    const avatarInput = document.getElementById("avatarInput");
    const avatarUploadStatus = document.getElementById("avatarUploadStatus");

    avatarForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const formData = new FormData();
        const file = avatarInput.files[0];

        if (!file) {
            avatarUploadStatus.textContent = "Please select a file to upload.";
            return;
        }

        formData.append("avatar", file);

        fetch("/api/changeAvatar/", {
            method: "PUT",
            headers: {
                "Authorization": `Token ${token}`, // This line must remain as is for proper header inclusion
            },
            body: formData,
        })
        .then(response => {
            if (response.status == 200) {
                avatarUploadStatus.textContent = "Avatar uploaded successfully.";
                loadAvatar(username);
            } else if (response.status == 400) {
                avatarUploadStatus.textContent = "Image was not a valid png or jpg.";
            }
            else
                throw new Error(response.statusText);
        })
        .catch(error => {
            avatarUploadStatus.textContent = "Error uploading avatar. Please try again.";
            console.error(error);
        });
    });
}

function handleSetDisplayName(app, username) {
    const token = localStorage.getItem('token');
    const form = document.getElementById("setDisplayName");
    const displayName = document.getElementById("displayName");
    const status = document.getElementById("displayNameStatus");

    // get current display name
    fetch("/api/getDisplayName/", {
        method: "GET",
        headers: {
            "Authorization": `Token ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    })
    .then(data => {
        displayName.placeholder = `Currently ${data.display_name}`;
    })
    .catch(error => {
        console.error(error);
    });

    form.addEventListener("submit", function(event) {
        const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const displayName = document.getElementById("displayName");

        event.preventDefault();

        // catch it if user sets new display name to old display name
        if (displayName.value === displayName.placeholder.substring(10)) {
            status.innerHTML = "This is your display name already."
            return;
        }

        // send new display name to endpoint
        fetch("/api/setDisplayName/", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken,
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify({
                newDisplayName: displayName.value
            })
          })
          .then(response => {
            if (response.ok) {
                status.innerHTML = "Updated the display name to " + displayName.value;
                displayName.placeholder = `Currently ${displayName.value}`;
                displayName.value = "";    
            }
            else {
                if (response.status === 409) {
                    status.innerHTML = "Name sadly already taken. But twas a cool name.";
                }
                else
                    throw new Error(response.statusText);
            }
        })
        .catch(error => {
            console.error(error);
        });
    })
}

function handleWinLossRecordDiv(app, username) {
    const token = localStorage.getItem('token');
    const winLossRecordDiv = document.getElementById("winLossRecord");

    // get win loss record from endpoint
    fetch(`/api/winLossRecord/?user=${username}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        }})
        .then(response => response.json())
        .then(data => {
            const winLossHTML = `
                <div class="text-center">
                <h1 style="color: magenta;">${data.wins} : ${data.losses}</h1>
                </div>
            `;
            winLossRecordDiv.innerHTML += winLossHTML;
        })
        .catch(error => {
            console.error(error);
        });
}

function handleGameHistoryDiv(app) {
    const token = localStorage.getItem('token');
    const gamesTable = document.getElementById("gamesTable");

    // get list of game statistics from backend
    fetch("/api/gameList/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        }})
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
        console.error(error);
    });
}

function handleFriendsDiv(app) {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem("user");
    const friendList = document.getElementById("friendList");
    
    // empty friendList of old entries
    friendList.innerHTML = "";

    // get list of friends from the endpoint. Set online/offline label afterwards.
    fetch("/api/friendList/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        }})
    .then(response => response.json())
    .then(data => {
        for (const friend of data) {
            const listItem = document.createElement("li");
            if (friend.isLoggedIn)
                listItem.innerHTML = `<span class="badge bg-success">online</span>`;
            else 
                listItem.innerHTML = `<span class="badge bg-dark">offline</span>`;
            listItem.innerHTML += ` ${friend.username}`;
            listItem.classList.add("list-group-item");
            friendList.appendChild(listItem);
        }    
    })
    .catch(error => {
        console.error(error);
    });
}

function handleAddFriendsDiv(app, username) {
    const token = localStorage.getItem('token');
    const userList = document.getElementById("userList");

    // empty userList of old entries
    userList.innerHTML = "";

    // get 2 datasets from endpoint: friends and users. Set friend label, if user is a friend.
    Promise.all([
            fetch(`/api/friendList/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                }}),
            fetch("/api/userList/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                }})
        ])
        .then(responses => {
            return Promise.all(responses.map(response => response.json()));
        })
        .then(data => {
            const friends = [];
            const users = [];

            for (const item of data[0]) {
                friends.push(item.username);
            }
            for (const item of data[1]) {
                users.push(item.username);
            }
            
            for (const user of users) {
                if (user === username)
                    continue;

                const anchor = document.createElement("a");
    
                anchor.setAttribute("href", "#");
                anchor.style.setProperty("color", "black", "important");
                anchor.classList.add("list-group-item");
                anchor.classList.add("list-group-item-action");
                anchor.classList.add("list-group-item-action");
                anchor.id = "add_" + user;
                anchor.textContent = user;
                if (friends.includes(user)) {
                    anchor.innerHTML = user + " <span class='badge bg-success'>friend</span>";
                }

                anchor.addEventListener("click", function(event) {
                    event.preventDefault();
                    addFriend(username, anchor.id.substring(4), friends.includes(user));
                });

                userList.appendChild(anchor);
            }  
        })
        .catch(error => {
            console.error(error);
        });
}

function addFriend(username, friend, isFriend) {
    const token = localStorage.getItem('token');
    const data = {
        user: username,
        friend: friend
      };
      
      // if friend is not friend, we add them
      if (! isFriend) {
        fetch("/api/addFriend/", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            handleFriendsDiv(app);
            handleAddFriendsDiv(app, username);
        })
        .catch(error => {
            console.error(error);
        });
      }
      // if friend is friend, we remove them
      else {
        fetch("/api/removeFriend/", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken,
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            handleFriendsDiv(app);
            handleAddFriendsDiv(app, username);
        })
        .catch(error => {
            console.error(error);
        });
      }
}
