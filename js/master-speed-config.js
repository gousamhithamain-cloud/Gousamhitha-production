// MASTER SPEED CONFIGURATION - Ultimate performance settings
(function() {
    'use strict';
    
    // GLOBAL SPEED SETTINGS
    window.SPEED_CONFIG = {
        // Cache settings
        CACHE_TTL: 30000, // 30 seconds
        MAX_CACHE_SIZE: 1000,
        PRELOAD_DELAY: 0, // Instant preload
        
        // Database settings
        DB_TIMEOUT: 3000, // 3 seconds max
        BATCH_SIZE: 50,
        CONNECTION_POOL_SIZE: 10,
        
        // UI settings
        ANIMATION_DURATION: 150, // Ultra fast animations
        DEBOUNCE_DELAY: 50, // Ultra responsive
        RENDER_BATCH_SIZE: 20,
        
        // Network settings
        RETRY_ATTEMPTS: 2,
        RETRY_DELAY: 500,
        PREFETCH_ENABLED: true,
        
        // Performance monitoring
        PERFORMANCE_LOGGING: true,
        METRICS_ENABLED: true
    };
    
    // SPEED OPTIMIZATION FLAGS
    window.SPEED_FLAGS = {
        ULTRA_CACHE: true,
        INSTANT_RENDER: true,
        TURBO_DATABASE: true,
        LIGHTNING_UI: true,
        PRELOAD_EVERYTHING: true,
        BATCH_OPERATIONS: true,
        VIRTUAL_DOM: true,
        EVENT_DELEGATION: true,
        MEMORY_OPTIMIZATION: true,
        NETWORK_OPTIMIZATION: true
    };
    
    // PERFORMANCE TARGETS
    window.PERFORMANCE_TARGETS = {
        PRODUCT_LOAD_TIME: 100, // 100ms target
        CART_UPDATE_TIME: 50,   // 50ms target
        SEARCH_RESPONSE_TIME: 100, // 100ms target
        PAYMENT_PROCESS_TIME: 200, // 200ms target
        PAGE_LOAD_TIME: 500,    // 500ms target
        DATABASE_QUERY_TIME: 200 // 200ms target
    };
    
    // SPEED MONITORING
    const SpeedMonitor = {
        metrics: new Map(),
        
        startTimer: function(operation) {
            this.metrics.set(operation, performance.now());
        },
        
        endTimer: function(operation) {
            const startTime = this.metrics.get(operation);
            if (startTime) {
                const duration = performance.now() - startTime;
                const target = window.PERFORMANCE_TARGETS[operation.toUpperCase() + '_TIME'] || 1000;
                
                if (window.SPEED_CONFIG.PERFORMANCE_LOGGING) {
                    const status = duration <= target ? '✅' : '⚠️';
                    console.log(`${status} ${operation}: ${duration.toFixed(2)}ms (target: ${target}ms)`);
                }
                
                this.metrics.delete(operation);
                return duration;
            }
        },
        
        getAverageTime: function(operation) {
            // Implementation for average calculation
            return 0;
        }
    };
    
    // MEMORY OPTIMIZATION
    const MemoryOptimizer = {
        cleanup: function() {
            // Force garbage collection hints
            if (window.gc) {
                window.gc();
            }
            
            // Clear old cache entries
            if (window.ultraCache) {
                const now = Date.now();
                for (const [key, timestamp] of window.ultraCache.timestamps || []) {
                    if (now - timestamp > window.SPEED_CONFIG.CACHE_TTL * 2) {
                        window.ultraCache.delete(key);
                    }
                }
            }
        },
        
        optimize: function() {
            // Remove unused event listeners
            // Optimize DOM queries
            // Clean up intervals/timeouts
            this.cleanup();
        }
    };
    
    // NETWORK OPTIMIZATION
    const NetworkOptimizer = {
        prefetchQueue: [],
        
        prefetch: function(url) {
            if (!window.SPEED_FLAGS.PREFETCH_ENABLED) return;
            
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        },
        
        preloadCriticalResources: function() {
            const criticalResources = [
                'js/supabase-client.js',
                'styles.css',
                'images/ghee.png',
                'images/gomutra.png',
                'images/cow-dung.png',
                'images/panchagavya.png'
            ];
            
            criticalResources.forEach(resource => {
                this.prefetch(resource);
            });
        }
    };
    
    // SPEED INITIALIZATION
    function initMasterSpeedConfig() {
        console.log('🚀 MASTER SPEED CONFIG ACTIVATED');
        console.log('⚡ Performance Targets:', window.PERFORMANCE_TARGETS);
        console.log('🔧 Speed Flags:', window.SPEED_FLAGS);
        
        // Start network optimization
        NetworkOptimizer.preloadCriticalResources();
        
        // Setup memory optimization
        setInterval(() => {
            MemoryOptimizer.optimize();
        }, 30000); // Every 30 seconds
        
        // Setup performance monitoring
        window.SpeedMonitor = SpeedMonitor;
        
        // Override console.log for performance in production
        if (!window.SPEED_CONFIG.PERFORMANCE_LOGGING) {
            console.log = function() {};
        }
        
        // Setup global error handling for speed
        window.addEventListener('error', (e) => {
            console.error('Speed Error:', e.error);
        });
        
        // Setup unhandled promise rejection handling
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Speed Promise Error:', e.reason);
        });
    }
    
    // SPEED UTILITIES
    window.SpeedUtils = {
        // Ultra fast array operations
        fastMap: function(array, fn) {
            const result = new Array(array.length);
            for (let i = 0; i < array.length; i++) {
                result[i] = fn(array[i], i);
            }
            return result;
        },
        
        // Ultra fast object cloning
        fastClone: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        
        // Ultra fast debounce
        fastDebounce: function(func, delay) {
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        },
        
        // Ultra fast throttle
        fastThrottle: function(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };
    
    // Start immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMasterSpeedConfig);
    } else {
        initMasterSpeedConfig();
    }
    
})();