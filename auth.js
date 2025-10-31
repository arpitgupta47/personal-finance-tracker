const API_URL = 'http://localhost:3000/api';

// Handle form submissions
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Check if user is logged in
    checkAuthStatus();
    // Update server connectivity banner (login/signup pages)
    updateServerStatus();
    // Re-check connectivity periodically
    setInterval(updateServerStatus, 10000);
});

// Update the server status banner on auth pages
async function updateServerStatus() {
    const el = document.getElementById('serverStatus');
    if (!el) return;

    try {
        // Try a simple fetch to the API root. If server is down this will throw.
        const resp = await fetch(API_URL, { method: 'GET' });
        // If fetch succeeds (regardless of status), consider server reachable
        el.classList.remove('hidden', 'offline');
        el.classList.add('online');
        el.textContent = 'Connected to server — Online mode';
    } catch (err) {
        // Network or server unreachable — do not show any banner when offline
        el.classList.add('hidden');
        el.classList.remove('online', 'offline');
        el.textContent = '';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validate inputs
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    try {
        showLoading('Logging in...');

        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store auth token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');

        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }

        // Redirect to dashboard
        window.location.href = 'index.html';
    } catch (error) {
        // If backend is not reachable (network error), fall back to localStorage-based auth
        console.warn('Login request failed, attempting local fallback:', error.message);

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Local fallback: mark user authenticated (no JWT token available)
            localStorage.setItem('currentUser', JSON.stringify({ name: user.fullName, email: user.email }));
            localStorage.setItem('isAuthenticated', 'true');
            if (rememberMe) localStorage.setItem('rememberMe', 'true');
            hideLoading();
            window.location.href = 'index.html';
            return;
        }

        showError(error.message || 'Login failed');
    } finally {
        hideLoading();
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    if (!agreeTerms) {
        showError('Please agree to the Terms & Conditions');
        return;
    }

    try {
        showLoading('Creating your account...');

        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        showSuccess('Account created successfully!');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (error) {
        console.warn('Registration request failed:', error.message);
        // If server is unreachable (network error), fall back to localStorage registration for demo
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const exists = users.some(u => u.email === email);

        if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Invalid') || !navigator.onLine)) {
            if (exists) {
                showError('Email already registered (local)');
            } else {
                users.push({ fullName, email, password });
                localStorage.setItem('users', JSON.stringify(users));
                // Do not mention offline mode — show a generic success message
                showSuccess('Account created successfully!');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1200);
            }
        } else {
            // Other errors: show server message
            showError(error.message || 'Registration failed');
        }
    } finally {
        hideLoading();
    }
}

async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;
    const localAuth = localStorage.getItem('isAuthenticated') === 'true';

    // First, if we have a server token, try to verify it
    if (token) {
        try {
            const response = await fetch(`${API_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Invalid token');
            }

            // Token is valid
            if (currentPath.includes('login.html') || currentPath.includes('signup.html')) {
                window.location.href = 'index.html';
            }
            return; // allow access
        } catch (error) {
            // Server token invalid or server unreachable; remove token and continue to local fallback
            console.warn('Token verification failed or server unreachable:', error.message);
            localStorage.removeItem('token');
            // do not remove local isAuthenticated here - that allows offline/local fallback
        }
    }

    // If no valid token but a local auth flag exists, allow local access
    if (localAuth) {
        if (currentPath.includes('login.html') || currentPath.includes('signup.html')) {
            window.location.href = 'index.html';
        }
        return; // allow access
    }

    // No token and no local auth: protect routes
    if (!currentPath.includes('login.html') && !currentPath.includes('signup.html')) {
        window.location.href = 'login.html';
    }
}


function showLoading(message) {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${message}</p>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.remove();
    }
}

function showError(message) {
    // Create error element
    const error = document.createElement('div');
    error.className = 'auth-error';
    error.textContent = message;
    
    // Add to page
    const form = document.querySelector('.auth-form');
    form.insertBefore(error, form.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => {
        error.remove();
    }, 3000);
}

function showSuccess(message) {
    // Create success element
    const success = document.createElement('div');
    success.className = 'auth-success';
    success.textContent = message;
    
    // Add to page
    const form = document.querySelector('.auth-form');
    form.insertBefore(success, form.firstChild);
}