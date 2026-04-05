




const API_BASE_URL = 'http:



async function loadProducts(category = null) {
    try {
        let url = `${API_BASE_URL}/products`;
        if (category) {
            url += `?category=${encodeURIComponent(category)}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        const products = data.products || [];
        displayProducts(products);
    } catch (error) {
        console.error('Load products error:', error);
        displayEmptyState('Failed to load products');
    }
}
function displayProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;
    if (products.length === 0) {
        displayEmptyState('No products available');
        return;
    }
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="category">${product.category}</p>
            <p class="price">₹${product.price}</p>
            <p class="stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </p>
            ${product.stock > 0 ? 
                `<button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url || 'images/placeholder.png'}')">Add to Cart</button>` :
                `<button disabled>Out of Stock</button>`
            }
        </div>
    `).join('');
}
function displayEmptyState(message) {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <div class="empty-state-message">${message}</div>
        </div>
    `;
}



async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        const categories = data.categories || [];
        displayCategories(categories);
    } catch (error) {
        console.error('Load categories error:', error);
    }
}
function displayCategories(categories) {
    const container = document.getElementById('categories-container');
    if (!container) return;
    container.innerHTML = categories.map(category => `
        <div class="category-card" onclick="filterByCategory('${category.name}')">
            <h3>${category.name}</h3>
        </div>
    `).join('');
}
function filterByCategory(category) {
    loadProducts(category);
}



function addToCart(productId, name, price, image) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showMessage('Added to cart!', 'success');
}
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}



async function handleCheckout(event) {
    event.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    const customer_email = document.getElementById('customer-email').value;
    const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
    }));
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_email, items })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.removeItem('cart');
            updateCartCount();
            showToast(`Order placed successfully! Order ID: ${data.orderId}`);
            window.location.href = 'index.html';
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Failed to place order: ' + error.message, 'error');
    }
}



function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}



document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('index.html') || currentPage.endsWith('/')) {
        loadProducts();
        loadCategories();
    }
    updateCartCount();
});
