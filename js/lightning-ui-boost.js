// LIGHTNING UI BOOST - Ultra fast UI updates and interactions
(function() {
    'use strict';
    
    // VIRTUAL DOM FOR LIGHTNING UPDATES
    const VirtualDOM = {
        cache: new Map(),
        
        // Create virtual element
        createElement: function(tag, props = {}, children = []) {
            return {
                tag,
                props,
                children: Array.isArray(children) ? children : [children],
                key: props.key || null
            };
        },
        
        // Render virtual element to real DOM
        render: function(vnode, container) {
            if (typeof vnode === 'string' || typeof vnode === 'number') {
                return document.createTextNode(vnode);
            }
            
            const element = document.createElement(vnode.tag);
            
            // Set properties
            Object.entries(vnode.props).forEach(([key, value]) => {
                if (key === 'onClick') {
                    element.addEventListener('click', value);
                } else if (key.startsWith('on')) {
                    element.addEventListener(key.slice(2).toLowerCase(), value);
                } else if (key === 'className') {
                    element.className = value;
                } else if (key !== 'key') {
                    element.setAttribute(key, value);
                }
            });
            
            // Render children
            vnode.children.forEach(child => {
                if (child) {
                    element.appendChild(this.render(child, element));
                }
            });
            
            return element;
        },
        
        // Update DOM with minimal changes
        update: function(container, newVNode, oldVNode = null) {
            const newElement = this.render(newVNode);
            if (container.firstChild) {
                container.replaceChild(newElement, container.firstChild);
            } else {
                container.appendChild(newElement);
            }
        }
    };
    
    // LIGHTNING FAST PRODUCT CARD RENDERING
    window.renderProductCardLightning = function(product) {
        const isAvailable = product.stock > 0;
        const unitDisplay = product.display_unit || (product.unit_quantity ? product.unit_quantity + product.unit : product.unit || '');
        
        return VirtualDOM.createElement('div', { className: 'product-card' }, [
            VirtualDOM.createElement('img', {
                src: product.image_url || 'images/placeholder.png',
                alt: product.name,
                loading: 'lazy'
            }),
            VirtualDOM.createElement('h3', {}, product.name),
            unitDisplay ? VirtualDOM.createElement('p', {}, unitDisplay) : null,
            VirtualDOM.createElement('p', { className: 'price' }, `₹${product.price}`),
            isAvailable ? 
                VirtualDOM.createElement('div', {}, [
                    VirtualDOM.createElement('div', { className: 'stock-status' }, [
                        VirtualDOM.createElement('span', { className: 'status-badge in-stock' }, 
                            `In Stock (${product.stock} left)`)
                    ]),
                    VirtualDOM.createElement('div', { className: 'quantity-selector' }, [
                        VirtualDOM.createElement('button', {
                            onClick: () => window.decreaseQuantity(product.id),
                            className: 'quantity-btn'
                        }, '-'),
                        VirtualDOM.createElement('input', {
                            type: 'number',
                            id: `qty-${product.id}`,
                            value: '1',
                            min: '1',
                            max: product.stock.toString(),
                            readonly: true
                        }),
                        VirtualDOM.createElement('button', {
                            onClick: () => window.increaseQuantity(product.id, product.stock),
                            className: 'quantity-btn'
                        }, '+')
                    ]),
                    VirtualDOM.createElement('button', {
                        onClick: () => window.addToCartUltraFast(product.id, product.name, product.price, product.stock),
                        className: 'btn btn-primary'
                    }, 'Add to Cart')
                ]) :
                VirtualDOM.createElement('div', {}, [
                    VirtualDOM.createElement('div', { 
                        style: 'background: #ffebee; padding: 0.5rem; border-radius: 8px;' 
                    }, [
                        VirtualDOM.createElement('p', { 
                            style: 'color: #d32f2f; font-weight: 700; margin: 0;' 
                        }, 'OUT OF STOCK')
                    ]),
                    VirtualDOM.createElement('button', {
                        className: 'btn btn-secondary',
                        disabled: true
                    }, 'Out of Stock')
                ])
        ]);
    };
    
    // LIGHTNING FAST GRID RENDERING
    window.renderProductGridLightning = function(products, container) {
        const startTime = performance.now();
        
        // Use document fragment for batch DOM updates
        const fragment = document.createDocumentFragment();
        
        products.forEach(product => {
            const productElement = VirtualDOM.render(window.renderProductCardLightning(product));
            fragment.appendChild(productElement);
        });
        
        // Single DOM update
        container.innerHTML = '';
        container.appendChild(fragment);
        
        const endTime = performance.now();
        console.log(`⚡ LIGHTNING RENDER: ${products.length} products in ${(endTime - startTime).toFixed(2)}ms`);
    };
    
    // INSTANT UI STATE MANAGEMENT
    const UIState = {
        state: {},
        listeners: new Map(),
        
        setState: function(key, value) {
            const oldValue = this.state[key];
            this.state[key] = value;
            
            // Notify listeners instantly
            if (this.listeners.has(key)) {
                this.listeners.get(key).forEach(callback => {
                    callback(value, oldValue);
                });
            }
        },
        
        getState: function(key) {
            return this.state[key];
        },
        
        subscribe: function(key, callback) {
            if (!this.listeners.has(key)) {
                this.listeners.set(key, []);
            }
            this.listeners.get(key).push(callback);
        }
    };
    
    // LIGHTNING FAST ANIMATIONS
    const LightningAnimations = {
        // Ultra fast fade in
        fadeIn: function(element, duration = 200) {
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease`;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
        },
        
        // Ultra fast slide in
        slideIn: function(element, direction = 'up', duration = 200) {
            const transforms = {
                up: 'translateY(20px)',
                down: 'translateY(-20px)',
                left: 'translateX(20px)',
                right: 'translateX(-20px)'
            };
            
            element.style.transform = transforms[direction];
            element.style.transition = `transform ${duration}ms ease`;
            
            requestAnimationFrame(() => {
                element.style.transform = 'translate(0)';
            });
        },
        
        // Ultra fast pulse
        pulse: function(element, duration = 100) {
            element.style.transition = `transform ${duration}ms ease`;
            element.style.transform = 'scale(1.05)';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, duration);
        }
    };
    
    // INSTANT EVENT DELEGATION
    const EventDelegator = {
        handlers: new Map(),
        
        on: function(selector, event, handler) {
            const key = `${selector}_${event}`;
            if (!this.handlers.has(key)) {
                this.handlers.set(key, []);
                
                // Add single delegated listener with error handling
                document.addEventListener(event, (e) => {
                    try {
                        // Fix for browsers that don't support matches
                        const matches = e.target.matches || e.target.msMatchesSelector || e.target.webkitMatchesSelector;
                        
                        if (matches && matches.call(e.target, selector)) {
                            this.handlers.get(key).forEach(h => h(e));
                        }
                    } catch (error) {
                        console.warn('Event delegation error:', error);
                    }
                });
            }
            
            this.handlers.get(key).push(handler);
        }
    };
    
    // LIGHTNING FAST FORM HANDLING
    window.handleFormLightning = function(formElement, onSubmit) {
        const formData = new FormData(formElement);
        const data = Object.fromEntries(formData.entries());
        
        // Instant validation
        const errors = window.validateFormUltraFast ? window.validateFormUltraFast(data) : [];
        
        if (errors.length === 0) {
            onSubmit(data);
        } else {
            // Show errors instantly
            errors.forEach(error => {
                if (typeof showToast === 'function') {
                    showToast(error, 'error');
                }
            });
        }
    };
    
    // INSTANT SEARCH UI
    window.setupInstantSearch = function(inputElement, resultsContainer, searchFunction) {
        let searchTimeout;
        
        inputElement.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query.length > 0) {
                    const results = searchFunction(query);
                    window.renderProductGridLightning(results, resultsContainer);
                } else {
                    resultsContainer.innerHTML = '';
                }
            }, 100); // Ultra fast 100ms debounce
        });
    };
    
    // PERFORMANCE MONITORING
    const PerformanceMonitor = {
        metrics: {},
        
        start: function(name) {
            this.metrics[name] = performance.now();
        },
        
        end: function(name) {
            if (this.metrics[name]) {
                const duration = performance.now() - this.metrics[name];
                console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
                delete this.metrics[name];
                return duration;
            }
        }
    };
    
    // INITIALIZE LIGHTNING UI BOOST
    function initLightningUIBoost() {
        console.log('⚡ LIGHTNING UI BOOST ACTIVATED');
        
        // Setup instant event delegation
        EventDelegator.on('.quantity-btn', 'click', (e) => {
            if (LightningAnimations && LightningAnimations.pulse) {
                LightningAnimations.pulse(e.target);
            }
        });
        
        EventDelegator.on('.btn', 'click', (e) => {
            if (LightningAnimations && LightningAnimations.pulse) {
                LightningAnimations.pulse(e.target);
            }
        });
        
        EventDelegator.on('.product-card', 'mouseenter', (e) => {
            if (LightningAnimations && LightningAnimations.slideIn) {
                LightningAnimations.slideIn(e.target, 'up', 150);
            }
        });
        
        // Setup UI state management
        UIState.subscribe('cartCount', (count) => {
            const cartElements = document.querySelectorAll('.cart-count, #bottom-nav-cart-count');
            cartElements.forEach(el => {
                el.textContent = count;
                if (count > 0) {
                    el.classList.remove('hidden');
                    LightningAnimations.pulse(el);
                }
            });
        });
        
        // Expose globals
        window.VirtualDOM = VirtualDOM;
        window.UIState = UIState;
        window.LightningAnimations = LightningAnimations;
        window.PerformanceMonitor = PerformanceMonitor;
    }
    
    // Start immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLightningUIBoost);
    } else {
        initLightningUIBoost();
    }
    
})();