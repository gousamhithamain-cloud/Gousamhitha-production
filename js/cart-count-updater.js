// Cart Count Updater - Updates cart count in navigation
(function() {
    'use strict';
    
    console.log('🛒 Cart Count Updater loading...');
    
    // Clear legacy localStorage cart data - app uses backend API
    try { localStorage.removeItem('cart'); } catch(e) {}
    
    class CartCountUpdater {
        constructor() {
            this.cartCountElements = [];
            this.currentCount = 0;
            this.isUpdating = false;
        }
        
        init() {
            // Find all cart count elements
            this.findCartCountElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initial count update
            setTimeout(() => this.updateCartCount(), 500);
            
            // Periodic updates
            setInterval(() => this.updateCartCount(), 30000); // Every 30 seconds
        }
        
        findCartCountElements() {
            // All possible cart count selectors
            const selectors = [
                '#nav-cart-count',           // New navigation cart button
                '.cart-count',               // Hamburger menu cart count
                '#bottom-nav-cart-count',    // Bottom navigation cart count
                '.cart-count-badge',         // Any cart count badge
                '[id*="cart-count"]',        // Any element with cart-count in ID
                '[class*="cart-count"]'      // Any element with cart-count in class
            ];
            
            this.cartCountElements = [];
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (!this.cartCountElements.includes(element)) {
                        this.cartCountElements.push(element);
                    }
                });
            });
            
            console.log(`Found ${this.cartCountElements.length} cart count elements`);
        }
        
        async getCartItemCount() {
            try {
                // Get user from localStorage - check both possible keys
                let user = null;
                try { 
                    const raw = localStorage.getItem('user') || localStorage.getItem('auth_user'); 
                    if (raw) user = JSON.parse(raw); 
                } catch(e){
                    console.error('Error parsing user:', e);
                }
                
                // Fallback: try Supabase auth if still present
                if (!user && window.supabase) {
                    try { 
                        const r = await window.supabase.auth.getUser(); 
                        if (!r.error && r.data?.user) user = r.data.user; 
                    } catch(e){
                        console.error('Supabase getUser error:', e);
                    }
                }
                
                if (!user) {
                    console.log('No user logged in - cart count is 0');
                    // Clear stale localStorage cart data
                    localStorage.removeItem('cart');
                    return 0;
                }
                
                // Get cart count via backend API - check both token keys
                const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
                
                if (!token) {
                    console.log('No token found - cart count is 0');
                    localStorage.removeItem('cart');
                    return 0;
                }
                
                const apiBase = window.API_BASE_URL || 'http://localhost:4000/api';
                console.log(`Fetching cart for user ${user.id} from ${apiBase}/cart/${user.id}`);
                
                const res = await fetch(`${apiBase}/cart/${user.id}`, {
                    headers: { 
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!res.ok) {
                    console.error('Cart fetch failed:', res.status, res.statusText);
                    return 0;
                }
                
                const json = await res.json();
                console.log('Cart API response:', json);
                
                // Handle different response structures - batchResponse returns data.items
                const cartItems = (json.data && json.data.items) ? json.data.items : (Array.isArray(json.data) ? json.data : json.cart || []);
                const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
                
                console.log(`Cart has ${cartItems.length} items, total quantity: ${totalCount}`);
                return totalCount;
                
            } catch (error) {
                console.error('Error getting cart count:', error);
                return 0;
            }
        }
        
        async updateCartCount() {
            if (this.isUpdating) {
                return;
            }
            
            this.isUpdating = true;
            
            try {
                const count = await this.getCartItemCount();
                
                if (count !== this.currentCount) {
                    this.currentCount = count;
                    this.displayCartCount(count);
                }
                
            } catch (error) {
                console.error('Error updating cart count:', error);
            } finally {
                this.isUpdating = false;
            }
        }
        
        displayCartCount(count) {
            // Refresh cart count elements in case new ones were added
            this.findCartCountElements();
            
            this.cartCountElements.forEach(element => {
                if (element) {
                    element.textContent = count.toString();
                    
                    // Show/hide badge based on count
                    if (count > 0) {
                        element.style.display = '';
                        element.classList.remove('hidden');
                        
                        // Add animation for count change
                        element.style.transform = 'scale(1.2)';
                        setTimeout(() => {
                            element.style.transform = 'scale(1)';
                        }, 200);
                    } else {
                        // Hide badge when count is 0
                        if (element.classList.contains('nav-badge') || 
                            element.id === 'bottom-nav-cart-count') {
                            element.classList.add('hidden');
                        }
                    }
                }
            });
            
            console.log(`Cart count updated to: ${count}`);
        }
        
        setupEventListeners() {
            // Listen for Supabase ready
            window.addEventListener('supabaseReady', () => {
                setTimeout(() => this.updateCartCount(), 100);
            });
            
            // Listen for cart updates (custom events)
            window.addEventListener('cartUpdated', () => {
                setTimeout(() => this.updateCartCount(), 100);
            });
            
            // Listen for user login/logout
            window.addEventListener('userLoggedIn', () => {
                setTimeout(() => this.updateCartCount(), 100);
            });
            
            window.addEventListener('userLoggedOut', () => {
                this.displayCartCount(0);
            });
            
            // Listen for page visibility changes
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    setTimeout(() => this.updateCartCount(), 500);
                }
            });
        }
        
        // Manual refresh method
        refresh() {
            this.updateCartCount();
        }
    }
    
    // Initialize cart count updater
    const cartCountUpdater = new CartCountUpdater();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            cartCountUpdater.init();
        });
    } else {
        cartCountUpdater.init();
    }
    
    // Expose globally for manual updates
    window.CartCountUpdater = cartCountUpdater;
    
    // Helper function to trigger cart count update
    window.updateCartCount = function() {
        if (window.CartCountUpdater) {
            window.CartCountUpdater.refresh();
        }
    };
    
    console.log('✅ Cart Count Updater loaded');
    
})();