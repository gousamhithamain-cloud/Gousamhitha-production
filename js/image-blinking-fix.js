// Image Blinking Fix - Prevent images from appearing and disappearing
(function() {
    'use strict';
    
    // Disable fast loading enhancement on shop page to prevent conflicts
    if (window.location.pathname.includes('shop.html') || 
        window.location.pathname.includes('shop')) {
        
        // Override fast loading to prevent skeleton interference
        window.addEventListener('DOMContentLoaded', function() {
            // Remove any skeleton loading that might interfere
            const productGrid = document.querySelector('.product-grid');
            if (productGrid) {
                // Clear any skeleton content
                const skeletons = productGrid.querySelectorAll('.fast-skeleton-card, .skeleton-card');
                skeletons.forEach(skeleton => skeleton.remove());
                
                // If grid is empty, show simple loading text instead of skeleton
                if (!productGrid.innerHTML.trim() || productGrid.innerHTML.includes('skeleton')) {
                    productGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Loading products...</div>';
                }
            }
        });
        
        // Prevent multiple loading attempts
        let loadingAttempts = 0;
        const originalLoadProducts = window.loadProducts;
        
        if (originalLoadProducts) {
            window.loadProducts = function() {
                loadingAttempts++;
                if (loadingAttempts > 1) {
                    console.log('⚠️ Preventing duplicate product loading attempt');
                    return;
                }
                return originalLoadProducts.apply(this, arguments);
            };
        }
    }
    
    // Add CSS to prevent image flickering
    const style = document.createElement('style');
    style.textContent = `
        .product-card img {
            transition: opacity 0.3s ease !important;
        }
        
        .product-card img[src=""] {
            opacity: 0;
        }
        
        .product-card img:not([src=""]) {
            opacity: 1;
        }
        
        /* Prevent skeleton from replacing loaded content */
        .product-grid:has(.product-card:not(.skeleton-card)) .skeleton-card {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
    
})();