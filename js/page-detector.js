// Page Detector - Controls hamburger menu visibility
(function() {
    'use strict';
    
    function setPageClass() {
        // Get current page from URL
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        console.log('📄 Current page:', currentPage);
        
        // Remove any existing page classes
        document.body.classList.remove('page-home', 'page-shop', 'page-cart', 'page-orders', 'page-about', 'page-contact', 'page-checkout');
        
        // Add appropriate page class
        if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
            document.body.classList.add('page-home');
            console.log('🏠 Home page - hamburger menu hidden');
        } else if (currentPage === 'shop.html') {
            document.body.classList.add('page-shop');
            console.log('🛍️ Shop page - hamburger menu hidden');
        } else if (currentPage === 'cart.html') {
            document.body.classList.add('page-cart');
            console.log('🛒 Cart page - hamburger menu hidden');
        } else if (currentPage === 'orders.html') {
            document.body.classList.add('page-orders');
            console.log('📦 Orders page - hamburger menu hidden');
        } else if (currentPage === 'about.html') {
            document.body.classList.add('page-about');
            console.log('ℹ️ About page - hamburger menu hidden');
        } else if (currentPage === 'contact.html') {
            document.body.classList.add('page-contact');
            console.log('📞 Contact page - hamburger menu hidden');
        } else if (currentPage === 'checkout.html') {
            document.body.classList.add('page-checkout');
            console.log('💳 Checkout page - hamburger menu hidden');
        } else {
            console.log('📄 Other page - hamburger menu hidden');
        }
    }
    
    function forceHideHamburgerMenu() {
        // Force hide ONLY hamburger menu elements (NOT profile icons)
        const elementsToHide = [
            '.hamburger-menu',
            'button.hamburger-menu',
            '#hamburger-btn',
            '[id="hamburger-btn"]',
            '[class*="hamburger-menu"]',
            '.hamburger-dropdown',
            '#hamburger-dropdown',
            '[id="hamburger-dropdown"]',
            '[class*="hamburger-dropdown"]'
        ];
        
        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.pointerEvents = 'none';
                element.style.position = 'absolute';
                element.style.left = '-9999px';
                element.style.width = '0';
                element.style.height = '0';
                element.style.overflow = 'hidden';
                element.style.zIndex = '-1';
                
                // Also remove from DOM
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
        });
        
        // Reduce console spam for hamburger menu
        if (!window.hamburgerHideLogCount) window.hamburgerHideLogCount = 0;
        window.hamburgerHideLogCount++;
        
        if (window.hamburgerHideLogCount % 10 === 1) {
            console.log('🚫 Hamburger menu elements forcefully hidden/removed (profile icons preserved)');
        }
    }
    
    // Set page class immediately
    setPageClass();
    
    // Force hide hamburger menu immediately
    forceHideHamburgerMenu();
    
    // Also set on DOM ready (in case body class is needed later)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setPageClass();
            forceHideHamburgerMenu();
        });
    }
    
    // Run again after a short delay to catch any dynamically added elements
    setTimeout(() => {
        forceHideHamburgerMenu();
    }, 500);
    
    // Watch for any new hamburger menu elements being added
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => {
            forceHideHamburgerMenu();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    console.log('✅ Page detector loaded - hamburger menu disabled');
})();