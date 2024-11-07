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
        username = JSON.parse(localStorage.getItem("user")).name;

    // create html
    navBar.innerHTML = `
        <ul class="nav nav justify-content-end bg-dark">
            <li class="nav-item">
                <a class="nav-link" href="/start" data-link>Start</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/profile" data-link>Profile</a>
            </li>
            <li>
                <a href="#" id="logoutButton" class="nav-link">Logout</a>
            </li>
            <li class="navbar-text text-white">
                ${username}&nbsp;&nbsp;&nbsp;
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
        const token = localStorage.getItem('token');
        const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        // logout at server
        fetch("/api/logout_user/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`,
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify({user : username})
        })
        .then(response => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            navigateTo("/login")
        })
        .catch(error => {
            console.error(error);
        });
    });
}

export async function loadAvatar(username) {
    const token = localStorage.getItem('token');
    const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    console.log('Token for Avatar', token);
    
    try {
        const response = await fetch(`/api/getPng/`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                "X-CSRFToken": csrftoken,
                'Authorization': `Token ${token}`,
            }
        });
        console.log('Fetch response:', response);

        if (response.ok) {
            let blob = await response.blob();
            console.log("Blob:", blob);
            const imageUrl = URL.createObjectURL(blob);
            const imgElement = document.getElementById("avatar");
            
            if (imgElement) {
                imgElement.src = imageUrl;  // Sets the actual image URL
                console.log("Avatar image loaded");
            } else {
                console.error("Avatar image element not found");
            }
            
            console.log('PNG STORED');
            console.log('URL--->', imageUrl);
        } else {
            throw new Error(response.statusText);
        }
    } catch (error) {
        console.error(error);
    }
}
