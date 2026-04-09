// product-display.js — API-only version (no Supabase)
// Replaced by js/product-display-optimized-v2.js for shop/home pages.
// This file is kept as a fallback for any legacy pages still referencing it.

async function loadProducts() {
    const productGrid = document.querySelector('.product-grid');
    const homeProductGrid = document.getElementById('home-product-grid');
    const targetGrid = productGrid || homeProductGrid;
    if (!targetGrid) return;

    // Defer to optimized version if loaded
    if (window._shopLoaderDone || window.optimizationsLoaded) {
        console.log('⚡ Optimized product display already handled this');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (productGrid && !homeProductGrid && (urlParams.get('productId') || urlParams.get('search'))) return;

    targetGrid.innerHTML = Array(4).fill('<div class="skeleton-card"><div class="skeleton-img skeleton-pulse"></div><div class="skeleton-line skeleton-pulse" style="width:70%;margin-top:12px;"></div><div class="skeleton-line skeleton-pulse" style="width:40%;margin-top:8px;"></div></div>').join('');

    try {
        const apiBase = window.API_BASE_URL || 'http://localhost:4000/api';
        const category = urlParams.get('category');
        const url = category ? `${apiBase}/products?category=${encodeURIComponent(category)}` : `${apiBase}/products`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('API error ' + res.status);
        const json = await res.json();
        const products = (json.data && json.data.items) || json.products || [];

        if (products.length === 0) {
            targetGrid.innerHTML = '<div style="text-align:center;padding:3rem;grid-column:1/-1;"><div style="font-size:4rem;">📦</div><div style="color:#666;">No products available yet.</div></div>';
            return;
        }

        const display = homeProductGrid ? products.slice(0, 4) : products;
        targetGrid.innerHTML = display.map(p => {
            const avail = p.stock > 0;
            const unit = p.display_unit || (p.unit_quantity ? p.unit_quantity + (p.unit || '') : (p.unit || ''));
            return `<div class="product-card">
                <img src="${p.image_url || 'images/placeholder.jpg'}" alt="${p.name}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
                <h3 style="margin:.8rem 0 .3rem;font-size:1.1rem;color:#333;">${p.name}</h3>
                ${unit ? `<p style="color:#666;font-size:.85rem;margin:.2rem 0;">${unit}</p>` : ''}
                <p class="price" style="font-size:1.3rem;font-weight:700;color:#4a7c59;margin:.5rem 0;">₹${p.price}</p>
                ${avail
                    ? `<div style="margin:.5rem 0;"><span style="padding:.3rem .8rem;border-radius:15px;font-size:.75rem;font-weight:600;background:#e8f5e9;color:#2e7d32;">In Stock (${p.stock} left)</span></div>
                       <div style="display:flex;align-items:center;justify-content:center;gap:.5rem;margin:1rem 0;">
                         <button onclick="decreaseQuantity('${p.id}')" style="width:35px;height:35px;border:1px solid #4a7c59;background:#fff;color:#4a7c59;border-radius:5px;font-size:1.2rem;cursor:pointer;">-</button>
                         <input type="number" id="qty-${p.id}" value="1" min="1" max="${p.stock}" style="width:60px;height:35px;text-align:center;border:1px solid #ddd;border-radius:5px;" readonly>
                         <button onclick="increaseQuantity('${p.id}',${p.stock})" style="width:35px;height:35px;border:1px solid #4a7c59;background:#fff;color:#4a7c59;border-radius:5px;font-size:1.2rem;cursor:pointer;">+</button>
                       </div>
                       <button onclick="addToCart('${p.id}','${(p.name||'').replace(/'/g,"\\'")}',${p.price},${p.stock})" style="display:block;width:100%;padding:.7rem;background:#4a7c59;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Add to Cart</button>`
                    : `<div style="margin:.5rem 0;padding:.5rem;background:#ffebee;border-radius:8px;text-align:center;color:#d32f2f;font-weight:700;">OUT OF STOCK</div>
                       <button disabled style="display:block;width:100%;padding:.7rem;opacity:.5;cursor:not-allowed;background:#ccc;color:#666;border:none;border-radius:8px;">Out of Stock</button>`
                }
            </div>`;
        }).join('');
    } catch (err) {
        console.error('Error loading products:', err);
        targetGrid.innerHTML = `<div style="text-align:center;padding:2rem;color:#d32f2f;grid-column:1/-1;"><div style="font-size:3rem;">⚠️</div><div>${err.message}</div><button onclick="location.reload()" style="margin-top:1rem;padding:.7rem 1.5rem;background:#4a7c59;color:#fff;border:none;border-radius:8px;cursor:pointer;">Retry</button></div>`;
    }
}

function increaseQuantity(id, max) {
    const el = document.getElementById('qty-' + id);
    if (el && parseInt(el.value) < max) el.value = parseInt(el.value) + 1;
}
function decreaseQuantity(id) {
    const el = document.getElementById('qty-' + id);
    if (el && parseInt(el.value) > 1) el.value = parseInt(el.value) - 1;
}

async function addToCart(productId, productName, price, maxStock) {
    const user = (() => { try { return JSON.parse(localStorage.getItem('user') || localStorage.getItem('auth_user') || 'null'); } catch(e) { return null; } })();
    if (!user) {
        if (typeof showToast === 'function') showToast('Please login to add items to cart', 'error');
        const modal = document.getElementById('auth-modal');
        if (modal) modal.classList.add('active');
        return;
    }
    const qty = parseInt(document.getElementById('qty-' + productId)?.value || 1);
    try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ user_id: user.id, product_id: productId, quantity: qty })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || 'Failed to add to cart');
        if (typeof showToast === 'function') showToast(`${qty} x ${productName} added to cart!`, 'success');
        const qtyEl = document.getElementById('qty-' + productId);
        if (qtyEl) qtyEl.value = 1;
        if (typeof updateCartCount === 'function') updateCartCount();
    } catch (err) {
        if (typeof showToast === 'function') showToast(err.message || 'Error adding to cart', 'error');
    }
}

// Initialize — only if optimized version hasn't run
let _legacyInitDone = false;
document.addEventListener('DOMContentLoaded', function() {
    if (_legacyInitDone || window._shopLoaderDone || window.optimizationsLoaded) return;
    _legacyInitDone = true;
    loadProducts();
});

// Also fire on supabaseReady for backward compat (now fires immediately from stub)
window.addEventListener('supabaseReady', function() {
    if (_legacyInitDone || window._shopLoaderDone) return;
    _legacyInitDone = true;
    loadProducts();
}, { once: true });

window.loadProducts = loadProducts;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = window.addToCart || addToCart;
