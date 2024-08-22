import { navigateTo } from './router.js';

// function to create NavBar
export function createNavBar() {
    const navBar = document.getElementById('navBar');
    navBar.innerHTML = `
        <ul class="nav nav justify-content-end">
            <li class="nav-item">
                <a class="nav-link" href="/start">Start</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/profile">Profile</a>
            </li>
            <li>
                <a href="#" id="logoutButton" class="nav-link">Logout</a>
            </li>
            <li class="navbar-text"">
                ${JSON.parse(localStorage.getItem('user')).name}
            </li>
            <li>
                <img id="avatar" src="" alt="Avatar" width=50 height=50 class="rounded-circle"/>
            </li>
        </ul>
    `;

    // load Avatart
    loadAvatar(localStorage.getItem('user'));

    // logout
    document.getElementById('logoutButton').addEventListener('click', () => {
        // remove user from storage
        localStorage.removeItem('user');

        // logout at server
        fetch('localhost/logout')
            .then(() => {
                navigateTo('/');
            })
    });
}


export async function loadAvatar(user) {
    try {
        const user = localStorage.getItem('user');
        const username = JSON.parse(user).name;
        const response = await fetch(`/avatar?username=${username}`);

        if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            document.getElementById('avatar').src = imageUrl;
        } else {
            console.error('Failed to load avatar:', response.statusText);
        }
    } catch (error) {
        console.error('Error loading avatar:', error);
    }
}
