/**
 * Admin Products Handler
 * Uses backend API instead of direct Supabase
 */

console.log('📦 Loading Admin Products Handler...');

let editingProductId = null;

// ══════════════════════════════════════════════════════════════════════════════
// LOAD PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════

async function loadProducts() {
    console.log('📦 Loading products...');
    
    const tbody = document.getElementById('products-table-body');
    
    if (!tbody) {
        console.error('❌ Products table body not found');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading products...</td></tr>';
    
    try {
        const products = await AdminProductsAPI.getAll({ limit: 100 });
        
        console.log('✅ Products loaded:', products.length);
        console.log('📊 PRODUCTS API RESPONSE:', products);
        
        // Debug: Log first product to see field names
        if (products && products.length > 0) {
            console.log('🔍 First product structure:', products[0]);
            console.log('🔍 Available fields:', Object.keys(products[0]));
        }
        
        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">No products found. <a href="admin-add-product.html">Add your first product</a></td></tr>';
            return;
        }
        
        displayProducts(products);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading products: ${error.message}<br><small>Check console for details</small></td></tr>`;
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('products-table-body');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">No products available</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.image_url || 'images/placeholder.png'}" 
                     alt="${product.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
            </td>
            <td>${product.name || 'N/A'}</td>
            <td>${product.category || 'N/A'}</td>
            <td>₹${product.price || 0}</td>
            <td>${product.stock || 0}</td>
            <td>
                <span class="status-badge ${product.in_stock ? 'status-active' : 'status-inactive'}">
                    ${product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td>
                <button class="btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// EDIT PRODUCT
// ══════════════════════════════════════════════════════════════════════════════

async function editProduct(id) {
    console.log('✏️ Editing product:', id);
    
    try {
        const product = await AdminProductsAPI.getById(id);
        
        console.log('✅ Product loaded for editing:', product);
        
        // Set form values
        editingProductId = id;
        document.getElementById('edit-product-id').value = id;
        document.getElementById('edit-name').value = product.name || '';
        document.getElementById('edit-category').value = product.category || '';
        document.getElementById('edit-price').value = product.price || '';
        document.getElementById('edit-stock').value = product.stock || '';
        document.getElementById('edit-unit').value = product.unit || 'kg';
        document.getElementById('edit-unit-quantity').value = product.unit_quantity || '';
        document.getElementById('edit-display-unit').value = product.display_unit || '';
        
        // Show edit panel
        document.getElementById('edit-overlay').classList.add('active');
        document.getElementById('edit-panel').classList.add('active');
        
    } catch (error) {
        console.error('❌ Error loading product:', error);
        alert('Error loading product: ' + error.message);
    }
}

function closeEditPanel() {
    document.getElementById('edit-overlay').classList.remove('active');
    document.getElementById('edit-panel').classList.remove('active');
    editingProductId = null;
}

async function saveProductEdit(event) {
    event.preventDefault();
    
    console.log('💾 Saving product...');
    
    const productData = {
        name: document.getElementById('edit-name').value,
        category: document.getElementById('edit-category').value,
        price: parseFloat(document.getElementById('edit-price').value),
        stock: parseInt(document.getElementById('edit-stock').value),
        unit: document.getElementById('edit-unit').value,
        unit_quantity: parseFloat(document.getElementById('edit-unit-quantity').value),
        display_unit: document.getElementById('edit-display-unit').value,
        in_stock: parseInt(document.getElementById('edit-stock').value) > 0
    };
    
    console.log('📤 Product data:', productData);
    
    try {
        await AdminProductsAPI.update(editingProductId, productData);
        
        console.log('✅ Product updated successfully');
        alert('Product updated successfully!');
        
        closeEditPanel();
        await loadProducts();
        
    } catch (error) {
        console.error('❌ Error updating product:', error);
        alert('Error updating product: ' + error.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// DELETE PRODUCT
// ══════════════════════════════════════════════════════════════════════════════

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    console.log('🗑️ Deleting product:', id);
    
    try {
        await AdminProductsAPI.delete(id);
        
        console.log('✅ Product deleted successfully');
        alert('Product deleted successfully!');
        
        await loadProducts();
        
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// TOGGLE STOCK STATUS
// ══════════════════════════════════════════════════════════════════════════════

async function toggleStock(id, currentStatus) {
    const newStatus = !currentStatus;
    
    console.log(`🔄 Toggling stock for ${id}: ${currentStatus} → ${newStatus}`);
    
    try {
        await AdminProductsAPI.update(id, { in_stock: newStatus });
        
        console.log('✅ Stock status updated');
        await loadProducts();
        
    } catch (error) {
        console.error('❌ Error updating stock status:', error);
        alert('Error updating stock status: ' + error.message);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════════════════════════════════════════════

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

window.loadProducts = loadProducts;
window.editProduct = editProduct;
window.closeEditPanel = closeEditPanel;
window.saveProductEdit = saveProductEdit;
window.deleteProduct = deleteProduct;
window.toggleStock = toggleStock;
window.adminLogout = adminLogout;

// ══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════════

function initializeProductsPage() {
    console.log('🚀 Initializing products page...');
    
    // Load products (auth check removed for initial load)
    loadProducts();
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProductsPage);
} else {
    initializeProductsPage();
}

console.log('✅ Admin Products Handler loaded');
