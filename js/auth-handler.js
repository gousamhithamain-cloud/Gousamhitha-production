// ✅ SECURE AUTH HANDLER - All authentication via backend API
// NO direct database or Supabase access

console.log('🔐 Loading secure auth handler...');

const API_BASE = window.API_BASE_URL || 'http://localhost:4000/api';

// ── Sign Up ───────────────────────────────────────────────────────────────────
async function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const mobile = document.getElementById('signup-mobile').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const messageDiv = document.getElementById('signup-message');
    
    if (password !== confirmPassword) {
        messageDiv.textContent = 'Passwords do not match';
        messageDiv.style.color = '#d32f2f';
        return;
    }
    
    try {
        messageDiv.textContent = 'Creating account...';
        messageDiv.style.color = '#666';
        
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                full_name: name,
                phone: mobile
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }
        
        // Store auth token and user data
        if (data.session?.access_token) {
            localStorage.setItem('auth_token', data.session.access_token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
        
        messageDiv.textContent = 'Account created successfully!';
        messageDiv.style.color = '#2e7d32';
        
        setTimeout(() => {
            closeAuthModal();
            location.reload();
        }, 1000);
        
    } catch (error) {
        console.error('Signup error:', error);
        messageDiv.textContent = error.message || 'Error creating account';
        messageDiv.style.color = '#d32f2f';
    }
}

// ── Sign In ───────────────────────────────────────────────────────────────────
async function handleSignIn(event) {
    event.preventDefault();
    console.log('🔐 Sign in attempt started');
    
    const emailInput = document.getElementById('signin-email');
    const passwordInput = document.getElementById('signin-password');
    const messageDiv = document.getElementById('signin-message');
    
    const email = emailInput ? emailInput.value : '';
    const password = passwordInput ? passwordInput.value : '';
    
    if (!email || !password) {
        if (messageDiv) {
            messageDiv.textContent = '⚠️ Please enter email and password';
            messageDiv.style.color = '#d32f2f';
            messageDiv.style.backgroundColor = '#ffebee';
            messageDiv.style.display = 'block';
        }
        return;
    }
    
    try {
        if (messageDiv) {
            messageDiv.textContent = '⏳ Signing in...';
            messageDiv.style.color = '#666';
            messageDiv.style.backgroundColor = '#f5f5f5';
            messageDiv.style.display = 'block';
        }
        
        console.log('Attempting login for:', email);
        
        const response = await fetch(`${API_BASE}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // Store auth token and user data
        if (data.session?.access_token) {
            localStorage.setItem('auth_token', data.session.access_token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
        
        console.log('✅ Login successful');
        
        // Check if admin
        if (email === 'admin@123.com') {
            if (messageDiv) {
                messageDiv.textContent = '✓ Login successful! Redirecting to admin...';
                messageDiv.style.color = '#2e7d32';
                messageDiv.style.backgroundColor = '#e8f5e9';
            }
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 500);
            return;
        }
        
        if (messageDiv) {
            messageDiv.textContent = '✓ Login successful!';
            messageDiv.style.color = '#2e7d32';
            messageDiv.style.backgroundColor = '#e8f5e9';
            messageDiv.style.fontWeight = '600';
            messageDiv.style.display = 'block';
        }
        
        setTimeout(() => {
            closeAuthModal();
            location.reload();
        }, 500);
        
    } catch (error) {
        console.error('💥 Login error:', error);
        if (messageDiv) {
            messageDiv.textContent = '❌ ' + (error.message || 'Login failed. Please check your credentials.');
            messageDiv.style.color = '#d32f2f';
            messageDiv.style.backgroundColor = '#ffebee';
            messageDiv.style.fontWeight = '600';
            messageDiv.style.display = 'block';
        }
    }
}

// ── Logout ────────────────────────────────────────────────────────────────────
async function logout() {
    try {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
            await fetch(`${API_BASE}/auth/signout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }).catch(() => {});
        }
        
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        // Clear local storage anyway
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = 'index.html';
    }
}

// Alias for logout (used in HTML)
function logoutUser() {
    return logout();
}

// ── Google Sign In ────────────────────────────────────────────────────────────
async function handleGoogleSignIn() {
    const messageDiv = document.getElementById('signin-message');
    if (messageDiv) {
        messageDiv.textContent = 'Google Sign-In is not yet configured';
        messageDiv.style.color = '#f57c00';
        messageDiv.style.backgroundColor = '#fff3e0';
        messageDiv.style.display = 'block';
    }
    console.log('Google Sign-In not yet implemented');
}

// ── Google Sign Up ────────────────────────────────────────────────────────────
async function handleGoogleSignUp() {
    const messageDiv = document.getElementById('signup-message');
    if (messageDiv) {
        messageDiv.textContent = 'Google Sign-Up is not yet configured';
        messageDiv.style.color = '#f57c00';
        messageDiv.style.backgroundColor = '#fff3e0';
        messageDiv.style.display = 'block';
    }
    console.log('Google Sign-Up not yet implemented');
}

