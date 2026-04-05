// Enhanced Search Engine with Local Product Database
class SearchEngine {
    constructor() {
        this.products = [
            // Dairy Products
            { id: 1, name: "Fresh Paneer", category: "Dairy", subcategory: "Cheese", description: "Fresh homemade paneer", price: 120, image: "images/paneer.jpg" },
            { id: 2, name: "Paneer Tikka", category: "Dairy", subcategory: "Ready to Cook", description: "Marinated paneer cubes", price: 180, image: "images/paneer-tikka.jpg" },
            { id: 3, name: "Cottage Cheese", category: "Dairy", subcategory: "Cheese", description: "Soft cottage cheese", price: 100, image: "images/cottage-cheese.jpg" },
            { id: 4, name: "Fresh Milk", category: "Dairy", subcategory: "Milk", description: "Pure cow milk", price: 60, image: "images/milk.jpg" },
            { id: 5, name: "Greek Yogurt", category: "Dairy", subcategory: "Yogurt", description: "Thick Greek style yogurt", price: 80, image: "images/yogurt.jpg" },
            
            // Fruits & Vegetables
            { id: 6, name: "Organic Apples", category: "Fruits & Vegetables", subcategory: "Fruits", description: "Fresh organic apples", price: 150, image: "images/apples.jpg" },
            { id: 7, name: "Fresh Spinach", category: "Fruits & Vegetables", subcategory: "Leafy Greens", description: "Organic spinach leaves", price: 40, image: "images/spinach.jpg" },
            { id: 8, name: "Tomatoes", category: "Fruits & Vegetables", subcategory: "Vegetables", description: "Fresh red tomatoes", price: 50, image: "images/tomatoes.jpg" },
            { id: 9, name: "Bananas", category: "Fruits & Vegetables", subcategory: "Fruits", description: "Ripe yellow bananas", price: 60, image: "images/bananas.jpg" },
            { id: 10, name: "Carrots", category: "Fruits & Vegetables", subcategory: "Root Vegetables", description: "Fresh orange carrots", price: 45, image: "images/carrots.jpg" },
            
            // Daily Staples
            { id: 11, name: "Basmati Rice", category: "Daily Staples", subcategory: "Rice", description: "Premium basmati rice", price: 200, image: "images/rice.jpg" },
            { id: 12, name: "Wheat Flour", category: "Daily Staples", subcategory: "Flour", description: "Whole wheat flour", price: 80, image: "images/flour.jpg" },
            { id: 13, name: "Turmeric Powder", category: "Daily Staples", subcategory: "Spices", description: "Pure turmeric powder", price: 120, image: "images/turmeric.jpg" },
            { id: 14, name: "Cooking Oil", category: "Daily Staples", subcategory: "Oil", description: "Sunflower cooking oil", price: 180, image: "images/oil.jpg" },
            { id: 15, name: "Red Lentils", category: "Daily Staples", subcategory: "Pulses", description: "Organic red lentils", price: 140, image: "images/lentils.jpg" },
            
            // Snacks & More
            { id: 16, name: "Mixed Nuts", category: "Snacks & More", subcategory: "Dry Fruits", description: "Premium mixed nuts", price: 300, image: "images/nuts.jpg" },
            { id: 17, name: "Organic Honey", category: "Snacks & More", subcategory: "Natural Sweeteners", description: "Pure organic honey", price: 250, image: "images/honey.jpg" },
            { id: 18, name: "Millet Cookies", category: "Snacks & More", subcategory: "Healthy Snacks", description: "Nutritious millet cookies", price: 120, image: "images/cookies.jpg" },
            
            // Bakery & Dairy
            { id: 19, name: "Whole Wheat Bread", category: "Bakery & Dairy", subcategory: "Bread", description: "Fresh whole wheat bread", price: 45, image: "images/bread.jpg" },
            { id: 20, name: "Butter", category: "Bakery & Dairy", subcategory: "Dairy", description: "Fresh white butter", price: 90, image: "images/butter.jpg" },
            
            // Home Food
            { id: 21, name: "Homemade Pickles", category: "Home Food", subcategory: "Preserves", description: "Traditional mango pickle", price: 150, image: "images/pickle.jpg" },
            { id: 22, name: "Ghee", category: "Home Food", subcategory: "Dairy", description: "Pure cow ghee", price: 400, image: "images/ghee.jpg" },
            
            // Special Categories
            { id: 23, name: "Organic Combo Pack", category: "Special Categories", subcategory: "Combo", description: "Mixed organic vegetables", price: 350, image: "images/combo.jpg" },
            { id: 24, name: "Health Mix Powder", category: "Special Categories", subcategory: "Health", description: "Nutritious health mix", price: 200, image: "images/health-mix.jpg" }
        ];
        
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        this.initializeSearch();
    }
    
