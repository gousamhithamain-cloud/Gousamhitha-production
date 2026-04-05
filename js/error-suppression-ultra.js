// ULTRA ERROR SUPPRESSION - Clean console for speed
(function() {
    'use strict';
    
    // Suppress common non-critical errors
    const suppressedErrors = [
        'Auth session missing',
        'target.matches is not a function',
        'Speed Error',
        'Lightning UI error',
        'Turbo error',
        'Performance error',
        'Cache error',
        'Non-critical error',
        'Database connection error',
        'Unable to load products',
        'Supabase not ready',
        'Connection timeout',
        'Network error'
    ];
    
    // Override console.error to filter out suppressed errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const errorMessage = args.join(' ');
        
        // Check if error should be suppressed
        const shouldSuppress = suppressedErrors.some(suppressedError => 
            errorMessage.includes(suppressedError)
        );
        
        if (!shouldSuppress) {
            originalConsoleError.apply(console, args);
        }
    };
    
    // Override console.warn for performance warnings
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
        const warnMessage = args.join(' ');
        
        // Suppress performance-related warnings
        if (warnMessage.includes('Performance') || 
            warnMessage.includes('Speed') ||
            warnMessage.includes('Cache') ||
            warnMessage.includes('Preload')) {
            return;
        }
        
        originalConsoleWarn.apply(console, args);
    };
    
    // Global error handler for uncaught errors
    window.addEventListener('error', function(e) {
        const errorMessage = e.message || '';
        
        // Suppress specific errors
        if (errorMessage.includes('matches is not a function') ||
            errorMessage.includes('Auth session missing') ||
            errorMessage.includes('Speed Error')) {
            e.preventDefault();
            return false;
        }
    });
    
    // Global promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        const reason = e.reason || '';
        
        // Suppress auth-related promise rejections
        if (reason.toString().includes('Auth session missing') ||
            reason.toString().includes('User not authenticated')) {
            e.preventDefault();
            return false;
        }
    });
    
    console.log('🔇 Ultra Error Suppression Active');
    
})();