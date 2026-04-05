// PRODUCT LOADER INITIALIZATION
(function() {
    'use strict';
    
    console.log('🔄 Product Loader Init');
    
    // Initialize product loading when everything is ready
    function initProductLoading() {
        // Check if we have a product grid
        const productGrid = document.querySelector('.product-grid');
        const homeProductGrid = document.getElementById('home-product-grid');
        
        if (productGrid || homeProductGrid) {
            console.log('📦 Initializing product loading...');
            
            // Use instant loading if available
            if (window.loadProductsInstant) {
                window.loadProductsInstant();
            } else if (window.loadProducts) {
                window.loadProducts();
            } else {
                console.log('⚠️ No product loading function available');
            }
        }
    }
    
    // Try multiple initialization points
    document.addEventListener('DOMContentLoaded', initProductLoading);
    window.addEventListener('supabaseReady', initProductLoading);
    
    // Fallback initialization
    setTimeout(initProductLoading, 2000);
    
})();