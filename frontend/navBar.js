import { navigateTo } from './router.js';

// function to create NavBar
export function createNavBar() {
    const navBar = document.getElementById('navBar');
    navBar.innerHTML = `
        <a href="/dashboard" data-link="true">Dashboard</a>
        <a href="/profile" data-link="true">Profile</a>
        <a href="/profile" data-link="true">${JSON.parse(localStorage.getItem('user')).name}</a>
        <img id="avatar" src="" alt="Avatar" />
        <button id="logoutButton">Logout</button>
    `;

    // logout
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.removeItem('user');
        fetch('localhost/logout')
            .then(() => {
                navigateTo('/login');
            })
    });

    // // Set avatar
    // const avatarImg = document.getElementById('avatar');
    // const storedAvatarUrl = localStorage.getItem('avatarUrl');
    // if (storedAvatarUrl) {
    //     avatarImg.src = storedAvatarUrl;
    // } else {
    //     fetchAvatar().then(url => {
    //         avatarImg.src = url;
    //         localStorage.setItem('avatarUrl', url);
    //     });
    // }
}

// Function to fetch avatar from server
// function fetchAvatar() {
//     return new Promise(resolve => {
//         // Simulate fetching avatar from server
//         setTimeout(() => {
//             resolve(user.avatarUrl);
//         }, 1000);
//     });
// }
