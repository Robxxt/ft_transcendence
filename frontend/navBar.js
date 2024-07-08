// Function to create NavBar
export function createNavBar() {
    const navBar = document.getElementById('navBar');
    navBar.innerHTML = `
        <a href="/profile" data-link>Profile</a>
        <a href="/dashboard" data-link>Dashboard</a>
        <button id="logoutButton">Logout</button>
        <img id="avatar" src="" alt="Avatar" />
    `;

    // // Handle logout
    // document.getElementById('logoutButton').addEventListener('click', () => {
    //     localStorage.removeItem('avatarUrl');
    //     user.isLoggedIn = false;
    //     renderApp();
    // });

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
