// Simple Profile Button Handler
// This script handles the profile button click with Supabase

console.log('🔧 Profile handler loading...');

// Global flag to prevent multiple initializations
if (!window.profileHandlerLoaded) {
    window.profileHandlerLoaded = true;
    
    // Wait for DOM to be ready and run multiple times to ensure it works
    function initProfileButton() {
        console.log('🔧 Initializing profile button...');
        
        // Try to find profile button with different possible IDs
        let profileBtn = document.getElementById('profile-btn-desktop') || 
                        document.getElementById('profile-btn') ||
                        document.querySelector('.profile-icon-btn:not(.hidden)') ||
                        document.querySelector('a[onclick*="openAuthModal"]');
        
        if (!profileBtn) {
            console.log('⏳ Profile button not found yet, will retry...');
            // Retry after a short delay
            setTimeout(initProfileButton, 100);
            return;
        }
        
        console.log('✅ Profile button found:', profileBtn.id || profileBtn.className);
        
        // Make sure the profile button is visible
        profileBtn.style.display = 'flex';
        profileBtn.style.visibility = 'visible';
        profileBtn.style.opacity = '1';
        profileBtn.style.pointerEvents = 'auto';
        
        // Remove existing onclick handler and add new click handler
        profileBtn.removeAttribute('onclick');
        
        // Remove any existing event listeners by cloning the element
        const newProfileBtn = profileBtn.cloneNode(true);
        profileBtn.parentNode.replaceChild(newProfileBtn, profileBtn);
        
        // Add new click handler
        newProfileBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ Profile button clicked!');
            
            // Wait for Supabase to be ready
            if (!window.supabase || !window.supabase.auth) {
                console.log('⏳ Waiting for Supabase...');
                setTimeout(() => newProfileBtn.click(), 500);
                return;
            }
            
            try {
                // Check if user is logged in via Supabase
                const { data: { user }, error } = await window.supabase.auth.getUser();
                
                if (error) {
                    console.error('❌ Error checking auth status:', error);
                    openAuthModal();
                    return;
                }
                
                if (user) {
                    console.log('✅ User is logged in:', user.email);
                    console.log('🔄 Redirecting to profile page...');
                    window.location.href = 'profile.html';
                } else {
                    console.log('ℹ️ User not logged in, showing auth modal');
                    openAuthModal();
                }
            } catch (error) {
                console.error('❌ Error checking user status:', error);
                openAuthModal();
            }
        });
        
        console.log('✅ Profile button click handler attached successfully!');
        
        // Update profile UI on load
        if (typeof window.updateProfileUI === 'function') {
            window.updateProfileUI();
        }
    }
    
    // Helper function to open auth modal
    function openAuthModal() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            console.log('✅ Opening auth modal...');
            authModal.classList.add('active');
        } else {
            console.error('❌ Auth modal not found!');
        }
    }
    
    // Initialize immediately and also on DOM ready
    initProfileButton();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfileButton);
    }
    
    // Also retry after page loads
    window.addEventListener('load', initProfileButton);
}

