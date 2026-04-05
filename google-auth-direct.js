// Google Sign-In via Supabase OAuth
// Client ID is public-facing — safe to include here
const GOOGLE_CLIENT_ID = '696073380462-7qdtlpemitelbthtbds8e64rhsq38ag2.apps.googleusercontent.com';

async function handleGoogleSignIn() {
    try {
        const ready = await waitForSupabase();
        if (!ready) {
            alert('Auth not ready. Please refresh and try again.');
            return;
        }

        // Dynamically build redirect URL from current origin
        // Works on localhost, Vercel preview URLs, and production domain
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const redirectTo = isLocalhost
            ? window.location.origin + '/gousamhithatest-main/index.html'
            : window.location.origin + '/index.html';

        const { error } = await window.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo
            }
        });
        if (error) {
            console.error('Google sign-in error:', error);
            showGoogleMessage('Google sign-in failed: ' + error.message, 'error');
        }
    } catch (err) {
        console.error('Google sign-in exception:', err);
        showGoogleMessage('Google sign-in failed. Please try again.', 'error');
    }
}

async function handleGoogleSignUp() {
    // Sign-up and sign-in are the same flow with Google OAuth
    // Supabase creates the account automatically if it doesn't exist
    handleGoogleSignIn();
}

async function waitForSupabase() {
    if (window.supabase) return true;
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (window.supabase) {
                clearInterval(interval);
                resolve(true);
            }
        }, 100);
        setTimeout(() => { clearInterval(interval); resolve(false); }, 5000);
    });
}

function showGoogleMessage(message, type) {
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#f44336' : '#4caf50'};
        color: white; border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000; font-size: 14px;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// Handle OAuth redirect callback — runs when Supabase redirects back after Google login
window.addEventListener('load', async () => {
    const hash = window.location.hash;
    // Supabase puts access_token in hash after OAuth redirect
    if (hash && hash.includes('access_token')) {
        const ready = await waitForSupabase();
        if (!ready) return;

        const { data: { user }, error } = await window.supabase.auth.getUser();
        if (error || !user) return;

        // Upsert user into users table
        const nameParts = (user.user_metadata?.full_name || user.email).split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create/update user profile via backend API (no direct DB access)
        await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, email: user.email, first_name: firstName, last_name: lastName, role: 'customer' })
        }).catch(e => console.warn('User upsert via API:', e.message));

        // Clean up hash from URL
        history.replaceState(null, '', window.location.pathname);
    }
});

window.handleGoogleSignIn = handleGoogleSignIn;
window.handleGoogleSignUp = handleGoogleSignUp;
