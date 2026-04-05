// Product Display using Supabase
// Replaces Nhost GraphQL queries

async function loadProducts() {
    const productGrid = document.querySelector('.product-grid');
    const homeProductGrid = document.getElementById('home-product-grid');
    const targetGrid = productGrid || homeProductGrid;

    if (!targetGrid) return;

    // If productId or search param exists on shop page, let handleSearchNavigation handle it
    if (productGrid && !homeProductGrid) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('productId') || urlParams.get('search')) {
            console.log('INIT SHOP: search/productId param detected — skipping loadProducts');
            return;
        }
    }

    const skeletonCount = homeProductGrid ? 4 : 8;
    targetGrid.innerHTML = Array(skeletonCount).fill(`
        <div class="skeleton-card">
            <div class="skeleton-img skeleton-pulse"></div>
            <div class="skeleton-line skeleton-pulse" style="width:70%;margin-top:12px;"></div>
            <div class="skeleton-line skeleton-pulse" style="width:40%;margin-top:8px;"></div>
            <div class="skeleton-btn skeleton-pulse" style="margin-top:14px;"></div>
        </div>
    `).join('');
    
    try {
        console.log('Loading products from API...');
        
        // Fetch products via backend API
        const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/products`);
        if (!res.ok) throw new Error('API error ' + res.status);
        const json = await res.json();
        const products = json.products || [];
        
        console.log('✅ Products loaded from API');
        console.log(`Found ${products.length} products`);
        
        if (products.length === 0) {
            const message = homeProductGrid ? 
                'No products available yet. Check back soon!' : 
                'No products available yet.';
            targetGrid.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📦</div>
                    <div style="font-size: 1.2rem; color: #666;">${message}</div>
                </div>
            `;
            return;
        }

        
        // Filter by category if on shop page
        let filteredProducts = products;
        if (productGrid && !homeProductGrid) {
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('category');
            if (categoryParam) {
                filteredProducts = products.filter(product => product.category === categoryParam);
                if (filteredProducts.length === 0) {
                    targetGrid.innerHTML = `
                        <div class="empty-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                            <div style="font-size: 1.2rem; color: #666;">No products found in "${categoryParam}" category.</div>
                        </div>
                    `;
                    return;
                }
            }
        }
        
        // Show only 4 products on home page
        const displayProducts = homeProductGrid ? products.slice(0, 4) : filteredProducts;
        
        // Render products
        targetGrid.innerHTML = displayProducts.map(product => {
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
        
        console.log(`✅ Loaded ${displayProducts.length} products`);
        
    } catch (error) {
        console.error('Error loading products:', error);
        targetGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #d32f2f; grid-column: 1/-1;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Database connection error. Please refresh the page.</div>
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 1rem;">${error.message}</div>
                <button onclick="location.reload()" style="padding: 0.7rem 1.5rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Retry</button>
            </div>
        `;
    }
}


// Quantity controls
function increaseQuantity(productId, maxStock) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    if (qtyInput) {
        let currentQty = parseInt(qtyInput.value);
        if (currentQty < maxStock) {
            qtyInput.value = currentQty + 1;
        } else {
            if (typeof showToast === 'function') {
                showToast(`Maximum stock is ${maxStock}`, 'error');
            }
        }
    }
}

function decreaseQuantity(productId) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    if (qtyInput) {
        let currentQty = parseInt(qtyInput.value);
        if (currentQty > 1) {
            qtyInput.value = currentQty - 1;
        }
    }
}

// Add to cart function
async function addToCart(productId, productName, price, maxStock) {
    // Get user from localStorage or Supabase auth session
    let user = null;
    try { const raw = localStorage.getItem('auth_user'); if (raw) user = JSON.parse(raw); } catch(e){}
    if (!user && window.supabase) {
        try { const r = await window.supabase.auth.getUser(); if (!r.error && r.data?.user) user = r.data.user; } catch(e){}
    }
    
    if (!user) {
        if (typeof showToast === 'function') showToast('Please login to add items to cart', 'error');
        const authModal = document.getElementById('auth-modal');
        if (authModal) authModal.classList.add('active');
        return;
    }
    
    const qtyInput = document.getElementById(`qty-${productId}`);
    const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
    
    try {
        const token = localStorage.getItem('auth_token') || '';
        const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ user_id: user.id, product_id: productId, quantity })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add to cart');
        
        if (typeof showToast === 'function') showToast(`${quantity} x ${productName} added to cart!`, 'success');
        if (qtyInput) qtyInput.value = 1;
        if (typeof updateCartCount === 'function') updateCartCount();
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        if (typeof showToast === 'function') {
            showToast(error.message || 'Error adding to cart', 'error');
        }
    }
}

// Load products when page loads — fire ONCE only
let _productDisplayInitDone = false;
document.addEventListener('DOMContentLoaded', function() {
    if (_productDisplayInitDone) return;

    // Skip if optimized version is handling it
    if (window.optimizationsLoaded) {
        console.log('⚡ Using optimized product display');
        return;
    }

    console.log('DOM loaded, initializing product display...');

    if (window.supabase && typeof window.supabase.from === 'function') {
        _productDisplayInitDone = true;
        loadProducts();
    } else {
        window.addEventListener('supabaseReady', function() {
            if (_productDisplayInitDone) return;
            _productDisplayInitDone = true;
            loadProducts();
        }, { once: true });
    }
});

// Global functions
window.refreshProducts = loadProducts;
window.loadProducts = loadProducts;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;