// Update profile UI when user logs in (only define once)
if (!window.updateProfileUI) {
    window.updateProfileUI = async function() {
        try {
            // Try to find profile button with different possible IDs
            const profileBtn = document.getElementById('profile-btn-desktop') || 
                              document.getElementById('profile-btn') ||
                              document.querySelector('.profile-icon-btn:not(.hidden)');
            
            // Also find mobile bottom nav profile button
            const mobileProfileBtn = document.getElementById('bottom-nav-profile');
            
            if (!profileBtn && !mobileProfileBtn) {
                console.log('⏳ Profile buttons not found for UI update, will retry...');
                setTimeout(window.updateProfileUI, 200);
                return;
            }
            
            // Make sure the desktop profile button is visible
            if (profileBtn) {
                profileBtn.style.display = 'flex';
                profileBtn.style.visibility = 'visible';
                profileBtn.style.opacity = '1';
                profileBtn.style.pointerEvents = 'auto';
            }
            
            // Wait for Supabase
            if (!window.supabase || !window.supabase.auth) {
                console.log('⏳ Waiting for Supabase to load...');
                setTimeout(window.updateProfileUI, 500);
                return;
            }
            
            // Check if user is logged in via Supabase with error handling
            let user = null;
            try {
                const { data: { user: authUser }, error } = await window.supabase.auth.getUser();
                
                if (error) {
                    console.warn('⚠️ Error getting user from auth:', error.message);
                    if (profileBtn) window.showDefaultProfileIcon(profileBtn);
                    if (mobileProfileBtn) window.showDefaultMobileProfileIcon(mobileProfileBtn);
                    return;
                }
                
                user = authUser;
            } catch (authError) {
                console.warn('⚠️ Auth check failed:', authError.message);
                if (profileBtn) window.showDefaultProfileIcon(profileBtn);
                if (mobileProfileBtn) window.showDefaultMobileProfileIcon(mobileProfileBtn);
                return;
            }
        
            if (user) {
                console.log('✅ User is logged in, updating profile UI for:', user.email);
                
                // Get user data via backend API
                let userData = null;
                try {
                    const token = localStorage.getItem('auth_token') || '';
                    const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/users/${user.id}`, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    if (res.ok) { const json = await res.json(); userData = json.user; }
                } catch (e) { console.warn('Could not fetch user data:', e.message); }
                
                const fullName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : '';
                const displayName = fullName || user.email || 'User';
                const initial = displayName.charAt(0).toUpperCase();
                
                // Update desktop profile button
                if (profileBtn) {
                    profileBtn.innerHTML = `
                        <div style="
                            width: 36px;
                            height: 36px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #4a7c59 0%, #2e7d32 100%);
                            color: white;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: bold;
                            font-size: 16px;
                            cursor: pointer;
                            box-shadow: 0 2px 8px rgba(74, 124, 89, 0.3);
                            transition: all 0.3s ease;
                        " title="View Profile - ${displayName}">
                            ${initial}
                        </div>
                    `;
                    
                    // Add hover effect for desktop
                    profileBtn.addEventListener('mouseenter', function() {
                        const icon = this.querySelector('div');
                        if (icon) {
                            icon.style.transform = 'scale(1.1)';
                            icon.style.boxShadow = '0 4px 12px rgba(74, 124, 89, 0.4)';
                        }
                    });
                    
                    profileBtn.addEventListener('mouseleave', function() {
                        const icon = this.querySelector('div');
                        if (icon) {
                            icon.style.transform = 'scale(1)';
                            icon.style.boxShadow = '0 2px 8px rgba(74, 124, 89, 0.3)';
                        }
                    });
                }
                
                // Update mobile profile button in bottom navigation
                if (mobileProfileBtn) {
                    const mobileIcon = mobileProfileBtn.querySelector('.nav-icon');
                    if (mobileIcon) {
                        // Change the mobile profile icon to show logged-in state
                        mobileIcon.style.color = '#4a7c59';
                        mobileIcon.style.fill = '#4a7c59';
                    }
                    
                    // Add a small indicator for logged-in state
                    mobileProfileBtn.style.position = 'relative';
                    
                    // Remove existing indicator
                    const existingIndicator = mobileProfileBtn.querySelector('.login-indicator');
                    if (existingIndicator) {
                        existingIndicator.remove();
                    }
                    
                    // Add logged-in indicator
                    const indicator = document.createElement('div');
                    indicator.className = 'login-indicator';
                    indicator.style.cssText = `
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        width: 8px;
                        height: 8px;
                        background: #4caf50;
                        border-radius: 50%;
                        border: 2px solid white;
                        z-index: 1;
                    `;
                    mobileProfileBtn.appendChild(indicator);
                }
                
                // Reduce console spam for profile updates
                if (!window.profileUpdateLogCount) window.profileUpdateLogCount = 0;
                window.profileUpdateLogCount++;
                
                if (window.profileUpdateLogCount % 10 === 1) {
                    console.log('✅ Profile UI updated - User logged in as:', displayName);
                }
            } else {
                console.log('ℹ️ User not logged in, showing default profile icons');
                if (profileBtn) window.showDefaultProfileIcon(profileBtn);
                if (mobileProfileBtn) window.showDefaultMobileProfileIcon(mobileProfileBtn);
            }
        } catch (error) {
            console.error('❌ Error updating profile UI:', error);
            // Fallback to default icons on any error
            const profileBtn = document.getElementById('profile-btn-desktop') || 
                              document.getElementById('profile-btn') ||
                              document.querySelector('.profile-icon-btn:not(.hidden)');
            const mobileProfileBtn = document.getElementById('bottom-nav-profile');
            
            if (profileBtn) window.showDefaultProfileIcon(profileBtn);
            if (mobileProfileBtn) window.showDefaultMobileProfileIcon(mobileProfileBtn);
        }
    };
}

// Helper functions (only define once)
if (!window.showDefaultProfileIcon) {
    // Helper function to show default profile icon
    window.showDefaultProfileIcon = function(profileBtn) {
        profileBtn.innerHTML = `
            <div class="profile-icon-placeholder" style="
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #f5f5f5;
                border: 2px solid #ddd;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
            " title="Sign In / Sign Up">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#666" stroke-width="2"/>
                    <circle cx="12" cy="10" r="3" stroke="#666" stroke-width="2"/>
                    <path d="M6.5 18.5C7.5 16.5 9.5 15 12 15C14.5 15 16.5 16.5 17.5 18.5" stroke="#666" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </div>
        `;
    };
    
    // Helper function to show default mobile profile icon
    window.showDefaultMobileProfileIcon = function(mobileProfileBtn) {
        const mobileIcon = mobileProfileBtn.querySelector('.nav-icon');
        if (mobileIcon) {
            // Reset mobile profile icon to default state
            mobileIcon.style.color = '';
            mobileIcon.style.fill = '';
        }
        
        // Remove login indicator
        const existingIndicator = mobileProfileBtn.querySelector('.login-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    };
}

// Listen for auth state changes (with error handling)
if (window.supabase && window.supabase.auth) {
    try {
        window.supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔄 Auth state changed:', event, session ? 'User logged in' : 'User logged out');
            setTimeout(() => {
                if (typeof window.updateProfileUI === 'function') {
                    window.updateProfileUI();
                }
            }, 100);
        });
    } catch (error) {
        console.warn('⚠️ Could not set up auth state listener:', error);
    }
} else {
    // Retry setting up auth listener after Supabase loads
    setTimeout(() => {
        if (window.supabase && window.supabase.auth) {
            try {
                window.supabase.auth.onAuthStateChange((event, session) => {
                    console.log('🔄 Auth state changed:', event, session ? 'User logged in' : 'User logged out');
                    setTimeout(() => {
                        if (typeof window.updateProfileUI === 'function') {
                            window.updateProfileUI();
                        }
                    }, 100);
                });
            } catch (error) {
                console.warn('⚠️ Could not set up auth state listener:', error);
            }
        }
    }, 2000);
}

console.log('✅ Profile handler loaded');
