// Performance Loader - Loads all optimizations in the correct order
(function() {
    'use strict';
    
    // Performance monitoring
    const performanceMetrics = {
        startTime: performance.now(),
        loadTimes: {},
        cacheHits: 0,
        cacheMisses: 0
    };
    
    // Load optimization scripts in order
    const optimizationScripts = [
        'js/performance-optimizer.js',
        'js/admin-script-optimized.js',
        'js/product-display-optimized.js',
        'js/search-optimized.js',
        'js/category-filter-optimized.js'
    ];
    
    // Load scripts dynamically for better performance
    function loadOptimizationScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                performanceMetrics.loadTimes[src] = performance.now() - performanceMetrics.startTime;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Initialize all optimizations
    async function initializeOptimizations() {
        try {
            // Load performance optimizer first
            await loadOptimizationScript('js/performance-optimizer.js');
            
            // Load other optimizations in parallel for better performance
            const otherScripts = optimizationScripts.slice(1);
            await Promise.all(otherScripts.map(loadOptimizationScript));
            
            // Setup performance monitoring
            setupPerformanceMonitoring();
            
            // Setup cache management
            setupCacheManagement();
            
            // Mark optimizations as loaded to prevent conflicts
            window.optimizationsLoaded = true;
            
            console.log('✅ All performance optimizations loaded');
            console.log('📊 Load times:', performanceMetrics.loadTimes);
            
        } catch (error) {
            console.error('❌ Error loading optimizations:', error);
        }
    }
    
    // Performance monitoring setup
    function setupPerformanceMonitoring() {
        // Monitor cache performance
        if (window.PerformanceCache) {
            const originalGet = window.PerformanceCache.get;
            const originalSet = window.PerformanceCache.set;
            
            window.PerformanceCache.get = function(key) {
                const result = originalGet.call(this, key);
                if (result !== null) {
                    performanceMetrics.cacheHits++;
                } else {
                    performanceMetrics.cacheMisses++;
                }
                return result;
            };
            
            window.PerformanceCache.set = function(key, value, ttl) {
                return originalSet.call(this, key, value, ttl);
            };
        }
        
        // Monitor page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.now() - performanceMetrics.startTime;
            console.log(`📈 Page load time: ${loadTime.toFixed(2)}ms`);
            
            // Report cache efficiency
            const totalCacheRequests = performanceMetrics.cacheHits + performanceMetrics.cacheMisses;
            if (totalCacheRequests > 0) {
                const cacheHitRate = (performanceMetrics.cacheHits / totalCacheRequests * 100).toFixed(1);
                console.log(`💾 Cache hit rate: ${cacheHitRate}%`);
            }
        });
    }
    
    // Cache management setup
    function setupCacheManagement() {
        // Clear old cache entries periodically
        setInterval(() => {
            if (window.PerformanceCache && typeof window.PerformanceCache.clear === 'function') {
                // Clear expired entries
                const now = Date.now();
                for (const [key, timestamp] of window.PerformanceCache.timestamps) {
                    if (timestamp <= now) {
                        window.PerformanceCache.delete(key);
                    }
                }
            }
        }, 60000); // Every minute
        
        // Clear cache on visibility change (when user returns to tab)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Invalidate product caches when user returns
                if (window.invalidateProductCache) {
                    window.invalidateProductCache();
                }
                if (window.invalidateCategoryCache) {
                    window.invalidateCategoryCache();
                }
            }
        });
    }
    
    // Expose performance metrics
    window.getPerformanceMetrics = function() {
        return {
            ...performanceMetrics,
            totalLoadTime: performance.now() - performanceMetrics.startTime,
            cacheHitRate: performanceMetrics.cacheHits + performanceMetrics.cacheMisses > 0 ? 
                (performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100).toFixed(1) + '%' : 
                'N/A'
        };
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOptimizations);
    } else {
        initializeOptimizations();
    }
    
})();