// Shop Page Search Integration
class ShopSearchIntegration {
    constructor() {
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.handleSearchResults();
            this.handleProductHighlight();
        });
        
        if (document.readyState !== 'loading') {
            this.handleSearchResults();
            this.handleProductHighlight();
        }
    }
    
    handleSearchResults() {
        // Check if we have search results to display
        const searchResults = sessionStorage.getItem('searchResults');
        const searchTerm = sessionStorage.getItem('searchTerm');
        
        if (searchResults && searchTerm) {
            const products = JSON.parse(searchResults);
            this.displaySearchResults(products, searchTerm);
            
            // Clear the session storage after displaying
            sessionStorage.removeItem('searchResults');
            sessionStorage.removeItem('searchTerm');
        }
    }
    
    handleProductHighlight() {
        // Check if we need to highlight a specific product
        const productId = sessionStorage.getItem('selectedProductId');
        
        if (productId) {
            setTimeout(() => {
                const productCard = document.querySelector(`[data-product-id="${productId}"]`);
                if (productCard) {
                    productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    productCard.style.animation = 'highlight 2s ease-in-out';
                    
                    // Clear the session storage
                    sessionStorage.removeItem('selectedProductId');
                }
            }, 500);
        }
    }
    
    displaySearchResults(products, searchTerm) {
        const productGrid = document.querySelector('.product-grid');
        const pageTitle = document.querySelector('.page-header h1');
        
        if (pageTitle) {
            pageTitle.innerHTML = `Search Results for "<span style="color: #4a7c59;">${this.escapeHtml(searchTerm)}</span>"`;
        }
        
        if (!productGrid) return;
        
        if (products.length === 0) {
            this.showNoResults(productGrid, searchTerm);
            return;
        }
        
        // Add results count
        this.addResultsCount(productGrid, products.length, searchTerm);
        
        // Render products
        this.renderProducts(productGrid, products);
    }
    
    showNoResults(productGrid, searchTerm) {
        productGrid.innerHTML = `
            <div class="no-search-results">
                <div class="no-results-icon">🔍</div>
                <h3>No products found for "${this.escapeHtml(searchTerm)}"</h3>
                <p>Try searching with different keywords or browse our categories below.</p>
                <div class="search-suggestions">
                    <h4>Popular searches:</h4>
                    <div class="suggestion-tags">
                        <span class="suggestion-tag" onclick="this.performNewSearch('paneer')">Paneer</span>
                        <span class="suggestion-tag" onclick="this.performNewSearch('milk')">Milk</span>
                        <span class="suggestion-tag" onclick="this.performNewSearch('organic')">Organic</span>
                        <span class="suggestion-tag" onclick="this.performNewSearch('fresh')">Fresh</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="window.location.reload()">
                    Browse All Products
                </button>
            </div>
        `;
    }
    
    addResultsCount(productGrid, count, searchTerm) {
        const resultsCount = document.createElement('div');
        resultsCount.className = 'search-results-count';
        resultsCount.innerHTML = `
            <span class="results-text">Found ${count} product${count !== 1 ? 's' : ''} for "${this.escapeHtml(searchTerm)}"</span>
            <button class="clear-search-btn" onclick="window.location.reload()">Clear Search</button>
        `;
        
        const container = productGrid.parentNode;
        const existingCount = container.querySelector('.search-results-count');
        if (existingCount) {
            existingCount.remove();
        }
        container.insertBefore(resultsCount, productGrid);
    }
    
    renderProducts(productGrid, products) {
        productGrid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image_url || 'images/placeholder.jpg'}" 
                         alt="${this.escapeHtml(product.name)}" 
                         onerror="this.src='images/placeholder.jpg'"
                         loading="lazy">
                    ${!product.in_stock ? '<div class="out-of-stock-badge">Out of Stock</div>' : ''}
                    ${product.discount ? `<div class="discount-badge">${product.discount}% OFF</div>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${this.escapeHtml(product.name)}</h3>
                    <p class="product-category">${this.escapeHtml(product.category || 'Product')}</p>
                    <div class="product-pricing">
                        <p class="product-price">₹${product.price}</p>
                        ${product.original_price && product.original_price > product.price ? 
                            `<p class="original-price">₹${product.original_price}</p>` : ''}
                    </div>
                    <button class="btn btn-primary add-to-cart-btn" 
                            onclick="addToCart(${product.id})"
                            ${!product.in_stock ? 'disabled' : ''}>
                        ${product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    performNewSearch(term) {
        if (window.realProductSearch) {
            window.realProductSearch.performSearch(term);
        } else {
            // Fallback: update search input and reload
            const searchInputs = document.querySelectorAll('.main-search-bar');
            searchInputs.forEach(input => input.value = term);
            window.location.reload();
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize shop search integration
window.shopSearchIntegration = new ShopSearchIntegration();