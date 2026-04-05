// Mobile Checkout Button Fix - Ensure checkout button is always visible
(function() {
    'use strict';
    
    function ensureMobileCheckoutButton() {
        console.log('🔧 Ensuring mobile checkout button is visible...');
        
        // Force show mobile cart total bar on mobile devices - DISABLED
        if (window.innerWidth <= 768) {
            const mobileCartTotal = document.getElementById('mobile-cart-total');
            const fallbackCheckout = document.getElementById('fallback-checkout');
            
            // Skip if mobile cart total doesn't exist (removed)
            if (!mobileCartTotal) {
                return;
            }
            
            // Show the main mobile cart total bar ABOVE bottom navigation
            if (mobileCartTotal) {
                mobileCartTotal.style.display = 'block';
                mobileCartTotal.style.position = 'fixed';
                mobileCartTotal.style.bottom = '70px'; // Above 70px bottom navigation
                mobileCartTotal.style.left = '0';
                mobileCartTotal.style.right = '0';
                mobileCartTotal.style.zIndex = '1001'; // Higher than bottom nav
                mobileCartTotal.style.background = 'white';
                mobileCartTotal.style.borderTop = '1px solid #e0e0e0';
                mobileCartTotal.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.1)';
                mobileCartTotal.style.padding = '16px';
                
                console.log('✅ Mobile cart total bar positioned above bottom navigation');
                
                // Hide fallback if main bar is visible
                if (fallbackCheckout) {
                    fallbackCheckout.style.display = 'none';
                }
            } else if (fallbackCheckout) {
                // Show fallback if main bar doesn't exist
                fallbackCheckout.style.display = 'block';
                fallbackCheckout.style.bottom = '70px'; // Above bottom navigation
                console.log('✅ Fallback checkout button positioned above bottom navigation');
            }
            
            // Ensure checkout button exists and is functional
            let checkoutBtn = document.querySelector('.checkout-btn-mobile');
            if (!checkoutBtn) {
                console.log('🔧 Creating missing checkout button...');
                
                // Create checkout button if it doesn't exist
                checkoutBtn = document.createElement('button');
                checkoutBtn.className = 'checkout-btn-mobile';
                checkoutBtn.textContent = 'Proceed to Checkout';
                checkoutBtn.onclick = proceedToCheckout;
                checkoutBtn.style.cssText = `
                    width: 100%;
                    background: #4a7c59;
                    color: white;
                    border: none;
                    padding: 14px 20px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-top: 12px;
                `;
                
                // Add to mobile cart total bar or fallback
                const targetContainer = mobileCartTotal || fallbackCheckout;
                if (targetContainer) {
                    targetContainer.appendChild(checkoutBtn);
                }
            }
            
            // Ensure checkout button is styled correctly
            if (checkoutBtn) {
                checkoutBtn.style.width = '100%';
                checkoutBtn.style.background = '#4a7c59';
                checkoutBtn.style.color = 'white';
                checkoutBtn.style.border = 'none';
                checkoutBtn.style.padding = '14px 20px';
                checkoutBtn.style.borderRadius = '8px';
                checkoutBtn.style.fontSize = '16px';
                checkoutBtn.style.fontWeight = '600';
                checkoutBtn.style.cursor = 'pointer';
                checkoutBtn.style.marginTop = '12px';
                
                console.log('✅ Checkout button is properly styled');
            }
            
            // Add bottom padding to body to prevent overlap with both elements
            document.body.style.paddingBottom = '140px'; // 70px bottom nav + 70px checkout bar
        }
    }
    
    function updateCheckoutButtonState() {
        const checkoutBtn = document.querySelector('.checkout-btn-mobile');
        if (!checkoutBtn) return;
        
        // Check if we have selective checkout handler
        if (window.selectiveCheckoutHandler && window.selectiveCheckoutHandler.selectedItems) {
            const selectedCount = window.selectiveCheckoutHandler.selectedItems.size;
            
            if (selectedCount === 0) {
                checkoutBtn.textContent = 'Select Items to Checkout';
                checkoutBtn.disabled = true;
                checkoutBtn.style.opacity = '0.6';
                checkoutBtn.style.cursor = 'not-allowed';
                checkoutBtn.style.background = '#ccc';
            } else {
                checkoutBtn.textContent = `Checkout ${selectedCount} Item${selectedCount !== 1 ? 's' : ''}`;
                checkoutBtn.disabled = false;
                checkoutBtn.style.opacity = '1';
                checkoutBtn.style.cursor = 'pointer';
                checkoutBtn.style.background = '#4a7c59';
            }
        } else {
            // Fallback: check if cart has items
            const cartItems = document.querySelectorAll('.cart-item');
            if (cartItems.length === 0) {
                checkoutBtn.textContent = 'Cart is Empty';
                checkoutBtn.disabled = true;
                checkoutBtn.style.opacity = '0.6';
                checkoutBtn.style.cursor = 'not-allowed';
                checkoutBtn.style.background = '#ccc';
            } else {
                checkoutBtn.textContent = 'Proceed to Checkout';
                checkoutBtn.disabled = false;
                checkoutBtn.style.opacity = '1';
                checkoutBtn.style.cursor = 'pointer';
                checkoutBtn.style.background = '#4a7c59';
            }
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureMobileCheckoutButton);
    } else {
        ensureMobileCheckoutButton();
    }
    
    // Also run after a delay to catch dynamically loaded content
    setTimeout(ensureMobileCheckoutButton, 1000);
    setTimeout(ensureMobileCheckoutButton, 3000);
    
    // Update button state periodically
    setInterval(updateCheckoutButtonState, 2000);
    
    // Listen for window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            setTimeout(ensureMobileCheckoutButton, 100);
        }
    });
    
    // Listen for cart updates
    document.addEventListener('cartUpdated', () => {
        setTimeout(() => {
            ensureMobileCheckoutButton();
            updateCheckoutButtonState();
        }, 100);
    });
    
    console.log('✅ Mobile checkout fix loaded');
})();