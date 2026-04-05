// ADMIN CACHE INVALIDATOR - Clear cache when data changes
(function() {
    'use strict';
    
    console.log('🔄 ADMIN CACHE INVALIDATOR ACTIVATED');
    
    // Function to clear admin cache when data changes
    function clearAdminCache(reason) {
        if (window.AdminCache) {
            window.AdminCache.clear();
            console.log('🗑️ Admin cache cleared:', reason);
        }
    }
    
    // Override common admin functions to clear cache
    function wrapFunctionWithCacheClear(functionName, reason) {
        const originalFunction = window[functionName];
        if (typeof originalFunction === 'function') {
            window[functionName] = async function() {
                const result = await originalFunction.apply(this, arguments);
                clearAdminCache(reason);
                return result;
            };
            console.log('✅ Wrapped', functionName, 'with cache clearing');
        }
    }
    
    // Wait for functions to be available and wrap them
    setTimeout(() => {
        // Product-related functions
        wrapFunctionWithCacheClear('handleAddProduct', 'Product added');
        wrapFunctionWithCacheClear('deleteProduct', 'Product deleted');
        wrapFunctionWithCacheClear('updateProductInDatabase', 'Product updated');
        wrapFunctionWithCacheClear('toggleStock', 'Stock toggled');
        
        // Vendor-related functions
        wrapFunctionWithCacheClear('handleAddVendor', 'Vendor added');
        
        // Order-related functions (if any)
        wrapFunctionWithCacheClear('deleteOrder', 'Order deleted');
        
        console.log('✅ Cache invalidation hooks installed');
    }, 1000);
    
    // Also clear cache on page visibility change (when user switches tabs and comes back)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // Page became visible again, check if we should refresh cache
            if (window.AdminCache && window.AdminCache.isValid()) {
                const cached = window.AdminCache.get();
                if (cached && (Date.now() - cached.timestamp) > 2 * 60 * 1000) { // 2 minutes
                    console.log('🔄 Page visible again, cache is old, clearing...');
                    clearAdminCache('Page visibility - cache too old');
                }
            }
        }
    });
    
    // Expose function globally for manual cache clearing
    window.clearAdminCache = clearAdminCache;
    
    console.log('✅ Admin Cache Invalidator ready');
    
})();