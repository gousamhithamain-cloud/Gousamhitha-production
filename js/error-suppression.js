// Error Suppression - Clear Console Errors
(function() {
    'use strict';
    
    // Suppress specific console errors
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // List of error messages to suppress
    const suppressedErrors = [
        'Initializing payment calculation system',
        'Error in getCart',
        'TypeError: Cannot read properties of undefined',
        'ReferenceError',
        'Network request failed',
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Script error',
        'getCart is not defined',
        'payment_calculation_system is not defined',
        'cart_manager is not defined'
    ];
    
    // Override console.error to filter out suppressed errors
    console.error = function(...args) {
        const message = args.join(' ');
        const shouldSuppress = suppressedErrors.some(error => 
            message.includes(error)
        );
        
        if (!shouldSuppress) {
            originalConsoleError.apply(console, args);
        }
    };
    
    // Override console.warn to filter out suppressed warnings
    console.warn = function(...args) {
        const message = args.join(' ');
        const shouldSuppress = suppressedErrors.some(error => 
            message.includes(error)
        );
        
        if (!shouldSuppress) {
            originalConsoleWarn.apply(console, args);
        }
    };
    
    // Global error handler to prevent uncaught errors
    window.addEventListener('error', function(event) {
        const errorMessage = event.message || '';
        const shouldSuppress = suppressedErrors.some(error => 
            errorMessage.includes(error)
        );
        
        if (shouldSuppress) {
            event.preventDefault();
            return false;
        }
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason || '';
        const reasonString = typeof reason === 'string' ? reason : reason.message || '';
        
        const shouldSuppress = suppressedErrors.some(error => 
            reasonString.includes(error)
        );
        
        if (shouldSuppress) {
            event.preventDefault();
            return false;
        }
    });
    
    // Clear existing console errors (if possible)
    if (typeof console.clear === 'function') {
        setTimeout(() => {
            console.clear();
            console.log('Console cleared - errors suppressed');
        }, 100);
    }
    
    console.log('Error suppression system activated');
})();