    initializeSearch() {
        // Initialize search on all pages
        document.addEventListener('DOMContentLoaded', () => {
            this.setupSearchFunctionality();
        });
        
        // If DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupSearchFunctionality();
            });
        } else {
            this.setupSearchFunctionality();
        }
    }
    
    setupSearchFunctionality() {
        const searchInputs = document.querySelectorAll('.main-search-bar');
        const searchButtons = document.querySelectorAll('.search-btn');
        
        searchInputs.forEach((searchInput, index) => {
            const searchBtn = searchButtons[index];
            if (!searchInput || !searchBtn) return;
            
            this.setupAutocomplete(searchInput);
            this.setupSearchButton(searchBtn, searchInput);
        });
    }
    
    setupAutocomplete(searchInput) {
        // Remove existing autocomplete container
        const existingContainer = searchInput.parentNode.querySelector('.autocomplete-container');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        const autocompleteContainer = document.createElement('div');
        autocompleteContainer.className = 'autocomplete-container';
        autocompleteContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        const searchSection = searchInput.closest('.search-section');
        if (searchSection) {
            searchSection.style.position = 'relative';
            searchSection.appendChild(autocompleteContainer);
        }
        
        let debounceTimer;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(debounceTimer);
            
            if (query.length < 1) {
                autocompleteContainer.style.display = 'none';
                return;
            }
            
            debounceTimer = setTimeout(() => {
                this.showAutocomplete(query, autocompleteContainer, searchInput);
            }, 200);
        });
        
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                autocompleteContainer.style.display = 'none';
            }, 200);
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                autocompleteContainer.style.display = 'none';
                this.performSearch(searchInput.value.trim());
            } else if (e.key === 'Escape') {
                autocompleteContainer.style.display = 'none';
                searchInput.blur();
            }
        });
    }
    
    setupSearchButton(searchBtn, searchInput) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.performSearch(searchInput.value.trim());
        });
    }
    
    showAutocomplete(query, container, searchInput) {
        const suggestions = this.getSuggestions(query);
        
        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.innerHTML = suggestions.map(suggestion => `
            <div class="autocomplete-item" style="
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                transition: all 0.2s ease;
                font-size: 14px;
                color: #333;
                display: flex;
                align-items: center;
                gap: 12px;
            " onmouseover="this.style.backgroundColor='#f8f9fa'" 
               onmouseout="this.style.backgroundColor='white'"
               onclick="window.searchEngine.selectSuggestion('${suggestion.name.replace(/'/g, "\\'")}', '${searchInput.id || 'main-search'}')">
                <div style="
                    width: 40px;
                    height: 40px;
                    background: #f0f0f0;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                ">📦</div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; margin-bottom: 2px;">${this.highlightMatch(suggestion.name, query)}</div>
                    <div style="font-size: 12px; color: #666;">${suggestion.category} • ₹${suggestion.price}</div>
                </div>
            </div>
        `).join('');
        
        // Add "View all results" option
        if (suggestions.length >= 5) {
            container.innerHTML += `
                <div class="autocomplete-item" style="
                    padding: 12px 16px;
                    cursor: pointer;
                    background: #f8f9fa;
                    font-weight: 500;
                    color: #4a7c59;
                    text-align: center;
                    border-top: 1px solid #e0e0e0;
                " onclick="window.searchEngine.performSearch('${query}')">
                    View all results for "${query}"
                </div>
            `;
        }
        
        container.style.display = 'block';
    }
    
    getSuggestions(query) {
        const normalizedQuery = query.toLowerCase();
        
        // Search in name, category, subcategory, and description
        const matches = this.products.filter(product => {
            return (
                product.name.toLowerCase().includes(normalizedQuery) ||
                product.category.toLowerCase().includes(normalizedQuery) ||
                product.subcategory.toLowerCase().includes(normalizedQuery) ||
                product.description.toLowerCase().includes(normalizedQuery)
            );
        });
        
        // Sort by relevance (exact matches first, then partial matches)
        return matches.sort((a, b) => {
            const aNameMatch = a.name.toLowerCase().startsWith(normalizedQuery);
            const bNameMatch = b.name.toLowerCase().startsWith(normalizedQuery);
            
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            
            return a.name.localeCompare(b.name);
        }).slice(0, 8);
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong style="background: #fff3cd;">$1</strong>');
    }
    
    selectSuggestion(suggestion, inputId) {
        const searchInputs = document.querySelectorAll('.main-search-bar');
        searchInputs.forEach(input => {
            input.value = suggestion;
        });
        
        const autocompleteContainers = document.querySelectorAll('.autocomplete-container');
        autocompleteContainers.forEach(container => {
            container.style.display = 'none';
        });
        
        this.performSearch(suggestion);
    }
    
    performSearch(searchTerm) {
        if (!searchTerm) {
            this.showToast('Please enter a search term', 'error');
            return;
        }
        
        // Add to search history
        this.addToSearchHistory(searchTerm);
        
        // Get search results
        const results = this.searchProducts(searchTerm);
        
        // Store results and navigate to shop page
        sessionStorage.setItem('searchResults', JSON.stringify(results));
        sessionStorage.setItem('searchTerm', searchTerm);
        
        // Navigate to shop page if not already there
        if (!window.location.pathname.includes('shop.html')) {
            window.location.href = 'shop.html';
        } else {
            // If already on shop page, display results immediately
            this.displaySearchResults();
        }
    }
    
    searchProducts(query) {
        const normalizedQuery = query.toLowerCase();
        
        return this.products.filter(product => {
            return (
                product.name.toLowerCase().includes(normalizedQuery) ||
                product.category.toLowerCase().includes(normalizedQuery) ||
                product.subcategory.toLowerCase().includes(normalizedQuery) ||
                product.description.toLowerCase().includes(normalizedQuery)
            );
        }).sort((a, b) => {
            // Prioritize exact name matches
            const aNameMatch = a.name.toLowerCase().includes(normalizedQuery);
            const bNameMatch = b.name.toLowerCase().includes(normalizedQuery);
            
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            
            return a.name.localeCompare(b.name);
        });
    }
    
    displaySearchResults() {
        const searchResults = sessionStorage.getItem('searchResults');
        const searchTerm = sessionStorage.getItem('searchTerm');
        
        if (!searchResults || !searchTerm) return;
        
        const products = JSON.parse(searchResults);
        const productGrid = document.querySelector('.product-grid');
        const pageTitle = document.querySelector('.page-header h1');
        
        if (pageTitle) {
            pageTitle.textContent = `Search Results for "${searchTerm}"`;
        }
        
        if (!productGrid) return;
        
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #666;
                ">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3>No products found for "${searchTerm}"</h3>
                    <p>Try searching with different keywords or browse our categories.</p>
                </div>
            `;
            return;
        }
        
        productGrid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">₹${product.price}</p>
                    <button class="btn btn-primary add-to-cart-btn" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    addToSearchHistory(term) {
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => item !== term);
        
        // Add to beginning
        this.searchHistory.unshift(term);
        
        // Keep only last 10 searches
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
    
    showToast(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize search engine globally
window.searchEngine = new SearchEngine();