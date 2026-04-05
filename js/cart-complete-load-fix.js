// Cart Complete Load Fix - Ensures cart loads fully on first load
(function() {
    'use strict';
    
    console.log('🔄 Cart Complete Load Fix loading...');
    
    class CartCompleteLoadFix {
        constructor() {
            this.loadAttempts = 0;
            this.maxAttempts = 10;
            this.isLoading = false;
            this.loadCheckInterval = null;
        }
        
        init() {
            console.log('🔄 Initializing cart complete load fix');
            
            // Force immediate cart load
            this.forceCartLoad();
            
            // Setup periodic checks
            this.setupPeriodicChecks();
            
            // Setup visibility change handler
            this.setupVisibilityHandler();
            
            // Setup focus handler
            this.setupFocusHandler();
        }
        
        forceCartLoad() {
            if (this.isLoading) return;
            
            this.isLoading = true;
            this.loadAttempts++;
            
            console.log(`🔄 Force cart load attempt ${this.loadAttempts}`);
            
            // Check if cart is properly loaded
            const cartItems = document.getElementById('cart-items');
            if (!cartItems) {
                console.log('🔄 Cart items container not found, waiting...');
                setTimeout(() => {
                    this.isLoading = false;
                    if (this.loadAttempts < this.maxAttempts) {
                        this.forceCartLoad();
                    }
                }, 1000);
                return;
            }
            
            // Check if cart has content but missing total/checkout
            const hasCartItems = cartItems.innerHTML.includes('cart-item');
            const hasCartTotal = cartItems.innerHTML.includes('Cart Total') || 
                                document.querySelector('.cart-summary') ||
                                cartItems.innerHTML.includes('Proceed to Checkout');
            
            console.log(`🔄 Cart status: hasItems=${hasCartItems}, hasTotal=${hasCartTotal}`);
            
            if (hasCartItems && !hasCartTotal) {
                console.log('🔄 Cart items found but missing total/checkout - forcing reload');
                this.triggerCartReload();
            } else if (!hasCartItems && cartItems.innerHTML.includes('Loading')) {
                console.log('🔄 Cart still loading - waiting...');
                setTimeout(() => {
                    this.isLoading = false;
                    if (this.loadAttempts < this.maxAttempts) {
                        this.forceCartLoad();
                    }
                }, 2000);
            } else {
                console.log('🔄 Cart appears to be loaded correctly');
                this.isLoading = false;
            }
        }
        
        async triggerCartReload() {
            console.log('🔄 Triggering cart reload...');
            
            try {
                // Try multiple methods to reload cart
                if (window.loadCart && typeof window.loadCart === 'function') {
                    console.log('🔄 Using window.loadCart()');
                    await window.loadCart();
                } else if (window.CartInitializer && window.CartInitializer.initializeCart) {
                    console.log('🔄 Using CartInitializer');
                    await window.CartInitializer.initializeCart();
                } else {
                    console.log('🔄 No cart loader found, forcing page reload');
                    window.location.reload();
                }
                
                // Check if reload was successful
                setTimeout(() => {
                    this.verifyCartLoad();
                }, 2000);
                
            } catch (error) {
                console.error('🔄 Error reloading cart:', error);
                this.isLoading = false;
            }
        }
        
        verifyCartLoad() {
            const cartItems = document.getElementById('cart-items');
            if (!cartItems) {
                this.isLoading = false;
                return;
            }
            
            const hasCartItems = cartItems.innerHTML.includes('cart-item');
            const hasCartTotal = cartItems.innerHTML.includes('Cart Total') || 
                                document.querySelector('.cart-summary') ||
                                cartItems.innerHTML.includes('Proceed to Checkout');
            
            console.log(`🔄 Verification: hasItems=${hasCartItems}, hasTotal=${hasCartTotal}`);
            
            if (hasCartItems && hasCartTotal) {
                console.log('✅ Cart loaded completely');
                this.isLoading = false;
                this.stopPeriodicChecks();
            } else if (this.loadAttempts < this.maxAttempts) {
                console.log('🔄 Cart still incomplete, retrying...');
                this.isLoading = false;
                setTimeout(() => this.forceCartLoad(), 1000);
            } else {
                console.log('🔄 Max attempts reached, stopping');
                this.isLoading = false;
                this.stopPeriodicChecks();
            }
        }
        
        setupPeriodicChecks() {
            console.log('🔄 Setting up periodic cart checks');
            
            this.loadCheckInterval = setInterval(() => {
                if (!this.isLoading && this.loadAttempts < this.maxAttempts) {
                    const cartItems = document.getElementById('cart-items');
                    if (cartItems) {
                        const hasCartItems = cartItems.innerHTML.includes('cart-item');
                        const hasCartTotal = cartItems.innerHTML.includes('Cart Total') || 
                                            document.querySelector('.cart-summary') ||
                                            cartItems.innerHTML.includes('Proceed to Checkout');
                        
                        if (hasCartItems && !hasCartTotal) {
                            console.log('🔄 Periodic check: Cart incomplete, forcing reload');
                            this.forceCartLoad();
                        }
                    }
                }
            }, 3000); // Check every 3 seconds
        }
        
        stopPeriodicChecks() {
            if (this.loadCheckInterval) {
                clearInterval(this.loadCheckInterval);
                this.loadCheckInterval = null;
                console.log('🔄 Stopped periodic checks');
            }
        }
        
        setupVisibilityHandler() {
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    console.log('🔄 Page became visible, checking cart');
                    setTimeout(() => {
                        if (!this.isLoading) {
                            this.forceCartLoad();
                        }
                    }, 500);
                }
            });
        }
        
        setupFocusHandler() {
            window.addEventListener('focus', () => {
                console.log('🔄 Window focused, checking cart');
                setTimeout(() => {
                    if (!this.isLoading) {
                        this.forceCartLoad();
                    }
                }, 500);
            });
        }
        
        // Force Supabase initialization
        forceSupabaseInit() {
            console.log('🔄 Forcing Supabase initialization');
            
            if (!window.supabase) {
                // Dispatch supabase ready event to trigger cart loading
                setTimeout(() => {
                    if (window.supabase) {
                        window.dispatchEvent(new Event('supabaseReady'));
                        console.log('🔄 Dispatched supabaseReady event');
                    }
                }, 1000);
            }
        }
        
        // Override cart loading functions to ensure complete loading
        overrideCartFunctions() {
            const originalLoadCart = window.loadCart;
            
            window.loadCart = async function() {
                console.log('🔄 loadCart override called');
                
                try {
                    if (originalLoadCart) {
                        await originalLoadCart();
                    }
                    
                    // Ensure cart total and checkout button are present
                    setTimeout(() => {
                        const cartItems = document.getElementById('cart-items');
                        if (cartItems && cartItems.innerHTML.includes('cart-item')) {
                            const hasTotal = cartItems.innerHTML.includes('Cart Total') ||
                                           cartItems.innerHTML.includes('Proceed to Checkout');
                            
                            if (!hasTotal) {
                                console.log('🔄 Cart loaded but missing total, forcing complete reload');
                                if (originalLoadCart) {
                                    originalLoadCart();
                                }
                            }
                        }
                    }, 1000);
                    
                } catch (error) {
                    console.error('🔄 Error in loadCart override:', error);
                }
            };
            
            console.log('🔄 Cart functions overridden');
        }
    }
    
    // Initialize cart complete load fix
    const cartCompleteLoadFix = new CartCompleteLoadFix();
    
    // Start initialization immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            cartCompleteLoadFix.init();
            cartCompleteLoadFix.forceSupabaseInit();
            setTimeout(() => cartCompleteLoadFix.overrideCartFunctions(), 500);
        });
    } else {
        cartCompleteLoadFix.init();
        cartCompleteLoadFix.forceSupabaseInit();
        setTimeout(() => cartCompleteLoadFix.overrideCartFunctions(), 500);
    }
    
    // Multiple initialization attempts
    setTimeout(() => cartCompleteLoadFix.init(), 1000);
    setTimeout(() => cartCompleteLoadFix.init(), 3000);
    setTimeout(() => cartCompleteLoadFix.init(), 5000);
    
    // Expose for debugging
    window.CartCompleteLoadFix = cartCompleteLoadFix;
    
    console.log('✅ Cart Complete Load Fix loaded');
    
})();