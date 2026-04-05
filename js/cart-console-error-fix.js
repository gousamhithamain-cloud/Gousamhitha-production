// Cart Console Error Fix - Suppress duplicate cart loading messages
(function() {
    'use strict';
    
    console.log('🔇 Cart Console Error Fix loading...');
    
    // Track console messages to prevent spam
    const messageTracker = new Map();
    const MESSAGE_COOLDOWN = 2000; // 2 seconds
    
    // Override console methods to filter cart-related spam
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    function shouldSuppressMessage(message) {
        const messageStr = String(message).toLowerCase();
        
        // Messages to suppress or limit
        const spamPatterns = [
            'waiting for cart items to load',
            'hamburger menu elements forcefully hidden/removed',
            'profile ui updated',
            'user logged in as',
            'navigator menu elements forcefully hidden/removed',
            'waiting for cart item to load',
            'mailing for cart items to load'
        ];
        
        return spamPatterns.some(pattern => messageStr.includes(pattern));
    }
    
    function filterConsoleMessage(originalFn, level) {
        return function(...args) {
            const message = args.join(' ');
            
            if (shouldSuppressMessage(message)) {
                const now = Date.now();
                const key = `${level}:${message}`;
                
                // Check if we've seen this message recently
                if (messageTracker.has(key)) {
                    const lastTime = messageTracker.get(key);
                    if (now - lastTime < MESSAGE_COOLDOWN) {
                        return; // Suppress duplicate message
                    }
                }
                
                messageTracker.set(key, now);
                
                // Clean up old entries
                if (messageTracker.size > 100) {
                    const cutoff = now - MESSAGE_COOLDOWN * 2;
                    for (const [k, time] of messageTracker.entries()) {
                        if (time < cutoff) {
                            messageTracker.delete(k);
                        }
                    }
                }
            }
            
            // Call original function
            originalFn.apply(console, args);
        };
    }
    
    // Override console methods
    console.log = filterConsoleMessage(originalConsoleLog, 'log');
    console.error = filterConsoleMessage(originalConsoleError, 'error');
    console.warn = filterConsoleMessage(originalConsoleWarn, 'warn');
    
    // Prevent multiple cart loading attempts
    let cartLoadInProgress = false;
    let cartLoadAttempts = 0;
    const MAX_CART_LOAD_ATTEMPTS = 3;
    
    // Override loadCart function to prevent multiple simultaneous calls
    const originalLoadCart = window.loadCart;
    
    function createSafeLoadCart() {
        return async function safeLoadCart() {
            if (cartLoadInProgress) {
                console.log('Cart load already in progress, skipping...');
                return;
            }
            
            if (cartLoadAttempts >= MAX_CART_LOAD_ATTEMPTS) {
                console.log('Max cart load attempts reached, skipping...');
                return;
            }
            
            cartLoadInProgress = true;
            cartLoadAttempts++;
            
            try {
                if (originalLoadCart && typeof originalLoadCart === 'function') {
                    await originalLoadCart();
                }
            } catch (error) {
                console.error('Safe cart load error:', error);
            } finally {
                cartLoadInProgress = false;
                
                // Reset attempts after successful load or timeout
                setTimeout(() => {
                    cartLoadAttempts = 0;
                }, 5000);
            }
        };
    }
    
    // Wait for loadCart to be available and then override it
    function setupSafeLoadCart() {
        if (window.loadCart && typeof window.loadCart === 'function') {
            window.loadCart = createSafeLoadCart();
            console.log('✅ Safe loadCart wrapper installed');
        } else {
            setTimeout(setupSafeLoadCart, 100);
        }
    }
    
    // Initialize after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSafeLoadCart);
    } else {
        setupSafeLoadCart();
    }
    
    // Clean up message tracker periodically
    setInterval(() => {
        const now = Date.now();
        const cutoff = now - MESSAGE_COOLDOWN * 5;
        
        for (const [key, time] of messageTracker.entries()) {
            if (time < cutoff) {
                messageTracker.delete(key);
            }
        }
    }, 30000); // Clean up every 30 seconds
    
    console.log('✅ Cart Console Error Fix initialized');
    
})();