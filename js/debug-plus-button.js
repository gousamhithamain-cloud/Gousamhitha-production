// Debug Plus Button - Help identify + button issues
(function() {
    'use strict';
    
    console.log('🔍 Debug Plus Button loading...');
    
    function debugPlusButtons() {
        const isDesktop = window.innerWidth > 768;
        if (!isDesktop) {
            console.log('🔍 Mobile detected, skipping debug');
            return;
        }
        
        console.log('🔍 Desktop detected - Debugging plus buttons');
        
        // Find all buttons in cart
        const allButtons = document.querySelectorAll('.cart-item-quantity button');
        console.log(`🔍 Found ${allButtons.length} total quantity buttons`);
        
        allButtons.forEach((button, index) => {
            const text = button.textContent.trim();
            const onclick = button.getAttribute('onclick') || 'none';
            const hasEventListeners = button.onclick ? 'yes' : 'no';
            
            console.log(`🔍 Button ${index}: Text="${text}", onclick="${onclick}", hasListeners="${hasEventListeners}"`);
            
            if (text === '+') {
                console.log(`🔍 PLUS BUTTON FOUND at index ${index}`);
                
                // Add debug click handler
                button.addEventListener('click', function(e) {
                    console.log('🔍 PLUS BUTTON CLICKED - Debug handler triggered');
                    console.log('🔍 Event:', e);
                    console.log('🔍 Button:', this);
                }, true);
                
                // Test if button is clickable
                const rect = button.getBoundingClientRect();
                const style = window.getComputedStyle(button);
                
                console.log(`🔍 Plus button position: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}`);
                console.log(`🔍 Plus button style: display=${style.display}, visibility=${style.visibility}, pointerEvents=${style.pointerEvents}`);
                console.log(`🔍 Plus button z-index: ${style.zIndex}`);
            }
        });
        
        // Add universal click debugger
        document.addEventListener('click', function(e) {
            if (!isDesktop) return;
            
            const target = e.target;
            if (target.tagName === 'BUTTON' && target.textContent.trim() === '+') {
                console.log('🔍 UNIVERSAL CLICK DEBUGGER: Plus button clicked');
                console.log('🔍 Target:', target);
                console.log('🔍 Event phase:', e.eventPhase);
                console.log('🔍 Default prevented:', e.defaultPrevented);
                console.log('🔍 Propagation stopped:', e.cancelBubble);
            }
        }, true);
        
        console.log('🔍 Debug setup complete');
    }
    
    // Initialize debug
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(debugPlusButtons, 1000);
        });
    } else {
        setTimeout(debugPlusButtons, 1000);
    }
    
    // Re-debug when cart changes
    const observer = new MutationObserver(() => {
        if (window.innerWidth > 768) {
            setTimeout(debugPlusButtons, 500);
        }
    });
    
    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
        observer.observe(cartItems, { childList: true, subtree: true });
    }
    
    console.log('✅ Debug Plus Button loaded');
    
})();