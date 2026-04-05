// PRODUCT DISPLAY V2 — uses backend API, no direct Supabase calls
(function () {
    'use strict';

    var API_BASE = window.API_BASE_URL || 'http://localhost:4000/api';

    // ── Skeleton ──────────────────────────────────────────────────────────────
    function injectSkeletonStyles() {
        if (document.getElementById('skeleton-styles')) return;
        var s = document.createElement('style');
        s.id = 'skeleton-styles';
        s.textContent = [
            '.skeleton-card{background:#fff;border-radius:12px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);}',
            '.skeleton-img{width:100%;height:180px;border-radius:8px;background:#e8e8e8;}',
            '.skeleton-line{height:14px;border-radius:6px;background:#e8e8e8;}',
            '.skeleton-btn{width:100%;height:40px;border-radius:8px;background:#e8e8e8;}',
            '.skeleton-pulse{animation:skPulse 1.4s ease-in-out infinite;}',
            '@keyframes skPulse{0%,100%{opacity:1}50%{opacity:.4}}'
        ].join('');
        document.head.appendChild(s);
    }

    function showSkeleton(grid, count) {
        injectSkeletonStyles();
        var isMobile = window.innerWidth <= 768;
        var n = count || (isMobile ? 3 : 8);
        var card = '<div class="skeleton-card">' +
            '<div class="skeleton-img skeleton-pulse"></div>' +
            '<div class="skeleton-line skeleton-pulse" style="width:70%;margin-top:14px;"></div>' +
            '<div class="skeleton-line skeleton-pulse" style="width:40%;margin-top:10px;"></div>' +
            '<div class="skeleton-btn skeleton-pulse" style="margin-top:16px;"></div>' +
            '</div>';
        grid.innerHTML = Array(n).fill(card).join('');
    }

    // ── Fetch via backend API ─────────────────────────────────────────────────
    async function fetchProducts(params) {
        var qs = params ? '?' + new URLSearchParams(params).toString() : '';
        var controller = new AbortController();
        var timeout = setTimeout(function () { controller.abort(); }, 8000);

        try {
            var res = await fetch(API_BASE + '/products' + qs, { signal: controller.signal });
            clearTimeout(timeout);
            if (!res.ok) throw new Error('Server error ' + res.status);
            var json = await res.json();
            return json.products || [];
        } catch (err) {
            clearTimeout(timeout);
            if (err.name === 'AbortError') throw new Error('Request timed out — please refresh');
            throw err;
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    function renderProducts(products, grid, isHome) {
        var list = isHome ? products.slice(0, 4) : products;

        if (list.length === 0) {
            grid.innerHTML = '<div style="text-align:center;padding:3rem;grid-column:1/-1;">' +
                '<div style="font-size:4rem;margin-bottom:1rem;">📦</div>' +
                '<div style="font-size:1.2rem;color:#666;">No products available yet.</div></div>';
            return;
        }

        grid.innerHTML = list.map(function (p) {
            var avail = p.stock > 0;
            var unit = p.display_unit || (p.unit_quantity ? p.unit_quantity + (p.unit || '') : (p.unit || ''));
            var img = p.image_url || 'images/placeholder.jpg';
            var safeName = (p.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

            return '<div class="product-card">' +
                '<img src="' + img + '" alt="' + p.name + '" loading="lazy"' +
                ' onerror="this.onerror=null;this.src=\'images/placeholder.jpg\'">' +
                '<h3 style="margin:.8rem 0 .3rem;font-size:1.1rem;color:#333;">' + p.name + '</h3>' +
                (unit ? '<p style="color:#666;font-size:.85rem;margin:.2rem 0;font-weight:500;">' + unit + '</p>' : '') +
                '<p class="price" style="font-size:1.3rem;font-weight:700;color:#4a7c59;margin:.5rem 0;">&#8377;' + p.price + '</p>' +
                (avail
                    ? '<div style="margin:.5rem 0;"><span style="padding:.3rem .8rem;border-radius:15px;font-size:.75rem;font-weight:600;background:#e8f5e9;color:#2e7d32;">In Stock (' + p.stock + ' left)</span></div>' +
                      '<div style="display:flex;align-items:center;justify-content:center;gap:.5rem;margin:1rem 0;">' +
                      '<button onclick="window.ProductOptimizer.dec(\'' + p.id + '\')" style="width:35px;height:35px;border:1px solid #4a7c59;background:#fff;color:#4a7c59;border-radius:5px;font-size:1.2rem;cursor:pointer;font-weight:bold;">-</button>' +
                      '<input type="number" id="qty-' + p.id + '" value="1" min="1" max="' + p.stock + '" style="width:60px;height:35px;text-align:center;border:1px solid #ddd;border-radius:5px;font-size:1rem;" readonly>' +
                      '<button onclick="window.ProductOptimizer.inc(\'' + p.id + '\',' + p.stock + ')" style="width:35px;height:35px;border:1px solid #4a7c59;background:#fff;color:#4a7c59;border-radius:5px;font-size:1.2rem;cursor:pointer;font-weight:bold;">+</button>' +
                      '</div>' +
                      '<button onclick="window.ProductOptimizer.addToCart(\'' + p.id + '\',\'' + safeName + '\',' + p.price + ',' + p.stock + ')" style="display:block;width:100%;padding:.7rem;background:#4a7c59;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Add to Cart</button>'
                    : '<div style="margin:.5rem 0;padding:.5rem;background:#ffebee;border-radius:8px;border:1px solid #ef5350;text-align:center;color:#d32f2f;font-weight:700;">OUT OF STOCK</div>' +
                      '<button disabled style="display:block;width:100%;padding:.7rem;opacity:.5;cursor:not-allowed;background:#ccc;color:#666;border:none;border-radius:8px;">Out of Stock</button>'
                ) + '</div>';
        }).join('');

        console.log('✅ [ProductOptimizer] Rendered ' + list.length + ' products');
    }

    // ── Main load ─────────────────────────────────────────────────────────────
    async function loadProductsOptimized() {
        var productGrid = document.querySelector('.product-grid');
        var homeGrid = document.getElementById('home-product-grid');
        var grid = productGrid || homeGrid;
        if (!grid) return;

        var params = new URLSearchParams(window.location.search);
        if (productGrid && !homeGrid && (params.get('productId') || params.get('search'))) return;

        var isHome = !!homeGrid;
        var category = params.get('category');

        showSkeleton(grid, isHome ? 4 : null);

        try {
            console.log('[ProductOptimizer] Fetching products from API...');
            var fetchParams = {};
            if (category) fetchParams.category = category;

            var products = await fetchProducts(Object.keys(fetchParams).length ? fetchParams : null);
            console.log('[ProductOptimizer] Got ' + products.length + ' products');

            if (!isHome && category && products.length === 0) {
                grid.innerHTML = '<div style="text-align:center;padding:3rem;grid-column:1/-1;">' +
                    '<div style="font-size:4rem;margin-bottom:1rem;">🔍</div>' +
                    '<div style="font-size:1.2rem;color:#666;">No products in "' + category + '" category.</div></div>';
                return;
            }

            renderProducts(products, grid, isHome);
            window._shopLoaderDone = true;

        } catch (err) {
            console.error('❌ [ProductOptimizer]', err.message);
            grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#d32f2f;grid-column:1/-1;">' +
                '<div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>' +
                '<div style="font-size:1.2rem;margin-bottom:.5rem;">Could not load products. Please refresh.</div>' +
                '<div style="font-size:.85rem;color:#888;margin-bottom:1rem;">' + err.message + '</div>' +
                '<button onclick="window.ProductOptimizer.refresh()" style="padding:.7rem 1.5rem;background:#4a7c59;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Retry</button></div>';
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    }

    // ── Quantity controls ─────────────────────────────────────────────────────
    function inc(id, max) {
        var el = document.getElementById('qty-' + id);
        if (!el) return;
        var v = parseInt(el.value);
        if (v < max) el.value = v + 1;
        else if (typeof showToast === 'function') showToast('Maximum stock is ' + max, 'error');
    }

    function dec(id) {
        var el = document.getElementById('qty-' + id);
        if (el && parseInt(el.value) > 1) el.value = parseInt(el.value) - 1;
    }

    // ── Add to cart — via backend API ─────────────────────────────────────────
    async function addToCart(productId, productName, price, maxStock) {
        // Get current user from localStorage (set by AuthAPI.signin)
        var user = null;
        try {
            var raw = localStorage.getItem('auth_user');
            if (raw) user = JSON.parse(raw);
        } catch (e) {}

        // Fallback: try Supabase session if still present
        if (!user && window.supabase) {
            try {
                var r = await window.supabase.auth.getUser();
                if (!r.error && r.data && r.data.user) user = r.data.user;
            } catch (e) {}
        }

        if (!user) {
            if (typeof showToast === 'function') showToast('Please login to add items to cart', 'error');
            var m = document.getElementById('auth-modal');
            if (m) m.classList.add('active');
            return;
        }

        var qtyEl = document.getElementById('qty-' + productId);
        var quantity = qtyEl ? parseInt(qtyEl.value) : 1;

        try {
            var token = localStorage.getItem('auth_token') || '';
            var res = await fetch(API_BASE + '/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ user_id: user.id, product_id: productId, quantity: quantity })
            });
            var data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add to cart');

            if (typeof showToast === 'function') showToast(quantity + ' x ' + productName + ' added to cart!', 'success');
            if (qtyEl) qtyEl.value = 1;
            if (typeof updateCartCount === 'function') updateCartCount();
        } catch (e) {
            console.error('[ProductOptimizer.addToCart]', e.message);
            if (typeof showToast === 'function') showToast(e.message || 'Error adding to cart', 'error');
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────
    window.ProductOptimizer = {
        load: loadProductsOptimized,
        refresh: loadProductsOptimized,
        inc: inc,
        dec: dec,
        addToCart: addToCart,
        // legacy aliases
        increaseQuantity: inc,
        decreaseQuantity: dec
    };

    window.loadProducts = loadProductsOptimized;
    window.increaseQuantity = inc;
    window.decreaseQuantity = dec;
    window.addToCart = addToCart;

    // ── Init ──────────────────────────────────────────────────────────────────
    var _done = false;
    function _init() {
        if (_done) return;
        _done = true;
        loadProductsOptimized();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }

    console.log('⚡ [ProductOptimizer] Loaded — using backend API');
})();
