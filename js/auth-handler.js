// ✅ SECURE AUTH HANDLER - Session Persistence Fixed
// All authentication via backend API with proper localStorage management

console.log('🔐 Loading secure auth handler...');

// Ensure API_BASE_URL is set (config.js should have set this)
if (!window.API_BASE_URL) {
    window.API_BASE_URL = 'http://localhost:4000/api';
}

// Helper to get API base
function getAPIBase() {
    return window.API_BASE_URL || 'http://localhost:4000/api';
}

console.log('🔗 Using API:', getAPIBase());

// ── Global 401 interceptor: auto-logout on expired token ──────────────────
(function() {
    const _fetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await _fetch(...args);
        if (response.status === 401) {
            const url = typeof args[0] === 'string' ? args[0] : '';
            // Only auto-logout for our backend API calls
            if (url.includes('localhost:4000') || url.includes('/api/')) {
                const clone = response.clone();
                try {
                    const json = await clone.json();
                    if (json.message && json.message.includes('expired')) {
                        console.warn('🔒 Token expired - clearing session');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        if (typeof showToast === 'function') {
                            showToast('Session expired. Please login again.', 'error');
                        }
                        setTimeout(() => {
                            if (!window.location.pathname.includes('index.html') &&
                                !window.location.pathname.endsWith('/')) {
                                window.location.href = 'index.html';
                            }
                        }, 1500);
                    }
                } catch(e) { /* ignore parse errors */ }
            }
        }
        return response;
    };
})();

// ══════════════════════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function saveAuthData(token, user) {
    try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ Auth data saved:', { email: user.email, hasToken: !!token });
    } catch (e) {
        console.error('❌ Failed to save auth data:', e);
    }
}

function getAuthToken() {
    return localStorage.getItem('token');
}

function getAuthUser() {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error('❌ Failed to parse user data:', e);
        return null;
    }
}

function clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Also clear legacy keys
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    console.log('✅ Auth data cleared');
}

function isLoggedIn() {
    return !!getAuthToken() && !!getAuthUser();
}

// ══════════════════════════════════════════════════════════════════════════════
// SIGN UP
// ══════════════════════════════════════════════════════════════════════════════

