// Cart Initialization Fix - Ensure proper cart loading sequence
(function() {
    'use strict';
    
    console.log('🚀 Cart Initialization Fix loading...');
    
    class CartInitializer {
        constructor() {
            this.initialized = false;
            this.supabaseReady = false;
            this.domReady = false;
            this.cartLoaded = false;
            this.initAttempts = 0;
            this.maxAttempts = 5;
        }
        
        checkReadiness() {
            // Check if Supabase is ready
            this.supabaseReady = !!(window.supabase && typeof window.supabase.from === 'function');
            
            // Check if DOM is ready
            this.domReady = document.readyState === 'complete' || 
                           (document.readyState === 'interactive' && document.getElementById('cart-items'));
            
            return this.supabaseReady && this.domReady;
        }
        
        async initializeCart() {
            if (this.initialized || this.cartLoaded) {
                return;
            }
            
            this.initAttempts++;
            
            if (!this.checkReadiness()) {
                if (this.initAttempts < this.maxAttempts) {
                    console.log(`Cart not ready, retrying... (${this.initAttempts}/${this.maxAttempts})`);
                    setTimeout(() => this.initializeCart(), 1000);
                } else {
                    console.error('Cart initialization failed after maximum attempts');
                    this.showErrorMessage();
                }
                return;
            }
            
            this.initialized = true;
            
            try {
                // Clear any existing error messages
                this.clearErrorMessages();
                
                // Show loading state
                this.showLoadingState();
                
                // Load cart with timeout
                const loadPromise = this.loadCartWithTimeout();
                const result = await loadPromise;
                
                if (result) {
                    this.cartLoaded = true;
                    console.log('✅ Cart loaded successfully');
                } else {
                    throw new Error('Cart loading timed out or failed');
                }
                
            } catch (error) {
                console.error('Cart initialization error:', error);
                this.showErrorMessage();
            }
        }
        
        async loadCartWithTimeout(timeout = 10000) {
            return new Promise(async (resolve) => {
                const timeoutId = setTimeout(() => {
                    console.error('Cart loading timeout');
                    resolve(false);
                }, timeout);
                
                try {
                    if (window.loadCart && typeof window.loadCart === 'function') {
                        await window.loadCart();
                        clearTimeout(timeoutId);
                        resolve(true);
                    } else {
                        console.error('loadCart function not available');
                        clearTimeout(timeoutId);
                        resolve(false);
                    }
                } catch (error) {
                    console.error('Error in loadCart:', error);
                    clearTimeout(timeoutId);
                    resolve(false);
                }
            });
        }
        
        showLoadingState() {
            const cartItemsDiv = document.getElementById('cart-items');
            if (cartItemsDiv) {
                cartItemsDiv.innerHTML = `
                    <div class="cart-loading" style="text-align: center; padding: 40px;">
                        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4a7c59; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                        <p style="color: #666; font-size: 16px;">Loading your cart...</p>
                    </div>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                `;
            }
        }
        
        showErrorMessage() {
            const cartItemsDiv = document.getElementById('cart-items');
            if (cartItemsDiv) {
                cartItemsDiv.innerHTML = `
                    <div class="cart-error" style="text-align: center; padding: 40px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; margin: 20px;">
                        <h3 style="color: #856404; margin-bottom: 15px;">Unable to Load Cart</h3>
                        <p style="color: #856404; margin-bottom: 20px;">We're having trouble loading your cart. This might be due to a connection issue.</p>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="window.location.reload()" class="btn" style="padding: 10px 20px; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Refresh Page
                            </button>
                            <a href="shop.html" class="btn" style="display: inline-block; padding: 10px 20px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px;">
                                Continue Shopping
                            </a>
                        </div>
                    </div>
                `;
            }
        }
        
        clearErrorMessages() {
            const cartItemsDiv = document.getElementById('cart-items');
            if (cartItemsDiv) {
                const errorElements = cartItemsDiv.querySelectorAll('.cart-error, .cart-error-fallback');
                errorElements.forEach(el => el.remove());
            }
        }
        
        setupEventListeners() {
            // Listen for Supabase ready
            window.addEventListener('supabaseReady', () => {
                console.log('Supabase ready event received');
                this.supabaseReady = true;
                setTimeout(() => this.initializeCart(), 100);
            });
            
            // Listen for DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.domReady = true;
                    setTimeout(() => this.initializeCart(), 100);
                });
            } else {
                this.domReady = true;
            }
            
            // Fallback timer
            setTimeout(() => {
                if (!this.cartLoaded) {
                    console.log('Fallback cart initialization');
                    this.initializeCart();
                }
            }, 2000);
        }
        
        init() {
            this.setupEventListeners();
            
            // Try immediate initialization if everything is ready
            if (this.checkReadiness()) {
                setTimeout(() => this.initializeCart(), 100);
            }
        }
    }
    
    // Initialize cart system
    const cartInitializer = new CartInitializer();
    cartInitializer.init();
    
    // Expose for debugging
    window.CartInitializer = cartInitializer;
    
    console.log('✅ Cart Initialization Fix loaded');
    
})();