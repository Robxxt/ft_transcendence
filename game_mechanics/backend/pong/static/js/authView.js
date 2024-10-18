import { login, register, logout } from './apiServices.js';
// authView.js
export function authView(type = 'login') {
    const app = document.getElementById('app');
    const isLogin = type === 'login';

    app.innerHTML = `
        <h1 class="text-center mb-4">Welcome</h1>
        <div class="text-center mb-4">
            <button id="show-login-btn" class="btn btn-primary">Login</button>
            <button id="show-register-btn" class="btn btn-secondary">Register</button>
        </div>
        <div id="auth-forms" class="mt-4"></div>
    `;

    document.getElementById('show-login-btn').addEventListener('click', () => renderForm('login'));
    document.getElementById('show-register-btn').addEventListener('click', () => renderForm('register'));

    renderForm(type);
}

export function renderForm(type) {
    const formsContainer = document.getElementById('auth-forms');
    const isLogin = type === 'login';
    formsContainer.innerHTML = `
        <h2>${isLogin ? 'Login' : 'Register'}</h2>
        <form id="${type}-form">
            <div class="mb-3">
                <label for="${type}-username" class="form-label">Username</label>
                <input type="text" class="form-control" id="${type}-username" required>
            </div>
            ${!isLogin ? `
                <div class="mb-3">
                    <label for="${type}-email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="${type}-email" required>
                </div>
            ` : ''}
            <div class="mb-3">
                <label for="${type}-password" class="form-label">Password</label>
                <input type="password" class="form-control" id="${type}-password" required>
            </div>
            <button type="submit" class="btn btn-primary">${isLogin ? 'Login' : 'Register'}</button>
        </form>
    `;
    document.getElementById(`${type}-form`).addEventListener('submit', (e) => {
        e.preventDefault();
        if (isLogin) {
            login();
        } else {
            register();
        }
    });
}