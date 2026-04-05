// Universal Search System - Live Supabase queries only
class UniversalSearch {
    constructor() {
        this.debounceTimer = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.initializeAllSearchBars();
        this.addSearchStyles();
        this.isInitialized = true;
        console.log('✅ Universal Search initialized');
    }

    initializeAllSearchBars() {
        const searchInputs = document.querySelectorAll('.main-search-bar');
        const searchButtons = document.querySelectorAll('.search-btn');

        searchInputs.forEach((searchInput, index) => {
            this.setupSearchBar(searchInput, index);
        });

        searchButtons.forEach((searchBtn, index) => {
            const correspondingInput = searchInputs[index];
            if (correspondingInput) {
                searchBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.performSearch(correspondingInput.value.trim());
                });
            }
        });
    }

    setupSearchBar(searchInput, index) {
        const dropdownId = `search-dropdown-${index}`;
        let dropdown = document.getElementById(dropdownId);
        if (dropdown) dropdown.remove();

        dropdown = document.createElement('div');
        dropdown.id = dropdownId;
        dropdown.className = 'universal-search-dropdown';

        // Wrap the input in a relative-positioned container so dropdown anchors to it
        let wrapper = searchInput.parentElement;
        if (!wrapper || !wrapper.classList.contains('search-input-wrapper')) {
            wrapper = document.createElement('div');
            wrapper.className = 'search-input-wrapper';
            searchInput.parentNode.insertBefore(wrapper, searchInput);
            wrapper.appendChild(searchInput);
        }
        wrapper.appendChild(dropdown);

        searchInput.addEventListener('input', (e) => {
            this.handleInput(e.target.value.trim(), dropdown);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                dropdown.style.display = 'none';
                this.performSearch(searchInput.value.trim());
            } else if (e.key === 'Escape') {
                dropdown.style.display = 'none';
                searchInput.blur();
            }
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim() && dropdown.innerHTML) {
                dropdown.style.display = 'block';
            }
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => { dropdown.style.display = 'none'; }, 200);
        });

        dropdown.addEventListener('mousedown', (e) => { e.preventDefault(); });
    }

    handleInput(query, dropdown) {
        clearTimeout(this.debounceTimer);

        if (query.length < 1) {
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
            return;
        }

        this.debounceTimer = setTimeout(() => {
            this.showDropdown(query, dropdown);
        }, 300);
    }

    async showDropdown(query, dropdown) {
        // Show loading state
        dropdown.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <span>Searching...</span>
            </div>
        `;
        dropdown.style.display = 'block';

        // Wait for Supabase
        let attempts = 0;
        while (!window.supabase && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        if (!query || query.length < 2) return;
            const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/products?search=${encodeURIComponent(query)}`);
            const json = await res.json();
            const seen = new Set();
            const unique = (json.products || []).filter(p => {
                if (seen.has(p.name)) return false;
                seen.add(p.name);
                return true;
            }).slice(0, 5);
            this.renderDropdown(unique, query, dropdown);
        } catch (err) {
            console.error('Search error:', err);
            dropdown.innerHTML = `<div class="search-no-results"><div class="no-results-text">Search failed. Try again.</div></div>`;
        }
    }

    renderDropdown(results, query, dropdown) {
        dropdown.innerHTML = '';

        if (results.length === 0) {
            dropdown.innerHTML = `<div class="search-no-results">No results for "${query}"</div>`;
            dropdown.style.display = 'block';
            return;
        }

        results.forEach(product => {
            const item = document.createElement('div');
            item.className = 'search-item';
            item.dataset.id = product.id;
            item.innerHTML = `🔍 ${this.highlightMatch(product.name, query)}`;
            item.addEventListener('click', () => {
                console.log('Clicked product:', product.id, product.name);
                dropdown.innerHTML = '';
                dropdown.style.display = 'none';
                window.location.href = `shop.html?productId=${product.id}`;
            });
            dropdown.appendChild(item);
        });

        dropdown.style.display = 'block';
    }

    highlightMatch(text, query) {
        if (!text || !query) return text;
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<strong style="background:#fff3cd;color:#856404;">$1</strong>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    selectProduct(productId, productName) {
        document.querySelectorAll('.main-search-bar').forEach(input => { input.value = productName; });
        document.querySelectorAll('.universal-search-dropdown').forEach(d => {
            d.innerHTML = '';
            d.style.display = 'none';
        });
        window.location.href = `shop.html?productId=${productId}`;
    }

    viewProduct(productId) {
        window.location.href = `shop.html?productId=${productId}`;
    }

    performSearch(searchTerm) {
        if (!searchTerm) return;
        const query = encodeURIComponent(searchTerm);
        if (!window.location.pathname.includes('shop.html')) {
            window.location.href = `shop.html?search=${query}`;
        } else {
            window.history.replaceState(null, '', `shop.html?search=${query}`);
            if (window.handleSearchNavigation) window.handleSearchNavigation();
        }
    }

    addSearchStyles() {
        const styleId = 'universal-search-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .search-input-wrapper {
                position: relative !important;
                flex: 1;
                min-width: 0;
            }

            .search-section {
                position: relative !important;
                z-index: 1001;
                overflow: visible !important;
            }

            .navbar, .nav-wrapper, .navbar .container {
                overflow: visible !important;
            }

            .universal-search-dropdown {
                position: absolute !important;
                top: calc(100% + 5px) !important;
                left: 0 !important;
                right: 0 !important;
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 99999 !important;
                display: none;
                max-height: 300px;
                overflow-y: auto;
            }

            .search-loading {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 14px;
                color: #666;
                font-size: 14px;
            }

            .loading-spinner {
                width: 14px;
                height: 14px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #4a7c59;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

            .search-no-results {
                padding: 12px 14px;
                color: #999;
                font-size: 14px;
            }

            .search-item {
                padding: 10px 14px;
                font-size: 14px;
                color: #333;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .search-item:last-child { border-bottom: none; }

            .search-item:hover { background: #f5f5f5; }

            .search-item strong { font-weight: 700; color: #000; background: none; }

            @media (max-width: 768px) {
                .universal-search-dropdown { max-height: 250px; z-index: 10000; }
                .search-result-item { padding: 10px 12px; }
                .result-image { width: 35px; height: 35px; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize
let universalSearch;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { universalSearch = new UniversalSearch(); window.universalSearch = universalSearch; });
} else {
    universalSearch = new UniversalSearch();
    window.universalSearch = universalSearch;
}

console.log('🔍 Universal Search script loaded');
