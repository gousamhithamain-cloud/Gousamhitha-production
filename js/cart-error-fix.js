// Cart Error Fix - Resolve cart loading issues
(function() {
    'use strict';
    
    console.log('🔧 Cart Error Fix loading...');
    
    // Enhanced cart loader with better error handling
    class CartErrorFix {
        constructor() {
            this.maxRetries = 3;
            this.retryDelay = 1000;
            this.currentRetries = 0;
            this.isLoading = false;
        }
        
        async waitForSupabase(timeout = 10000) {
            const startTime = Date.now();
            
            while (!window.supabase && (Date.now() - startTime) < timeout) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            return !!window.supabase;
        }
        
        async loadCartWithRetry() {
            if (this.isLoading) {
                console.log('Cart already loading, skipping...');
                return;
            }
            
            this.isLoading = true;
            
            try {
                // Wait for Supabase to be ready
                const supabaseReady = await this.waitForSupabase();
                if (!supabaseReady) {
                    throw new Error('Supabase not available');
                }
                
                // Check if original loadCart function exists
                if (typeof window.loadCart === 'function') {
                    await window.loadCart();
                    this.currentRetries = 0; // Reset on success
                } else {
                    throw new Error('loadCart function not available');
                }
                
            } catch (error) {
                console.error('Cart loading error:', error);
                
                if (this.currentRetries < this.maxRetries) {
                    this.currentRetries++;
                    console.log(`Retrying cart load (${this.currentRetries}/${this.maxRetries})...`);
                    
                    setTimeout(() => {
                        this.isLoading = false;
                        this.loadCartWithRetry();
                    }, this.retryDelay * this.currentRetries);
                } else {
                    console.error('Max retries reached for cart loading');
                    this.showFallbackCart();
                }
            } finally {
                if (this.currentRetries === 0) {
                    this.isLoading = false;
                }
            }
        }
        
        showFallbackCart() {
            const cartItemsDiv = document.getElementById('cart-items');
            if (cartItemsDiv) {
                cartItemsDiv.innerHTML = `
                    <div class="cart-error-fallback" style="text-align: center; padding: 40px;">
                        <h3 style="color: #d32f2f; margin-bottom: 20px;">Unable to load cart</h3>
                        <p style="margin-bottom: 20px;">There seems to be a connection issue. Please try refreshing the page.</p>
                        <button onclick="window.location.reload()" class="btn btn-primary" style="padding: 12px 24px; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 10px;">Refresh Page</button>
                        <a href="shop.html" class="btn btn-secondary" style="display: inline-block; padding: 12px 24px; background: #666; color: white; text-decoration: none; border-radius: 8px;">Continue Shopping</a>
                    </div>
                `;
            }
        }
        
        // Override console.error to catch and handle cart errors
        setupErrorHandling() {
            const originalError = console.error;
            console.error = (...args) => {
                // Call original console.error
                originalError.apply(console, args);
                
                // Check if it's a cart-related error
                const errorMessage = args.join(' ').toLowerCase();
                if (errorMessage.includes('error loading cart') || 
                    errorMessage.includes('cart') && errorMessage.includes('error')) {
                    
                    // Don't retry if we're already at max retries
                    if (this.currentRetries < this.maxRetries) {
                        console.log('Cart error detected, attempting recovery...');
                        setTimeout(() => this.loadCartWithRetry(), 500);
                    }
                }
            };
        }
        
        init() {
            // Setup error handling
            this.setupErrorHandling();
            
            // Initial cart load with retry logic
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => this.loadCartWithRetry(), 500);
                });
            } else {
                setTimeout(() => this.loadCartWithRetry(), 500);
            }
            
            // Listen for Supabase ready event
            window.addEventListener('supabaseReady', () => {
                console.log('Supabase ready event received, loading cart...');
                setTimeout(() => this.loadCartWithRetry(), 100);
            });
        }
    }
    
    // Initialize cart error fix
    const cartErrorFix = new CartErrorFix();
    cartErrorFix.init();
    
    // Expose for debugging
    window.CartErrorFix = cartErrorFix;
    
    console.log('✅ Cart Error Fix initialized');
    
})();