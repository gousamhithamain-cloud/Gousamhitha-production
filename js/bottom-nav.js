// Bottom Navigation Handler - Simplified
(function() {
    'use strict';
    
    function initBottomNav() {
        console.log('📱 Initializing bottom navigation...');
        
        // Update navigation based on current page
        updateNavigationForCurrentPage();
        
        // Set active state based on current page
        setActiveNavItem();
        
        // Update cart count
        updateCartCount();
        
        // Add click handlers
        addClickHandlers();
    }
    
    function updateNavigationForCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        console.log(`📱 Current page: ${currentPage}`);
        
        // Simple navigation - no profile logic needed
        console.log('✅ Bottom navigation ready for current page');
    }
    
    function setActiveNavItem() {
        // Get current page from URL
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        console.log('📄 Current page for bottom nav:', currentPage);
        
        // Remove active class from all items
        const navItems = document.querySelectorAll('.bottom-nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to current page item
        let activeSelector = '';
        if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
            activeSelector = '[data-page="home"]';
        } else if (currentPage === 'shop.html') {
            activeSelector = '[data-page="shop"]';
        } else if (currentPage === 'cart.html') {
            activeSelector = '[data-page="cart"]';
        } else if (currentPage === 'orders.html') {
            activeSelector = '[data-page="orders"]';
        } else if (currentPage === 'about.html') {
            activeSelector = '[data-page="about"]';
        } else if (currentPage === 'profile.html') {
            activeSelector = '[data-page="profile"]';
        }
        
        if (activeSelector) {
            const activeItem = document.querySelector(`.bottom-nav-item${activeSelector}`);
            if (activeItem) {
                activeItem.classList.add('active');
                console.log('✅ Set active nav item:', activeSelector);
            }
        }
    }
    
    function updateCartCount() {
        // Update cart count badge
        const cartBadge = document.getElementById('bottom-nav-cart-count');
        if (!cartBadge) return;
        
        // Defer to CartCountUpdater if available (it uses the API)
        if (window.CartCountUpdater && typeof window.CartCountUpdater.refresh === 'function') {
            window.CartCountUpdater.refresh();
            return;
        }
        
        // Fallback: only show count if user is logged in
        const isLoggedIn = typeof window.isLoggedIn === 'function'
            ? window.isLoggedIn()
            : !!(localStorage.getItem('token') && localStorage.getItem('user'));
        
        if (!isLoggedIn) {
            updateCartBadge(cartBadge, 0);
            return;
        }
        
        updateCartBadgeFromStorage(cartBadge);
    }
    
    function updateCartBadge(badge, count) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count.toString();
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
    
    function updateCartBadgeFromStorage(badge) {
        // Don't read from localStorage - it may be stale
        // Just hide the badge; the API-based updater will set the correct count
        badge.classList.add('hidden');
    }
    
    function addClickHandlers() {
        // Add click handlers for navigation items
        const navItems = document.querySelectorAll('.bottom-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Add visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // Log navigation
                const page = this.getAttribute('data-page');
                console.log('🔗 Bottom nav clicked:', page);
                
                // Handle profile click specially (don't navigate)
                if (page === 'profile') {
                    e.preventDefault();
                    // Use the same logic as desktop profile button
                    if (typeof window.handleMobileProfileClick === 'function') {
                        window.handleMobileProfileClick();
                    } else {
                        // Fallback to opening auth modal
                        if (typeof window.openAuthModal === 'function') {
                            window.openAuthModal();
                        }
                    }
                }
            });
        });
    }
    
    // Listen for cart updates to update the badge
    function listenForCartUpdates() {
        // Listen for custom cart update events
        document.addEventListener('cartUpdated', updateCartCount);
        
        // Listen for storage changes (if cart is stored in localStorage)
        window.addEventListener('storage', function(e) {
            if (e.key === 'cart') {
                updateCartCount();
            }
        });
        
        // Periodically update cart count (fallback)
        setInterval(updateCartCount, 5000);
    }
    
    // Handle profile click from bottom navigation
    window.handleMobileProfileClick = function() {
        console.log('🖱️ Mobile profile button clicked!');
        
        // Use the existing auth system (localStorage-based)
        const loggedIn = typeof window.isLoggedIn === 'function'
            ? window.isLoggedIn()
            : !!(localStorage.getItem('token') && localStorage.getItem('user'));
        
        if (loggedIn) {
            console.log('✅ User is logged in - redirecting to profile page...');
            window.location.href = 'profile.html';
        } else {
            console.log('ℹ️ User not logged in, showing auth modal');
            openMobileAuthModal();
        }
    };
    
    // Helper function to open auth modal from mobile
    function openMobileAuthModal() {
        if (typeof window.openAuthModal === 'function') {
            window.openAuthModal();
        } else {
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                console.log('✅ Opening auth modal...');
                authModal.classList.add('active');
            } else {
                console.error('❌ Auth modal not found!');
            }
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBottomNav);
    } else {
        initBottomNav();
    }
    
    // Start listening for cart updates
    listenForCartUpdates();
    
    // Make functions available globally
    window.bottomNav = {
        updateCartCount: updateCartCount,
        setActiveNavItem: setActiveNavItem
    };
    
    console.log('✅ Bottom navigation handler loaded');
})();