async function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name')?.value;
    const email = document.getElementById('signup-email')?.value;
    const mobile = document.getElementById('signup-mobile')?.value;
    const password = document.getElementById('signup-password')?.value;
    const confirmPassword = document.getElementById('signup-confirm')?.value;
    const messageDiv = document.getElementById('signup-message');
    
    if (password !== confirmPassword) {
        if (messageDiv) {
            messageDiv.textContent = 'Passwords do not match';
            messageDiv.style.color = '#d32f2f';
        }
        return;
    }
    
    try {
        if (messageDiv) {
            messageDiv.textContent = 'Creating account...';
            messageDiv.style.color = '#666';
        }
        
        const response = await fetch(`${getAPIBase()}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                full_name: name,
                phone: mobile
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Signup failed');
        }
        
        // After signup, auto-login
        if (messageDiv) {
            messageDiv.textContent = 'Account created! Logging you in...';
            messageDiv.style.color = '#2e7d32';
        }
        
        // Auto-login after signup
        setTimeout(async () => {
            await handleSignIn({ preventDefault: () => {} }, email, password);
        }, 1000);
        
    } catch (error) {
        console.error('Signup error:', error);
        if (messageDiv) {
            messageDiv.textContent = error.message || 'Error creating account';
            messageDiv.style.color = '#d32f2f';
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// SIGN IN
// ══════════════════════════════════════════════════════════════════════════════

async function handleSignIn(event, emailOverride, passwordOverride) {
    event.preventDefault();
    
    const emailInput = document.getElementById('signin-email');
    const passwordInput = document.getElementById('signin-password');
    const messageDiv = document.getElementById('signin-message');
    
    const email = emailOverride || emailInput?.value;
    const password = passwordOverride || passwordInput?.value;
    
    if (!email || !password) {
        if (messageDiv) {
            messageDiv.textContent = '⚠️ Please enter email and password';
            messageDiv.style.color = '#d32f2f';
        }
        return;
    }
    
    try {
        if (messageDiv) {
            messageDiv.textContent = '⏳ Signing in...';
            messageDiv.style.color = '#666';
        }
        
        console.log('🔐 Attempting login for:', email);
        
        const response = await fetch(`${getAPIBase()}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        console.log('📥 Login response:', result);
        
        if (!response.ok) {
            throw new Error(result.error || 'Login failed');
        }
        
        // Extract data from response
        const { user, session } = result.data || result;
        
        if (!session?.access_token || !user) {
            throw new Error('Invalid response from server');
        }
        
        // Save auth data
        saveAuthData(session.access_token, user);
        
        console.log('✅ Login successful for:', user.email);
        
        if (messageDiv) {
            messageDiv.textContent = '✓ Login successful!';
            messageDiv.style.color = '#2e7d32';
        }
        
        // Close modal and update UI
        setTimeout(() => {
            closeAuthModal();
            updateUIAfterLogin();
            
            // Redirect admin users
            if (user.role === 'admin' || email === 'admin@123.com') {
                window.location.href = 'admin-dashboard.html';
            } else {
                // Reload to apply session
                window.location.reload();
            }
        }, 500);
        
    } catch (error) {
        console.error('💥 Login error:', error);
        if (messageDiv) {
            messageDiv.textContent = '❌ ' + (error.message || 'Login failed');
            messageDiv.style.color = '#d32f2f';
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════════════════════════════════════════════

async function logout() {
    console.log('🚪 Logout function called');
    
    // Ask for confirmation
    if (!confirm('Are you sure you want to logout?')) {
        console.log('❌ Logout cancelled by user');
        return;
    }
    
    try {
        const token = getAuthToken();
        console.log('🔑 Token exists:', !!token);
        
        if (token) {
            // Call backend signout
            console.log('📡 Calling backend signout...');
            await fetch(`${getAPIBase()}/auth/signout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }).catch((err) => {
                console.log('⚠️ Backend signout error (ignoring):', err);
            });
        }
        
        console.log('🗑️ Clearing auth data...');
        clearAuthData();
        
        console.log('✅ Logged out successfully');
        console.log('🔄 Redirecting to home...');
        
        // Force redirect
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        // Force logout anyway
        clearAuthData();
        window.location.href = 'index.html';
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// SESSION RESTORATION
// ══════════════════════════════════════════════════════════════════════════════

function restoreSession() {
    const token = getAuthToken();
    const user = getAuthUser();
    
    console.log('🔄 Restoring session...');
    console.log('   Token exists:', !!token);
    console.log('   User exists:', !!user);
    
    if (token && user) {
        console.log('✅ Session restored for:', user.email);
        updateUIAfterLogin();
        
        // Close auth modal if open
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.remove('active');
            authModal.style.display = 'none';
        }
    } else {
        console.log('❌ No active session');
        updateUIAfterLogout();
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// UI UPDATES
// ══════════════════════════════════════════════════════════════════════════════

function updateUIAfterLogin() {
    const user = getAuthUser();
    if (!user) return;
    
    console.log('🎨 Updating UI for logged-in user:', user.email);
    
    // Update profile button
    const profileBtn = document.getElementById('profile-btn-desktop') || document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.classList.add('logged-in');
        profileBtn.title = user.email;
        
        // Show user initial
        const iconPlaceholder = profileBtn.querySelector('.profile-icon-placeholder');
        if (iconPlaceholder) {
            const initial = user.email.charAt(0).toUpperCase();
            iconPlaceholder.innerHTML = `<div style="width: 32px; height: 32px; border-radius: 50%; background: #4a7c59; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px;">${initial}</div>`;
        }
    }
    
    // Update profile dropdown if exists
    const nameEl = document.getElementById('profile-user-name');
    const emailEl = document.getElementById('profile-user-email');
    if (nameEl) nameEl.textContent = user.email;
    if (emailEl) emailEl.textContent = user.email;
}

function updateUIAfterLogout() {
    console.log('🎨 Updating UI for logged-out user');
    
    // Reset profile button
    const profileBtn = document.getElementById('profile-btn-desktop') || document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.classList.remove('logged-in');
        profileBtn.title = 'Login / Sign Up';
        
        // Restore icon
        const iconPlaceholder = profileBtn.querySelector('.profile-icon-placeholder');
        if (iconPlaceholder) {
            iconPlaceholder.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE BUTTON SETUP
// ══════════════════════════════════════════════════════════════════════════════

function setupProfileButton() {
    console.log('🔧 Setting up profile button...');
    
    const profileBtn = document.getElementById('profile-btn-desktop') || document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    console.log('   Profile button found:', !!profileBtn);
    console.log('   Profile dropdown found:', !!profileDropdown);
    
    if (profileBtn) {
        // Remove inline onclick
        profileBtn.removeAttribute('onclick');
        
        // Clone to remove all event listeners
        const newBtn = profileBtn.cloneNode(true);
        profileBtn.parentNode.replaceChild(newBtn, profileBtn);
        
        console.log('✅ Profile button cloned and replaced');
        
        // Add new click handler
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ Profile button clicked!');
            console.log('   Is logged in:', isLoggedIn());
            
            if (isLoggedIn()) {
                console.log('✅ User is logged in - redirecting to profile.html');
                // Always redirect to profile page when logged in
                window.location.href = 'profile.html';
            } else {
                console.log('❌ User not logged in - opening auth modal');
                // User not logged in - open auth modal
                openAuthModal();
            }
        });
        
        console.log('✅ Click handler attached');
    } else {
        console.log('❌ Profile button not found!');
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const currentBtn = document.getElementById('profile-btn-desktop') || document.getElementById('profile-btn');
        if (profileDropdown && !currentBtn?.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.style.display = 'none';
        }
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

function openAuthModal() {
    // Don't open if already logged in
    if (isLoggedIn()) {
        window.location.href = 'profile.html';
        return;
    }
    
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('active');
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
}

function switchTab(tab) {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'signin') {
        if (signinForm) signinForm.classList.add('active');
        if (signupForm) signupForm.classList.remove('active');
        if (tabs[0]) tabs[0].classList.add('active');
    } else {
        if (signupForm) signupForm.classList.add('active');
        if (signinForm) signinForm.classList.remove('active');
        if (tabs[1]) tabs[1].classList.add('active');
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// GOOGLE AUTH
// ══════════════════════════════════════════════════════════════════════════════

const GOOGLE_CLIENT_ID = '696073380462-7qdtlpemitelbthtbds8e64rhsq38ag2.apps.googleusercontent.com';

function loadGoogleScript() {
    if (document.getElementById('google-gsi-script')) return;
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

async function handleGoogleCredential(response) {
    const credential = response.credential;
    const msgEl = document.getElementById('signin-message');

    try {
        if (msgEl) { msgEl.textContent = 'Signing in with Google...'; msgEl.style.color = '#4a7c59'; }

        const apiBase = window.API_BASE_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiBase}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Google sign-in failed');
        }

        const { user, session } = data.data;
        saveAuthData(session.access_token, {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        });

        if (msgEl) { msgEl.textContent = 'Signed in successfully!'; msgEl.style.color = '#4a7c59'; }

        closeAuthModal();
        updateUIAfterLogin();

        if (typeof showToast === 'function') showToast('Welcome! Signed in with Google.', 'success');

        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.reload();
            }
        }, 500);

    } catch (err) {
        console.error('Google sign-in error:', err);
        if (msgEl) { msgEl.textContent = err.message || 'Google sign-in failed'; msgEl.style.color = '#d32f2f'; }
        if (typeof showToast === 'function') showToast('Google sign-in failed: ' + err.message, 'error');
    }
}

function initGoogleSignIn() {
    if (!window.google) {
        setTimeout(initGoogleSignIn, 300);
        return;
    }
    window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
    });
}

function handleGoogleSignIn() {
    loadGoogleScript();
    // Wait for Google script then prompt
    const tryPrompt = () => {
        if (window.google && window.google.accounts) {
            initGoogleSignIn();
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback to renderButton popup
                    triggerGooglePopup();
                }
            });
        } else {
            setTimeout(tryPrompt, 300);
        }
    };
    tryPrompt();
}

function triggerGooglePopup() {
    // Create a temporary div and render the Google button, then click it
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position:fixed;top:-9999px;left:-9999px;';
    document.body.appendChild(tempDiv);

    window.google.accounts.id.renderButton(tempDiv, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
    });

    const btn = tempDiv.querySelector('div[role="button"]');
    if (btn) btn.click();
    setTimeout(() => document.body.removeChild(tempDiv), 1000);
}

function handleGoogleSignUp() {
    handleGoogleSignIn(); // Same flow for sign up
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

window.handleSignUp = handleSignUp;
window.handleSignIn = handleSignIn;
window.logout = logout;
window.logoutUser = logout; // Alias for profile page
window.isLoggedIn = isLoggedIn;
window.getAuthToken = getAuthToken;
window.getAuthUser = getAuthUser;
window.getCurrentUser = getAuthUser; // Alias
window.checkAuth = getAuthUser; // Alias
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchTab = switchTab;
window.handleGoogleSignIn = handleGoogleSignIn;
window.handleGoogleSignUp = handleGoogleSignUp;

// Fetch with auth helper
window.fetchWithAuth = async function(url, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, { ...options, headers });
};

// ══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════════

function initialize() {
    console.log('🚀 Initializing auth handler...');
    restoreSession();
    
    // Try to setup profile button immediately
    setupProfileButton();
    
    // Also try again after a short delay (in case DOM isn't fully ready)
    setTimeout(() => {
        console.log('🔄 Retrying profile button setup...');
        setupProfileButton();
    }, 500);
    
    // And one more time after 1 second
    setTimeout(() => {
        console.log('🔄 Final profile button setup attempt...');
        setupProfileButton();
    }, 1000);
    
    console.log('✅ Auth handler initialized');
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

console.log('✅ Auth handler loaded');
