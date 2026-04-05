// PERFORMANCE MASTER V2 - Coordinates all optimizations without UI changes
(function() {
    'use strict';
    
    // Performance monitoring
    const PerformanceMonitor = {
        startTime: performance.now(),
        metrics: {},
        
        mark(name) {
            this.metrics[name] = performance.now() - this.startTime;
        },
        
        measure(name, startMark, endMark) {
            const start = this.metrics[startMark] || 0;
            const end = this.metrics[endMark] || performance.now() - this.startTime;
            this.metrics[name] = end - start;
        },
        
        getMetrics() {
            return { ...this.metrics };
        },
        
        log() {
            console.log('🚀 Performance Metrics:', this.getMetrics());
        }
    };
    
    // Resource preloader for critical assets
    const ResourcePreloader = {
        preloadedImages: new Set(),
        
        preloadImage(src) {
            if (this.preloadedImages.has(src)) return;
            
            const img = new Image();
            img.src = src;
            this.preloadedImages.add(src);
        },
        
        preloadCriticalImages() {
            // Preload placeholder and common images
            this.preloadImage('images/placeholder.png');
            this.preloadImage('images/logo.png');
        }
    };
    
    // Memory management
    const MemoryManager = {
        observers: [],
        timers: [],
        
        addObserver(observer) {
            this.observers.push(observer);
        },
        
        addTimer(timer) {
            this.timers.push(timer);
        },
        
        cleanup() {
            // Disconnect all observers
            this.observers.forEach(observer => {
                if (observer && typeof observer.disconnect === 'function') {
                    observer.disconnect();
                }
            });
            
            // Clear all timers
            this.timers.forEach(timer => {
                clearTimeout(timer);
                clearInterval(timer);
            });
            
            this.observers = [];
            this.timers = [];
        }
    };
    
    // Lazy loading optimization
    const LazyLoader = {
        imageObserver: null,
        
        init() {
            if ('IntersectionObserver' in window) {
                this.imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                                this.imageObserver.unobserve(img);
                            }
                        }
                    });
                }, {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                });
                
                MemoryManager.addObserver(this.imageObserver);
            }
        },
        
        observeImages() {
            if (this.imageObserver) {
                document.querySelectorAll('img[data-src]').forEach(img => {
                    this.imageObserver.observe(img);
                });
            }
        }
    };
    
    // Script loader with dependency management
    const ScriptLoader = {
        loaded: new Set(),
        loading: new Set(),
        
        async load(src, dependencies = []) {
            if (this.loaded.has(src)) return true;
            if (this.loading.has(src)) {
                // Wait for loading to complete
                return new Promise(resolve => {
                    const checkLoaded = () => {
                        if (this.loaded.has(src)) {
                            resolve(true);
                        } else {
                            setTimeout(checkLoaded, 50);
                        }
                    };
                    checkLoaded();
                });
            }
            
            // Load dependencies first
            for (const dep of dependencies) {
                await this.load(dep);
            }
            
            this.loading.add(src);
            
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                
                script.onload = () => {
                    this.loaded.add(src);
                    this.loading.delete(src);
                    resolve(true);
                };
                
                script.onerror = () => {
                    this.loading.delete(src);
                    reject(new Error(`Failed to load script: ${src}`));
                };
                
                document.head.appendChild(script);
            });
        }
    };
    
    // Performance optimization coordinator
    const OptimizationCoordinator = {
        optimizations: [],
        
        register(name, initFn, dependencies = []) {
            this.optimizations.push({ name, initFn, dependencies });
        },
        
        async initialize() {
            PerformanceMonitor.mark('optimization_start');
            
            // Sort optimizations by dependencies
            const sorted = this.topologicalSort();
            
            for (const optimization of sorted) {
                try {
                    PerformanceMonitor.mark(`${optimization.name}_start`);
                    await optimization.initFn();
                    PerformanceMonitor.mark(`${optimization.name}_end`);
                    PerformanceMonitor.measure(
                        `${optimization.name}_duration`,
                        `${optimization.name}_start`,
                        `${optimization.name}_end`
                    );
                } catch (error) {
                    console.error(`Failed to initialize ${optimization.name}:`, error);
                }
            }
            
            PerformanceMonitor.mark('optimization_end');
            PerformanceMonitor.measure('total_optimization', 'optimization_start', 'optimization_end');
        },
        
        topologicalSort() {
            // Simple dependency resolution
            const resolved = [];
            const remaining = [...this.optimizations];
            
            while (remaining.length > 0) {
                const canResolve = remaining.filter(opt => 
                    opt.dependencies.every(dep => 
                        resolved.some(r => r.name === dep)
                    )
                );
                
                if (canResolve.length === 0) {
                    // Add remaining without dependencies
                    resolved.push(...remaining);
                    break;
                }
                
                resolved.push(...canResolve);
                canResolve.forEach(opt => {
                    const index = remaining.indexOf(opt);
                    remaining.splice(index, 1);
                });
            }
            
            return resolved;
        }
    };
    
    // Register core optimizations
    OptimizationCoordinator.register('preloader', async () => {
        ResourcePreloader.preloadCriticalImages();
    });
    
    OptimizationCoordinator.register('lazy-loader', async () => {
        LazyLoader.init();
    });
    
    OptimizationCoordinator.register('performance-optimizer', async () => {
        if (!window.PerformanceOptimizer) {
            await ScriptLoader.load('js/performance-optimizer-v2.js');
        }
    });
    
    OptimizationCoordinator.register('product-optimizer', async () => {
        if (!window.ProductOptimizer) {
            await ScriptLoader.load('js/product-display-optimized-v2.js');
        }
    }, ['performance-optimizer']);
    
    OptimizationCoordinator.register('search-optimizer', async () => {
        if (!window.SearchOptimizer) {
            await ScriptLoader.load('js/search-optimized-v2.js');
        }
    }, ['product-optimizer']);
    
    // DISABLED: cart-optimizer conflicts with clean-cart-system.js
    // OptimizationCoordinator.register('cart-optimizer', async () => {
    //     if (!window.CartOptimizer) {
    //         await ScriptLoader.load('js/cart-optimized-v2.js');
    //     }
    // }, ['performance-optimizer']);
    
    // Main initialization function
    async function initializePerformanceSystem() {
        try {
            // Set global flag to prevent original scripts from running
            window.optimizationsLoaded = true;
            
            // Initialize all optimizations
            await OptimizationCoordinator.initialize();
            
            // Setup lazy loading observer
            LazyLoader.observeImages();
            
            // Setup cleanup on page unload
            window.addEventListener('beforeunload', () => {
                MemoryManager.cleanup();
            });
            
            // Log performance metrics
            PerformanceMonitor.log();
            
            console.log('🚀 Performance Master V2 initialized - All optimizations active');
            
        } catch (error) {
            console.error('Failed to initialize performance system:', error);
        }
    }
    
    // Expose performance system
    window.PerformanceMaster = {
        monitor: PerformanceMonitor,
        preloader: ResourcePreloader,
        memory: MemoryManager,
        lazyLoader: LazyLoader,
        scriptLoader: ScriptLoader,
        coordinator: OptimizationCoordinator,
        
        // Utility functions
        async loadOptimization(name, src, dependencies = []) {
            OptimizationCoordinator.register(name, async () => {
                await ScriptLoader.load(src);
            }, dependencies);
        },
        
        getMetrics() {
            return PerformanceMonitor.getMetrics();
        }
    };
    
    // Auto-initialize based on page state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePerformanceSystem);
    } else {
        // Use setTimeout to ensure all other scripts have loaded
        setTimeout(initializePerformanceSystem, 0);
    }
    
    console.log('⚡ Performance Master V2 loaded - Coordinating all optimizations');
    
})();