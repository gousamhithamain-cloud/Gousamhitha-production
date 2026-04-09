// profile-handler.js — API-only version (no Supabase)
// Uses localStorage token + backend API for all auth checks

console.log('🔧 Profile handler loading...');

if (!window.profileHandlerLoaded) {
    window.profileHandlerLoaded = true;

    function initProfileButton() {
        const profileBtn = document.getElementById('profile-btn-desktop') ||
            document.getElementById('profile-btn') ||
            document.querySelector('.profile-icon-btn:not(.hidden)') ||
            document.querySelector('a[onclick*="openAuthModal"]');

        if (!profileBtn) {
            setTimeout(initProfileButton, 100);
            return;
        }

        profileBtn.style.display = 'flex';
        profileBtn.style.visibility = 'visible';
        profileBtn.style.pointerEvents = 'auto';
        profileBtn.removeAttribute('onclick');

        const newBtn = profileBtn.cloneNode(true);
        profileBtn.parentNode.replaceChild(newBtn, profileBtn);

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const loggedIn = typeof window.isLoggedIn === 'function'
                ? window.isLoggedIn()
                : !!(localStorage.getItem('token') && localStorage.getItem('user'));

            if (loggedIn) {
                window.location.href = 'profile.html';
            } else {
                if (typeof window.openAuthModal === 'function') {
                    window.openAuthModal();
                } else {
                    const modal = document.getElementById('auth-modal');
                    if (modal) modal.classList.add('active');
                }
            }
        });

        if (typeof window.updateProfileUI === 'function') window.updateProfileUI();
    }

    initProfileButton();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfileButton);
    }
    window.addEventListener('load', initProfileButton);
}

if (!window.updateProfileUI) {
    window.updateProfileUI = async function() {
        const profileBtn = document.getElementById('profile-btn-desktop') ||
            document.getElementById('profile-btn') ||
            document.querySelector('.profile-icon-btn:not(.hidden)');
        const mobileProfileBtn = document.getElementById('bottom-nav-profile');

        if (!profileBtn && !mobileProfileBtn) {
            setTimeout(window.updateProfileUI, 200);
            return;
        }

        if (profileBtn) {
            profileBtn.style.display = 'flex';
            profileBtn.style.visibility = 'visible';
            profileBtn.style.pointerEvents = 'auto';
        }

        // Check auth via localStorage only
        let user = null;
        try {
            const raw = localStorage.getItem('user');
            if (raw) user = JSON.parse(raw);
        } catch (e) {}

        if (!user) {
            if (profileBtn) window.showDefaultProfileIcon && window.showDefaultProfileIcon(profileBtn);
            if (mobileProfileBtn) window.showDefaultMobileProfileIcon && window.showDefaultMobileProfileIcon(mobileProfileBtn);
            return;
        }

        // Fetch full name from backend API
        let userData = null;
        try {
            const token = localStorage.getItem('token') || '';
            const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/users/${user.id}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (res.ok) { const json = await res.json(); userData = json.data || json.user; }
        } catch (e) {}

        const fullName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : '';
        const displayName = fullName || user.email || 'User';
        const initial = displayName.charAt(0).toUpperCase();

        if (profileBtn) {
            profileBtn.innerHTML = `
                <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4a7c59,#2e7d32);color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;cursor:pointer;box-shadow:0 2px 8px rgba(74,124,89,.3);" title="View Profile - ${displayName}">
                    ${initial}
                </div>`;
        }

        if (mobileProfileBtn) {
            const icon = mobileProfileBtn.querySelector('.nav-icon');
            if (icon) { icon.style.color = '#4a7c59'; }
            mobileProfileBtn.querySelector('.login-indicator')?.remove();
            const dot = document.createElement('div');
            dot.className = 'login-indicator';
            dot.style.cssText = 'position:absolute;top:8px;right:8px;width:8px;height:8px;background:#4caf50;border-radius:50%;border:2px solid white;z-index:1;';
            mobileProfileBtn.style.position = 'relative';
            mobileProfileBtn.appendChild(dot);
        }
    };
}

if (!window.showDefaultProfileIcon) {
    window.showDefaultProfileIcon = function(btn) {
        btn.innerHTML = `<div class="profile-icon-placeholder" style="width:36px;height:36px;border-radius:50%;background:#f5f5f5;border:2px solid #ddd;display:flex;align-items:center;justify-content:center;cursor:pointer;" title="Sign In / Sign Up"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#666" stroke-width="2"/><circle cx="12" cy="10" r="3" stroke="#666" stroke-width="2"/><path d="M6.5 18.5C7.5 16.5 9.5 15 12 15C14.5 15 16.5 16.5 17.5 18.5" stroke="#666" stroke-width="2" stroke-linecap="round"/></svg></div>`;
    };
    window.showDefaultMobileProfileIcon = function(btn) {
        const icon = btn.querySelector('.nav-icon');
        if (icon) { icon.style.color = ''; icon.style.fill = ''; }
        btn.querySelector('.login-indicator')?.remove();
    };
}

// Listen for login/logout events from auth-handler
window.addEventListener('userLoggedIn', () => { if (typeof window.updateProfileUI === 'function') window.updateProfileUI(); });
window.addEventListener('userLoggedOut', () => { if (typeof window.updateProfileUI === 'function') window.updateProfileUI(); });

console.log('✅ Profile handler loaded (API-only)');
