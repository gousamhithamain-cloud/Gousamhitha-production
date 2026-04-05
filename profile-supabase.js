// Profile Page - Supabase Version with Enhanced Error Handling

// Wait for Supabase to be ready
window.addEventListener('supabaseReady', function() {
    console.log('✅ Supabase ready event received');
    checkAndLoadProfile();
});

// Also try after a short delay
setTimeout(checkAndLoadProfile, 1000);

// Fallback check after longer delay
setTimeout(() => {
    if (!window.supabase) {
        console.error('❌ Supabase failed to load after 3 seconds');
        document.getElementById('loading').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                <h3>Connection Error</h3>
                <p>Unable to connect to the server. Please:</p>
                <ul style="text-align: left; display: inline-block; margin: 1rem 0;">
                    <li>Check your internet connection</li>
                    <li>Refresh the page</li>
                    <li>Try again in a few moments</li>
                </ul>
                <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Refresh Page
                </button>
                <br><br>
                <a href="index.html" style="color: #4a7c59;">← Go back to Home</a>
            </div>
        `;
    }
}, 3000);

async function checkAndLoadProfile() {
    if (!window.supabase) {
        console.log('⏳ Waiting for Supabase...');
        setTimeout(checkAndLoadProfile, 500);
        return;
    }

    console.log('🔍 Checking authentication...');
    
    try {
        const { data: { user }, error } = await window.supabase.auth.getUser();
        
        if (error) {
            console.error('❌ Auth error:', error);
            document.getElementById('loading').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                    <h3>Session Expired</h3>
                    <p>Your session has expired. Please log in again.</p>
                    <a href="index.html" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #4a7c59; color: white; text-decoration: none; border-radius: 5px;">
                        Go to Home
                    </a>
                </div>
            `;
            return;
        }
        
        console.log('👤 User:', user ? 'Authenticated' : 'Not authenticated');
        
        if (user) {
            loadProfile(user);
        } else {
            console.log('🔄 Not authenticated, showing login prompt...');
            document.getElementById('loading').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <h3>Not Logged In</h3>
                    <p>Please log in to view your profile.</p>
                    <a href="index.html" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #4a7c59; color: white; text-decoration: none; border-radius: 5px;">
                        Go to Home & Login
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error checking auth:', error);
        document.getElementById('loading').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                <h3>Error Loading Profile</h3>
                <p>There was an error loading your profile. Please try again.</p>
                <button onclick="checkAndLoadProfile()" style="padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 0.5rem;">
                    Try Again
                </button>
                <a href="index.html" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #666; color: white; text-decoration: none; border-radius: 5px;">
                    Go to Home
                </a>
            </div>
        `;
    }
}

async function loadProfile(user) {
    const loading = document.getElementById('loading');
    const content = document.getElementById('profile-content');
    const API = window.API_BASE_URL || 'http://localhost:4000/api';
    const token = localStorage.getItem('auth_token') || '';

    try {
        // Fetch user profile via backend API
        const res = await fetch(`${API}/users/${user.id}`, { headers: { 'Authorization': 'Bearer ' + token } });
        const json = await res.json();
        const userData = json.user || {};

        const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        const displayName = fullName || user.email?.split('@')[0] || 'User';
        const initial = displayName.charAt(0).toUpperCase();

        document.getElementById('profile-avatar').textContent = initial;
        document.getElementById('profile-name').textContent = displayName;
        document.getElementById('profile-email').textContent = user.email || 'No email';
        document.getElementById('field-name').textContent = fullName || '-';
        document.getElementById('field-email').textContent = user.email || '-';
        document.getElementById('field-phone').textContent = userData.phone || '-';
        document.getElementById('field-address').textContent = userData.address || '-';
        document.getElementById('field-joined').textContent = user.created_at
            ? new Date(user.created_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '-';

        // Fetch orders count via API
        try {
            const oRes = await fetch(`${API}/orders/user/${user.id}`, { headers: { 'Authorization': 'Bearer ' + token } });
            const oJson = await oRes.json();
            document.getElementById('field-orders').textContent = (oJson.orders || []).length;
        } catch (e) { document.getElementById('field-orders').textContent = '0'; }

        // Fetch cart count via API
        try {
            const cRes = await fetch(`${API}/cart/${user.id}`, { headers: { 'Authorization': 'Bearer ' + token } });
            const cJson = await cRes.json();
            const cartCount = (cJson.cart || []).reduce((s, i) => s + (i.quantity || 0), 0);
            document.getElementById('field-cart').textContent = cartCount;
        } catch (e) { document.getElementById('field-cart').textContent = '0'; }

        loading.style.display = 'none';
        content.style.display = 'block';
        console.log('✅ Profile loaded via API');

    } catch (error) {
        console.error('❌ Error loading profile:', error);
        loading.innerHTML = '<div style="text-align:center;padding:2rem;color:#d32f2f;"><h3>Profile Loading Error</h3><p>Unable to load your profile data.</p><a href="index.html" style="display:inline-block;margin-top:1rem;padding:.5rem 1rem;background:#666;color:white;text-decoration:none;border-radius:5px;">Go to Home</a></div>';
    }
}

async function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            if (window.AuthAPI) await window.AuthAPI.signout();
            else if (window.supabase) await window.supabase.auth.signOut();
            window.location.href = 'index.html';
        } catch (e) { window.location.href = 'index.html'; }
    }
}

// Make functions globally available for debugging
window.checkAndLoadProfile = checkAndLoadProfile;
window.loadProfile = loadProfile;