// ── Profile Modal Functions ───────────────────────────────────────────────────
function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'none';
}

function editProfile() {
    // Redirect to profile page for editing
    window.location.href = 'profile.html';
}

// ── Admin Modal Functions ─────────────────────────────────────────────────────
function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.remove('active');
}

async function handleAdminLoginModal(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-modal-email').value;
    const password = document.getElementById('admin-modal-password').value;
    const messageDiv = document.getElementById('admin-modal-message');
    
    try {
        if (messageDiv) {
            messageDiv.textContent = 'Signing in...';
            messageDiv.style.color = '#666';
            messageDiv.style.backgroundColor = '#f5f5f5';
            messageDiv.style.display = 'block';
        }
        
        const response = await fetch(`${API_BASE}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // Store auth token and user data
        if (data.session?.access_token) {
            localStorage.setItem('auth_token', data.session.access_token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
        
        if (messageDiv) {
            messageDiv.textContent = 'Login successful! Redirecting...';
            messageDiv.style.color = '#2e7d32';
            messageDiv.style.backgroundColor = '#e8f5e9';
        }
        
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 500);
        
    } catch (error) {
        console.error('Admin login error:', error);
        if (messageDiv) {
            messageDiv.textContent = error.message || 'Login failed';
            messageDiv.style.color = '#d32f2f';
            messageDiv.style.backgroundColor = '#ffebee';
        }
    }
}

// ── Check Auth ────────────────────────────────────────────────────────────────
function checkAuth() {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// ── Get Current User ──────────────────────────────────────────────────────────
function getCurrentUser() {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// ── Modal Functions ───────────────────────────────────────────────────────────
function openAuthModal() {
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

// ── Global Exports ────────────────────────────────────────────────────────────
window.handleSignUp = handleSignUp;
window.handleSignIn = handleSignIn;
window.logout = logout;
window.logoutUser = logoutUser;
window.checkAuth = checkAuth;
window.getCurrentUser = getCurrentUser;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchTab = switchTab;
window.handleGoogleSignIn = handleGoogleSignIn;
window.handleGoogleSignUp = handleGoogleSignUp;
window.closeProfileModal = closeProfileModal;
window.editProfile = editProfile;
window.closeAdminModal = closeAdminModal;
window.handleAdminLoginModal = handleAdminLoginModal;

// Legacy compatibility
window.adminLogout = logout;

// ── Profile Button Setup ──────────────────────────────────────────────────────
function setupProfileButton() {
    const profileBtn = document.getElementById('profile-btn-desktop');
    const bottomNavProfile = document.getElementById('bottom-nav-profile');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    // Desktop profile button click
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const user = getCurrentUser();
            
            if (user) {
                // User is logged in - toggle dropdown
                if (profileDropdown) {
                    const isVisible = profileDropdown.style.display === 'block';
                    profileDropdown.style.display = isVisible ? 'none' : 'block';
                    
                    // Update dropdown content
                    const nameEl = document.getElementById('profile-user-name');
                    const emailEl = document.getElementById('profile-user-email');
                    if (nameEl) nameEl.textContent = user.full_name || user.email;
                    if (emailEl) emailEl.textContent = user.email;
                }
            } else {
                // User not logged in - open auth modal
                openAuthModal();
            }
        });
    }
    
    // Mobile bottom nav profile button
    if (bottomNavProfile) {
        bottomNavProfile.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const user = getCurrentUser();
            
            if (user) {
                // Redirect to profile page or show dropdown
                window.location.href = 'profile.html';
            } else {
                // User not logged in - open auth modal
                openAuthModal();
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (profileDropdown && !profileBtn?.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.style.display = 'none';
        }
    });
    
    // Update profile button appearance based on login status
    updateProfileButtonState();
}

function updateProfileButtonState() {
    const user = getCurrentUser();
    const profileBtn = document.getElementById('profile-btn-desktop');
    
    if (profileBtn) {
        if (user) {
            profileBtn.classList.add('logged-in');
            profileBtn.title = user.full_name || user.email;
        } else {
            profileBtn.classList.remove('logged-in');
            profileBtn.title = 'Login / Sign Up';
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupProfileButton);
} else {
    setupProfileButton();
}

console.log('✅ Secure auth handler loaded - all operations via backend API');
console.log('✅ Auth functions registered:', {
    handleSignUp: typeof window.handleSignUp,
    handleSignIn: typeof window.handleSignIn,
    logout: typeof window.logout,
    checkAuth: typeof window.checkAuth,
    getCurrentUser: typeof window.getCurrentUser
});
