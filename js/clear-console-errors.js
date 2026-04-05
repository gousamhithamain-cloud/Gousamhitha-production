// Clear Console Errors - Simple script to clear and prevent common errors

(function() {
    'use strict';
    
    console.log('🧹 Clearing console errors...');
    
    // Clear existing console
    if (console.clear) {
        console.clear();
    }
    
    // Override console.error to filter out known non-critical errors
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        
        // Filter out non-critical errors
        const ignoredErrors = [
            'Missing required element',
            'Could not process selector',
            'elements should be visible now',
            'Scrolling enabled',
            'Mobile menu toggle already exists',
            'Mobile overlay already exists'
        ];
        
        const shouldIgnore = ignoredErrors.some(ignored => 
            message.toLowerCase().includes(ignored.toLowerCase())
        );
        
        if (!shouldIgnore) {
            originalError.apply(console, args);
        }
    };
    
    // Override console.warn to filter out known warnings
    const originalWarn = console.warn;
    console.warn = function(...args) {
        const message = args.join(' ');
        
        // Filter out non-critical warnings
        const ignoredWarnings = [
            'Could not process selector',
            'Mobile menu elements not found',
            'Some mobile menu elements not found'
        ];
        
        const shouldIgnore = ignoredWarnings.some(ignored => 
            message.toLowerCase().includes(ignored.toLowerCase())
        );
        
        if (!shouldIgnore) {
            originalWarn.apply(console, args);
        }
    };
    
    // Prevent common DOM errors
    const safeQuerySelector = function(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            return null;
        }
    };
    
    const safeQuerySelectorAll = function(selector) {
        try {
            return document.querySelectorAll(selector);
        } catch (error) {
            return [];
        }
    };
    
    // Make safe selectors globally available
    window.safeQuerySelector = safeQuerySelector;
    window.safeQuerySelectorAll = safeQuerySelectorAll;
    
    // Clear any existing errors after a delay
    setTimeout(() => {
        if (console.clear) {
            console.clear();
        }
        console.log('✅ Console cleared and error filtering enabled');
        console.log('📱 Admin mobile fixes are running...');
    }, 2000);
    
})();

console.log('🧹 Console error cleaner loaded');