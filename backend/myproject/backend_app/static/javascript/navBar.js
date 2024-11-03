import { navigateTo } from "./router.js";

// function to create NavBar
export function createNavBar() {
    const navBar = document.getElementById("navBar");

    // get user name
    const user = localStorage.getItem("user");
    let username;
    if (!user || !JSON.parse(user).name) {
        navBar.innerHTML = "Something went wrong";
    }
    else
        username = JSON.parse(localStorage.getItem('user')).name;

    // create html
    navBar.innerHTML = `
        <ul class="nav nav justify-content-end bg-white">
            <li class="nav-item">
                <a class="nav-link" href="/start" data-link>Start</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/profile" data-link>Profile</a>
            </li>
            <li>
                <a href="#" id="logoutButton" class="nav-link">Logout</a>
            </li>
            <li class="navbar-text"">
                ${username}
            </li>
            <li>
                <img id="avatar" src="" alt="Avatar" width=50 height=50 class="rounded-circle"/>
            </li>
        </ul>
    `;

    // load Avatar
    loadAvatar(username);

    // send logout to server
    document.getElementById("logoutButton").addEventListener("click", () => {
        // remove user from storage
        localStorage.removeItem("user");

        // logout at server
        fetch("/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({user : username})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
        })
        .catch(error => {
            console.error(error);
        });
    });
}

export async function loadAvatar(username) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`/api/getAvatar?user=${username}&t` +  new Date().getTime(), {
            cache: 'no-store', // Ensure the request bypasses the cache
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        if (response.ok) {
            let blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            const imgElement = document.getElementById("avatar");
            imgElement.src = imageUrl;          
        } else {
            throw new Error(response.statusText);
        }
    } catch (error) {
        console.error(error);
    }
}
