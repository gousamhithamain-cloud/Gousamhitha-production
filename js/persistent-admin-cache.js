// PERSISTENT ADMIN CACHE - Memory-only (no localStorage to avoid QuotaExceededError)
(function() {
    'use strict';

    console.log('💾 PERSISTENT ADMIN CACHE ACTIVATED (memory-only)');

    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    let _cache = null;

    window.AdminCache = {
        get: function() {
            if (!_cache) return null;
            if (Date.now() - _cache.timestamp > CACHE_TTL) {
                console.log('📅 Cache expired, clearing...');
                _cache = null;
                return null;
            }
            console.log('✅ Using cached admin data (memory):', {
                products: _cache.products?.length || 0,
                vendors: _cache.vendors?.length || 0,
                orders: _cache.orders?.length || 0,
                age: Math.round((Date.now() - _cache.timestamp) / 1000) + 's'
            });
            return _cache;
        },

        set: function(products, vendors, orders) {
            _cache = {
                products: products || [],
                vendors: vendors || [],
                orders: orders || [],
                timestamp: Date.now()
            };
            console.log('💾 Admin data cached (memory):', {
                products: _cache.products.length,
                vendors: _cache.vendors.length,
                orders: _cache.orders.length
            });
            return true;
        },

        clear: function() {
            _cache = null;
            console.log('🗑️ Admin cache cleared');
        },

        isValid: function() {
            return this.get() !== null;
        }
    };

    // Clear cache on logout
    const originalAdminLogout = window.adminLogout;
    if (typeof originalAdminLogout === 'function') {
        window.adminLogout = function() {
            window.AdminCache.clear();
            return originalAdminLogout.apply(this, arguments);
        };
    }

    console.log('✅ Persistent Admin Cache ready (memory-only)');
})();
