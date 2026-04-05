// Cart Total Fix - Ensures cart total updates correctly
(function() {
    'use strict';
    
    console.log('🔧 Cart Total Fix loading...');
    
    // Force cart total recalculation every time quantity changes
    function forceCartTotalUpdate() {
        console.log('🔧 Forcing cart total update...');
        
        let total = 0;
        let totalItems = 0;
        
        // Calculate from all cart items
        const cartItems = document.querySelectorAll('.cart-item');
        console.log(`🔧 Found ${cartItems.length} cart items for total calculation`);
        
        cartItems.forEach((item, index) => {
            const quantityDisplay = item.querySelector('.quantity-display');
            const priceElement = item.querySelector('.cart-item-price');
            
            if (quantityDisplay && priceElement) {
                const quantity = parseInt(quantityDisplay.textContent) || 0;
                const price = parseFloat(priceElement.textContent.replace('₹', '')) || 0;
                const itemTotal = price * quantity;
                
                console.log(`🔧 Item ${index + 1}: ${quantity} × ₹${price} = ₹${itemTotal}`);
                
                // Update the item total display
                const itemTotalElement = item.querySelector('.item-total');
                if (itemTotalElement) {
                    itemTotalElement.textContent = `₹${itemTotal.toFixed(2)}`;
                }
                
                totalItems += quantity;
                total += itemTotal;
            }
        });
        
        console.log(`🔧 Final totals: ${totalItems} items, ₹${total.toFixed(2)}`);
        
        // Update cart total display
        const cartTotalElements = document.querySelectorAll('.cart-total, .cart-summary h3');
        cartTotalElements.forEach(element => {
            if (element) {
                element.textContent = `Cart Total: ₹${total.toFixed(2)}`;
                console.log('🔧 Updated cart total element');
            }
        });
        
        // Update cart count in navigation
        const navCartCount = document.getElementById('nav-cart-count');
        if (navCartCount) {
            navCartCount.textContent = totalItems;
        }
        
        const bottomNavCount = document.getElementById('bottom-nav-cart-count');
        if (bottomNavCount) {
            bottomNavCount.textContent = totalItems;
            bottomNavCount.classList.toggle('hidden', totalItems === 0);
        }
        
        return { total, totalItems };
    }
    
    // Override quantity update functions to ensure total recalculation
    function setupTotalUpdateTriggers() {
        // Listen for any changes to quantity displays
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const target = mutation.target;
                    
                    // Check if a quantity display or item total changed
                    if (target.classList && (
                        target.classList.contains('quantity-display') ||
                        target.classList.contains('item-total') ||
                        target.closest('.quantity-display') ||
                        target.closest('.item-total')
                    )) {
                        shouldUpdate = true;
                    }
                }
            });
            
            if (shouldUpdate) {
                console.log('🔧 Detected quantity/total change, updating cart total...');
                setTimeout(forceCartTotalUpdate, 100);
            }
        });
        
        // Observe the cart items container
        const cartItemsContainer = document.getElementById('cart-items');
        if (cartItemsContainer) {
            observer.observe(cartItemsContainer, {
                childList: true,
                subtree: true,
                characterData: true
            });
            console.log('🔧 Set up cart total update observer');
        }
    }
    
    // Initialize when DOM is ready
    function init() {
        if (document.getElementById('cart-items')) {
            setupTotalUpdateTriggers();
            
            // Force initial calculation after a delay
            setTimeout(() => {
                console.log('🔧 Running initial cart total calculation...');
                forceCartTotalUpdate();
            }, 2000);
        }
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose function globally for manual triggering
    window.forceCartTotalUpdate = forceCartTotalUpdate;
    
    console.log('✅ Cart Total Fix loaded');
    
})();