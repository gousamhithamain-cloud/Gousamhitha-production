// CODE CLEANUP V2 - Remove unused code and optimize performance
(function() {
    'use strict';
    
    // Console log cleanup - remove unnecessary logs in production
    const ConsoleOptimizer = {
        originalConsole: { ...console },
        
        optimize() {
            // Keep only error and warn in production-like environment
            if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                console.log = () => {};
                console.info = () => {};
                console.debug = () => {};
                // Keep console.error and console.warn for debugging
            }
        },
        
        restore() {
            Object.assign(console, this.originalConsole);
        }
    };
    
    // Remove unused event listeners
    const EventCleanup = {
        activeListeners: new Map(),
        
        addListener(element, event, handler, options) {
            const key = `${element.tagName}_${event}`;
            
            // Remove existing listener if any
            if (this.activeListeners.has(key)) {
                const { element: oldElement, event: oldEvent, handler: oldHandler } = this.activeListeners.get(key);
                oldElement.removeEventListener(oldEvent, oldHandler);
            }
            
            // Add new listener
            element.addEventListener(event, handler, options);
            this.activeListeners.set(key, { element, event, handler });
        },
        
        cleanup() {
            this.activeListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.activeListeners.clear();
        }
    };
    
    // DOM cleanup utilities
    const DOMCleanup = {
        // Remove empty text nodes
        removeEmptyTextNodes() {
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        return node.textContent.trim() === '' ? 
                            NodeFilter.FILTER_ACCEPT : 
                            NodeFilter.FILTER_REJECT;
                    }
                }
            );
            
            const emptyNodes = [];
            let node;
            while (node = walker.nextNode()) {
                emptyNodes.push(node);
            }
            
            emptyNodes.forEach(node => {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            });
        },
        
        // Remove unused CSS classes
        removeUnusedClasses() {
            const usedClasses = new Set();
            
            // Collect all used classes
            document.querySelectorAll('*').forEach(element => {
                element.classList.forEach(className => {
                    usedClasses.add(className);
                });
            });
            
            // This would require CSS parsing to remove unused rules
            // For now, just log the used classes for analysis
            console.log('Used CSS classes:', Array.from(usedClasses).sort());
        },
        
        // Optimize images
        optimizeImages() {
            document.querySelectorAll('img').forEach(img => {
                // Add loading="lazy" if not present
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
                
                // Add error handling if not present
                if (!img.onerror) {
                    img.onerror = function() {
                        this.src = 'images/placeholder.png';
                    };
                }
            });
        }
    };
    
    // Function deduplication
    const FunctionOptimizer = {
        // Memoization for expensive functions
        memoize(fn, keyGenerator) {
            const cache = new Map();
            
            return function(...args) {
                const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
                
                if (cache.has(key)) {
                    return cache.get(key);
                }
                
                const result = fn.apply(this, args);
                cache.set(key, result);
                return result;
            };
        },
        
        // Debounce expensive operations
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Throttle frequent operations
        throttle(func, limit) {
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
        }
    };
    
    // Memory leak prevention
    const MemoryOptimizer = {
        intervals: new Set(),
        timeouts: new Set(),
        observers: new Set(),
        
        // Wrap setTimeout to track
        wrapTimeout(fn, delay) {
            const id = setTimeout(() => {
                this.timeouts.delete(id);
                fn();
            }, delay);
            this.timeouts.add(id);
            return id;
        },
        
        // Wrap setInterval to track
        wrapInterval(fn, delay) {
            const id = setInterval(fn, delay);
            this.intervals.add(id);
            return id;
        },
        
        // Add observer to track
        addObserver(observer) {
            this.observers.add(observer);
        },
        
        // Cleanup all tracked resources
        cleanup() {
            this.timeouts.forEach(id => clearTimeout(id));
            this.intervals.forEach(id => clearInterval(id));
            this.observers.forEach(observer => {
                if (observer && typeof observer.disconnect === 'function') {
                    observer.disconnect();
                }
            });
            
            this.timeouts.clear();
            this.intervals.clear();
            this.observers.clear();
        }
    };
    
    // Performance monitoring
    const PerformanceTracker = {
        metrics: new Map(),
        
        startTimer(name) {
            this.metrics.set(name, performance.now());
        },
        
        endTimer(name) {
            const start = this.metrics.get(name);
            if (start) {
                const duration = performance.now() - start;
                console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
                return duration;
            }
        },
        
        measureFunction(fn, name) {
            return function(...args) {
                PerformanceTracker.startTimer(name);
                const result = fn.apply(this, args);
                PerformanceTracker.endTimer(name);
                return result;
            };
        }
    };
    
    // Main cleanup initialization
    function initializeCleanup() {
        // Optimize console logs
        ConsoleOptimizer.optimize();
        
        // Clean up DOM
        DOMCleanup.removeEmptyTextNodes();
        DOMCleanup.optimizeImages();
        
        // Setup cleanup on page unload
        window.addEventListener('beforeunload', () => {
            EventCleanup.cleanup();
            MemoryOptimizer.cleanup();
        });
        
        // Override global functions with optimized versions
        if (typeof window.setTimeout === 'function') {
            const originalSetTimeout = window.setTimeout;
            window.setTimeout = (fn, delay) => MemoryOptimizer.wrapTimeout(fn, delay);
        }
        
        if (typeof window.setInterval === 'function') {
            const originalSetInterval = window.setInterval;
            window.setInterval = (fn, delay) => MemoryOptimizer.wrapInterval(fn, delay);
        }
        
        console.log('🧹 Code Cleanup V2 initialized - Optimized for performance');
    }
    
    // Expose cleanup utilities
    window.CodeCleanup = {
        console: ConsoleOptimizer,
        events: EventCleanup,
        dom: DOMCleanup,
        functions: FunctionOptimizer,
        memory: MemoryOptimizer,
        performance: PerformanceTracker,
        
        // Utility methods
        memoize: FunctionOptimizer.memoize,
        debounce: FunctionOptimizer.debounce,
        throttle: FunctionOptimizer.throttle,
        
        // Cleanup everything
        cleanupAll() {
            EventCleanup.cleanup();
            MemoryOptimizer.cleanup();
            DOMCleanup.removeEmptyTextNodes();
        }
    };
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCleanup);
    } else {
        initializeCleanup();
    }
    
    console.log('⚡ Code Cleanup V2 loaded - Memory and performance optimizations active');
    
})();