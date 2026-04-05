// Performance Optimizer - Caching, debouncing, and optimization utilities
(function() {
    'use strict';
    
    // Performance cache system
    window.PerformanceCache = {
        data: new Map(),
        timestamps: new Map(),
        
        // Cache with TTL (time to live)
        set(key, value, ttl = 300000) { // 5 minutes default
            this.data.set(key, value);
            this.timestamps.set(key, Date.now() + ttl);
        },
        
        get(key) {
            if (this.timestamps.get(key) > Date.now()) {
                return this.data.get(key);
            }
            this.delete(key);
            return null;
        },
        
        delete(key) {
            this.data.delete(key);
            this.timestamps.delete(key);
        },
        
        clear() {
            this.data.clear();
            this.timestamps.clear();
        }
    };
    
    // Debounce utility for search and filters
    window.debounce = function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    // Throttle utility for scroll events
    window.throttle = function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };
    
    // Optimized DOM query with caching
    window.getCachedElement = function(selector) {
        const cacheKey = `dom_${selector}`;
        let element = window.PerformanceCache.get(cacheKey);
        if (!element) {
            element = document.querySelector(selector);
            if (element) {
                window.PerformanceCache.set(cacheKey, element, 60000); // 1 minute cache
            }
        }
        return element;
    };
    
    // Batch DOM updates
    window.batchDOMUpdates = function(updates) {
        requestAnimationFrame(() => {
            updates.forEach(update => update());
        });
    };
    
    // Setup lazy loading for images
    window.setupLazyLoading = function() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('img[data-src]').forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }
    };
    
    // Optimized event listener management
    window.EventManager = {
        listeners: new Map(),
        
        add(element, event, handler, options = {}) {
            const key = `${element}_${event}`;
            if (!this.listeners.has(key)) {
                this.listeners.set(key, []);
            }
            this.listeners.get(key).push(handler);
            element.addEventListener(event, handler, options);
        },
        
        remove(element, event, handler) {
            const key = `${element}_${event}`;
            const handlers = this.listeners.get(key);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                    element.removeEventListener(event, handler);
                }
            }
        },
        
        removeAll(element, event) {
            const key = `${element}_${event}`;
            const handlers = this.listeners.get(key);
            if (handlers) {
                handlers.forEach(handler => {
                    element.removeEventListener(event, handler);
                });
                this.listeners.delete(key);
            }
        }
    };
    
})();