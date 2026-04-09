// Emergency Admin Scrolling Fix - Inline Script
// This script ensures scrolling works immediately on page load

(function() {
    'use strict';
    
    console.log('🚨 Emergency scrolling fix activated');
    
    // Immediate scrolling fix
    function forceScrollingEnabled() {
        if (!document.body) return; // Guard against running before body exists

        // Force body scrolling
        document.body.style.overflowY = 'auto';
        document.body.style.overflowX = 'hidden';
        document.body.style.height = 'auto';
        document.body.style.minHeight = '100vh';
        document.body.style.position = 'relative';
        
        // Force html scrolling
        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.height = 'auto';
        
        // Fix admin content
        const adminContent = document.querySelector('.admin-content');
        if (adminContent) {
            adminContent.style.overflowY = 'visible';
            adminContent.style.height = 'auto';
            adminContent.style.minHeight = '100vh';
            adminContent.style.paddingBottom = '2rem';
        }
        
        // Fix admin layout
        const adminLayout = document.querySelector('.admin-layout');
        if (adminLayout) {
            adminLayout.style.height = 'auto';
            adminLayout.style.minHeight = '100vh';
            adminLayout.style.overflow = 'visible';
        }
        
        console.log('✅ Emergency scrolling fix applied');
    }
    
    // Apply fix immediately
    forceScrollingEnabled();
    
    // Apply fix when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceScrollingEnabled);
    } else {
        forceScrollingEnabled();
    }
    
    // Apply fix after a short delay
    setTimeout(forceScrollingEnabled, 100);
    setTimeout(forceScrollingEnabled, 500);
    setTimeout(forceScrollingEnabled, 1000);
    
    // Monitor for any changes that might break scrolling
    let checkCount = 0;
    const scrollMonitor = setInterval(() => {
        if (checkCount < 10) { // Check 10 times
            const bodyOverflow = window.getComputedStyle(document.body).overflowY;
            if (bodyOverflow === 'hidden') {
                console.log('🔄 Detected overflow hidden, fixing...');
                forceScrollingEnabled();
            }
            checkCount++;
        } else {
            clearInterval(scrollMonitor);
            console.log('🛑 Scroll monitoring completed');
        }
    }, 1000);
    
    // Global function for manual fix
    window.fixAdminScrolling = forceScrollingEnabled;
    
})();