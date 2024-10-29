import { navigateTo } from './router.js';
// apiService.js
export const API_BASE_URL = 'api/';

export async function apiRequest(url, method, body = null, headers = {}) {
    headers['Content-Type'] = 'application/json';
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem("token");
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }
    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : null
    });

    return response;
}

export async function login() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const username = storedUser.username
    const password = storedUser.password

    try {
        const response = await apiRequest(API_BASE_URL + 'login/', 'POST', { username, password });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            navigate('/');
        } else {
            alert('Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

export async function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await apiRequest(API_BASE_URL + 'register/', 'POST', { username, email, password });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            navigate('/');
        } else {
            const errorData = await response.json();
            alert(`Registration failed: ${errorData.detail || 'Please try again.'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

export async function logout() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(API_BASE_URL + 'logout/', {
            method: 'POST',
            headers: { 'Authorization': `Token ${token}` }
        });

        if (response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            navigate('/login');
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

export async function joinGameRoom(aiPlay) {
    //const aiPlay = true; // debug
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const username = storedUser.name;
    let requestBody = {"aiPlay": aiPlay,
                        "username": username
    };

    // if (aiPlay == true)
    //     requestBody = {"aiPlay": true};
    // else 
    //     requestBody = {"aiPlay": false};
    try {
        const response = await apiRequest(API_BASE_URL + 'join-game-room/', 'POST', requestBody);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Failed to join game room');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
