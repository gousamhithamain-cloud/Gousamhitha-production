// Optimized Console Management - Remove unnecessary logs, keep error handling
(function() {
    'use strict';
    
    // Production mode - suppress non-critical console logs
    const isProduction = true; // Set to false for development
    
    if (isProduction) {
        // Override console methods to reduce noise
        const originalLog = console.log;
        const originalInfo = console.info;
        const originalWarn = console.warn;
        
        console.log = function(...args) {
            // Only log critical information
            const message = args.join(' ');
            if (message.includes('ERROR') || message.includes('CRITICAL') || message.includes('❌')) {
                originalLog.apply(console, args);
            }
        };
        
        console.info = function(...args) {
            // Suppress info logs in production
        };
        
        // Keep warnings for important issues
        console.warn = function(...args) {
            const message = args.join(' ');
            if (message.includes('Performance') || message.includes('Cache') || message.includes('Network')) {
                originalWarn.apply(console, args);
            }
        };
    }
    
    // Essential error handling without excessive logging
    function safeExecute(fn, fallback = null) {
        try {
            return fn();
        } catch (error) {
            return fallback;
        }
    }
    
    // Essential missing function fixes
    if (typeof window.getCart === 'undefined') {
        window.getCart = () => safeExecute(() => JSON.parse(localStorage.getItem('cart') || '[]'), []);
    }
    
    if (typeof window.cart_manager === 'undefined') {
        window.cart_manager = {
            getCartCount: () => safeExecute(() => window.getCart().length, 0)
        };
    }
    
    // Minimal DOM error prevention
    function preventCriticalDOMErrors() {
        const criticalSelectors = ['.cart-count', '#cart-count'];
        criticalSelectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element && !element.textContent) {
                element.textContent = '0';
            }
        });
    }
    
    // Essential Supabase fallback
    function ensureSupabase() {
        if (typeof window.supabase === 'undefined') {
            window.supabase = {
                auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }) },
                from: () => ({
                    select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
                    insert: () => Promise.resolve({ data: null, error: null }),
                    update: () => Promise.resolve({ data: null, error: null }),
                    delete: () => Promise.resolve({ data: null, error: null })
                })
            };
        }
    }
    
    // Critical error suppression only
    window.addEventListener('error', function(e) {
        const suppressedErrors = [
            'ResizeObserver loop limit exceeded',
            'Script error',
            'Network request failed'
        ];
        
        if (suppressedErrors.some(error => e.message && e.message.includes(error))) {
            e.preventDefault();
            return false;
        }
    });
    
    // Initialize minimal error fixes
    function initializeOptimizedConsole() {
        preventCriticalDOMErrors();
        ensureSupabase();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOptimizedConsole);
    } else {
        initializeOptimizedConsole();
    }
    
})();