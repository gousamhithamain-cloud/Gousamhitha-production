// Category Filter System - Make category navigation work with real database products
(function() {
    'use strict';
    
    console.log('🏷️ Loading category filter system...');
    
    // Category filtering functionality
    class CategoryFilterSystem {
        constructor() {
            this.currentCategory = null;
            this.currentSubcategory = null;
            this.allProducts = [];
            this.init();
        }
        
        init() {
            this.setupCategoryNavigation();
            this.handleURLParameters();
            this.setupPageTitle();
        }
        
        // Setup category navigation click handlers
        setupCategoryNavigation() {
            // Handle main category links only (no subcategories)
            document.querySelectorAll('.category-link, .category-filter-btn').forEach(link => {
                link.addEventListener('click', (e) => {
                    const category = this.extractCategoryFromURL(link.href);
                    if (category) {
                        // Navigate to shop with category param — reliable across all states
                        window.location.href = 'shop.html?category=' + encodeURIComponent(category);
                        e.preventDefault();
                    }
                    // If no category (e.g. "All Products"), let the href navigate normally
                });
            });
        }
        
        // Extract category from URL
        extractCategoryFromURL(url) {
            try {
                const urlObj = new URL(url);
                return urlObj.searchParams.get('category');
            } catch (e) {
                return null;
            }
        }
        
        // Handle URL parameters on page load
        handleURLParameters() {
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            
            if (category) {
                this.currentCategory = category;
                this.updateActiveStatesFromURL();
            }
        }
        
        // Filter products by category
        async filterByCategory(category) {
            console.log('🏷️ Filtering by category:', category);
            this.currentCategory = category;
            this.currentSubcategory = null;
            
            await this.loadAndDisplayProducts();
            this.updatePageHeader(category);
        }
        
        // Load and display filtered products
        async loadAndDisplayProducts() {
            const productGrid = document.querySelector('.product-grid');
            if (!productGrid) return;
            
            productGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Loading products...</div>';
            
            try {
                // Fetch all products via backend API
                const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/products`);
                const json = await res.json();
                const products = json.products || [];
                
                this.allProducts = products;
                console.log('📦 Total products loaded:', this.allProducts.length);
                
                // Filter products based on current selection
                let filteredProducts = this.allProducts;
                
                if (this.currentCategory) {
                    filteredProducts = filteredProducts.filter(product => 
                        product.category === this.currentCategory
                    );
                    console.log('🏷️ Products in category "' + this.currentCategory + '":', filteredProducts.length);
                }
                
                // Display filtered products
                this.displayProducts(filteredProducts);
                
            } catch (error) {
                console.error('❌ Error loading products:', error);
                this.displayError(error.message);
            }
        }
        
        // Display products in grid
        displayProducts(products) {
            const productGrid = document.querySelector('.product-grid');
            if (!productGrid) return;
            
            if (products.length === 0) {
                const categoryText = `"${this.currentCategory}"`;
                
                productGrid.innerHTML = `
                    <div class="empty-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">📦</div>
                        <div style="font-size: 1.2rem; color: #666; margin-bottom: 1rem;">
                            No products found in ${categoryText} category
                        </div>
                        <div style="font-size: 1rem; color: #999; margin-bottom: 2rem;">
                            Try browsing other categories or check back later
                        </div>
                        <button onclick="window.location.href='shop.html'" 
                                style="padding: 0.7rem 1.5rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            View All Products
                        </button>
                    </div>
                `;
                return;
            }
            
            // Render products using the same template as product-display.js
            productGrid.innerHTML = products.map(product => {
                const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
                const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
                const isAvailable = product.stock > 0;
                const unitDisplay = product.display_unit || (product.unit_quantity ? product.unit_quantity + product.unit : product.unit || '');

                return `
                    <div class="product-card">
                        <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" loading="lazy">
                        <h3 style="margin: 0.8rem 0 0.3rem 0; font-size: 1.1rem; color: #333;">${product.name}</h3>
                        ${unitDisplay ? `<p style="color: #666; font-size: 0.85rem; margin: 0.2rem 0; font-weight: 500;">${unitDisplay}</p>` : ''}
                        <p class="price" style="font-size: 1.3rem; font-weight: 700; color: #4a7c59; margin: 0.5rem 0;">₹${product.price}</p>
                        ${!isAvailable ? 
                            `<div style="margin: 0.5rem 0; padding: 0.5rem; background: #ffebee; border-radius: 8px; border: 1px solid #ef5350;">
                                <p style="color: #d32f2f; font-weight: 700; font-size: 0.95rem; margin: 0; text-align: center;">OUT OF STOCK</p>
                            </div>` : 
                            `<div class="stock-status" style="margin: 0.5rem 0;">
                                <span class="status-badge ${stockClass}" style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; display: inline-block; background: #e8f5e9; color: #2e7d32;">
                                    ${stockStatus} (${product.stock} left)
                                </span>
                            </div>`
                        }
                        ${isAvailable ? 
                            `<div class="quantity-selector" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 1rem 0;">
                                <button onclick="decreaseQuantity('${product.id}')" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">-</button>
                                <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" style="width: 60px; height: 35px; text-align: center; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;" readonly>
                                <button onclick="increaseQuantity('${product.id}', ${product.stock})" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">+</button>
                            </div>
                            <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, ${product.stock})" class="btn btn-primary" style="display: block; width: 100%; text-align: center; margin: 0.5rem 0; padding: 0.7rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Add to Cart</button>` :
                            `<button class="btn btn-secondary" style="display: block; width: 100%; text-align: center; margin: 1rem 0; padding: 0.7rem; opacity: 0.5; cursor: not-allowed; background: #ccc; color: #666; border: none; border-radius: 8px;" disabled>Out of Stock</button>`
                        }
                    </div>
                `;
            }).join('');
            
            console.log('✅ Displayed', products.length, 'products');
        }
        
        // Display error message
        displayError(message) {
            const productGrid = document.querySelector('.product-grid');
            if (!productGrid) return;
            
            productGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #d32f2f; grid-column: 1/-1;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Error loading products</div>
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 1rem;">${message}</div>
                    <button onclick="location.reload()" style="padding: 0.7rem 1.5rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Retry</button>
                </div>
            `;
        }
        
        // Update URL without page reload
        updateURL(category) {
            const url = new URL(window.location);
            url.searchParams.set('category', category);
            url.searchParams.delete('subcategory'); // Remove subcategory since we don't use it
            
            window.history.pushState({}, '', url);
        }
        
        // Update active states for navigation
        updateActiveStates(activeLink) {
            // Remove active class from all category links
            document.querySelectorAll('.category-link, .category-filter-btn').forEach(link => {
                link.classList.remove('active');
                link.style.background = '';
                link.style.color = '';
            });
            
            // Add active class to clicked link
            if (activeLink) {
                activeLink.classList.add('active');
                activeLink.style.background = '#4a7c59';
                activeLink.style.color = 'white';
            }
        }
        
        // Update active states from URL parameters
        updateActiveStatesFromURL() {
            const category = this.currentCategory;
            
            if (category) {
                // Find and activate category link
                const categoryLink = document.querySelector(`[href*="category=${encodeURIComponent(category)}"]`);
                if (categoryLink) {
                    this.updateActiveStates(categoryLink);
                }
            }
        }
        
        // Update page header based on selection
        updatePageHeader(category) {
            const pageHeader = document.querySelector('.page-header h1');
            if (pageHeader) {
                pageHeader.textContent = category;
            }
        }
        
        // Setup page title updates
        setupPageTitle() {
            const originalTitle = document.title;
            
            // Update title based on current selection
            if (this.currentCategory) {
                document.title = `${this.currentCategory} - Gousamhitha`;
            }
        }
        
        // Get all available categories from database
        async getAvailableCategories() {
            try {
                const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/products`);
                const json = await res.json();
                const products = json.products || [];
                
                const categories = {};
                products.forEach(product => {
                    if (!categories[product.category]) {
                        categories[product.category] = new Set();
                    }
                    if (product.subcategory) {
                        categories[product.category].add(product.subcategory);
                    }
                });
                
                // Convert Sets to Arrays
                Object.keys(categories).forEach(category => {
                    categories[category] = Array.from(categories[category]);
                });
                
                return categories;
            } catch (error) {
                console.error('Error getting categories:', error);
                return {};
            }
        }
    }
    
    // Initialize category filter system
    let categoryFilterSystem;
    
    function initializeCategorySystem() {
        if (categoryFilterSystem) return;
        
        console.log('🏷️ Initializing category filter system...');
        categoryFilterSystem = new CategoryFilterSystem();
        
        // Load products if on shop page
        if (window.location.pathname.includes('shop.html')) {
            categoryFilterSystem.loadAndDisplayProducts();
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCategorySystem);
    } else {
        initializeCategorySystem();
    }
    
    // Initialize when Supabase is ready
    window.addEventListener('supabaseReady', initializeCategorySystem);
    
    // Fallback initialization
    setTimeout(initializeCategorySystem, 2000);
    
    // Make system available globally
    window.categoryFilterSystem = categoryFilterSystem;
    
    console.log('✅ Category filter system loaded');
})();