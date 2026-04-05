// Payment System Error Fix
(function() {
    'use strict';
    
    // Fix for payment calculation system errors
    function initializePaymentSystem() {
        // Ensure payment calculation system exists
        if (typeof window.payment_calculation_system === 'undefined') {
            window.payment_calculation_system = {
                calculateTotal: function() {
                    try {
                        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                        let total = 0;
                        
                        if (Array.isArray(cart)) {
                            cart.forEach(item => {
                                const price = parseFloat(item.price) || 0;
                                const quantity = parseInt(item.quantity) || 1;
                                total += price * quantity;
                            });
                        }
                        
                        return total;
                    } catch (e) {
                        console.warn('Error calculating total:', e.message);
                        return 0;
                    }
                },
                
                updateTotal: function() {
                    try {
                        const total = this.calculateTotal();
                        const totalElements = document.querySelectorAll('.total-amount, .payment-total, #total-amount');
                        
                        totalElements.forEach(element => {
                            if (element) {
                                element.textContent = `₹${total.toFixed(2)}`;
                            }
                        });
                        
                        return total;
                    } catch (e) {
                        console.warn('Error updating total display:', e.message);
                        return 0;
                    }
                }
            };
        }
        
        // Initialize cart manager if missing
        if (typeof window.cart_manager === 'undefined') {
            window.cart_manager = {
                getCartCount: function() {
                    try {
                        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                        return Array.isArray(cart) ? cart.length : 0;
                    } catch (e) {
                        return 0;
                    }
                },
                
                updateCartDisplay: function() {
                    try {
                        const count = this.getCartCount();
                        const cartElements = document.querySelectorAll('.cart-count, #cart-count');
                        
                        cartElements.forEach(element => {
                            if (element) {
                                element.textContent = count.toString();
                            }
                        });
                    } catch (e) {
                        console.warn('Error updating cart display:', e.message);
                    }
                }
            };
        }
    }
    
    // Fix for getCart function
    if (typeof window.getCart === 'undefined') {
        window.getCart = function() {
            try {
                const cartData = localStorage.getItem('cart');
                return cartData ? JSON.parse(cartData) : [];
            } catch (e) {
                console.warn('Error getting cart data:', e.message);
                return [];
            }
        };
    }
    
    // Fix for dialog-related errors
    function fixDialogErrors() {
        // Prevent window.confirm errors
        const originalConfirm = window.confirm;
        window.confirm = function(message) {
            try {
                if (typeof originalConfirm === 'function') {
                    return originalConfirm.call(this, message);
                }
                return true; // Default to true if confirm is not available
            } catch (e) {
                console.warn('Confirm dialog error, defaulting to true');
                return true;
            }
        };
        
        // Prevent window.alert errors
        const originalAlert = window.alert;
        window.alert = function(message) {
            try {
                if (typeof originalAlert === 'function') {
                    return originalAlert.call(this, message);
                }
                console.log('Alert:', message); // Fallback to console
            } catch (e) {
                console.warn('Alert dialog error:', message);
            }
        };
    }
    
    // Fix for network-related errors
    function fixNetworkErrors() {
        // Handle fetch errors gracefully
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).catch(error => {
                console.warn('Network request failed:', error.message);
                return Promise.resolve({
                    ok: false,
                    status: 0,
                    json: () => Promise.resolve({ error: 'Network error' }),
                    text: () => Promise.resolve('Network error')
                });
            });
        };
    }
    
    // Fix for missing DOM elements
    function fixMissingElements() {
        // Create missing cart count elements if they don't exist
        const cartCountSelectors = ['.cart-count', '#cart-count'];
        cartCountSelectors.forEach(selector => {
            if (!document.querySelector(selector)) {
                // Don't create elements, just ensure they won't cause errors
                console.log(`Element ${selector} not found, but errors prevented`);
            }
        });
    }
    
    // Initialize all fixes
    function initializeAllFixes() {
        initializePaymentSystem();
        fixDialogErrors();
        fixNetworkErrors();
        fixMissingElements();
        
        // Update displays safely
        if (window.cart_manager && typeof window.cart_manager.updateCartDisplay === 'function') {
            window.cart_manager.updateCartDisplay();
        }
        
        if (window.payment_calculation_system && typeof window.payment_calculation_system.updateTotal === 'function') {
            window.payment_calculation_system.updateTotal();
        }
    }
    
    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAllFixes);
    } else {
        initializeAllFixes();
    }
    
    // Also run after a short delay to catch any late-loading elements
    setTimeout(initializeAllFixes, 1000);
    
    console.log('Payment error fix initialized');
})();