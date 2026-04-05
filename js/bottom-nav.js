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
        
        // Try to get cart count from existing cart system
        if (window.DataManager && typeof window.DataManager.getCartCount === 'function') {
            window.DataManager.getCartCount().then(count => {
                updateCartBadge(cartBadge, count);
            }).catch(() => {
                // Fallback: try to get from localStorage or other sources
                updateCartBadgeFromStorage(cartBadge);
            });
        } else {
            // Fallback: try to get from localStorage or other sources
            updateCartBadgeFromStorage(cartBadge);
        }
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
        try {
            // Try localStorage first
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
            updateCartBadge(badge, count);
        } catch (error) {
            // If localStorage fails, try to get from existing cart count elements
            const existingCartCount = document.querySelector('.cart-count');
            if (existingCartCount) {
                const count = parseInt(existingCartCount.textContent) || 0;
                updateCartBadge(badge, count);
            } else {
                badge.classList.add('hidden');
            }
        }
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
    window.handleMobileProfileClick = async function() {
        console.log('🖱️ Mobile profile button clicked!');
        
        // Wait for Supabase to be ready
        if (!window.supabase || !window.supabase.auth) {
            console.log('⏳ Waiting for Supabase...');
            setTimeout(window.handleMobileProfileClick, 500);
            return;
        }
        
        try {
            // Check if user is logged in via Supabase
            const { data: { user }, error } = await window.supabase.auth.getUser();
            
            if (error) {
                console.error('❌ Error checking auth status:', error);
                openMobileAuthModal();
                return;
            }
            
            if (user) {
                console.log('✅ User is logged in:', user.email);
                console.log('🔄 Redirecting to profile page...');
                window.location.href = 'profile.html';
            } else {
                console.log('ℹ️ User not logged in, showing auth modal');
                openMobileAuthModal();
            }
        } catch (error) {
            console.error('❌ Error checking user status:', error);
            // On any error, show auth modal as fallback
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
                authModal.style.display = 'flex';
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