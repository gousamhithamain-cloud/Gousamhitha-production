




const API_BASE_URL = window.API_BASE_URL || 'http://localhost:4000/api';



async function loadDashboard() {
    try {
        const [productsRes, ordersRes, vendorsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/products`),
            fetch(`${API_BASE_URL}/orders`),
            fetch(`${API_BASE_URL}/vendors`)
        ]);
        
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();
        const vendorsData = await vendorsRes.json();
        
        console.log('Dashboard API responses:', { productsData, ordersData, vendorsData });
        
        // Extract data from API response format
        const products = productsData.data?.items || productsData.data || productsData.products || [];
        const orders = ordersData.data?.items || ordersData.data || ordersData.orders || [];
        const vendors = vendorsData.data?.items || vendorsData.data || vendorsData.vendors || [];
        
        console.log('Extracted data:', { 
            products: products.length, 
            orders: orders.length, 
            vendors: vendors.length 
        });
        
        const outOfStock = products.filter(p => p.stock === 0 || !p.in_stock).length;
        
        document.getElementById('total-products').textContent = products.length;
        document.getElementById('total-vendors').textContent = vendors.length;
        document.getElementById('total-orders').textContent = orders.length;
        document.getElementById('out-of-stock').textContent = outOfStock;
        
        loadVendorsList(vendors, products);
        loadRecentOrders(orders);
    } catch (error) {
        console.error('Load dashboard error:', error);
        alert('Failed to load dashboard data');
    }
}
function loadVendorsList(vendors, products) {
    const tbody = document.getElementById('vendors-list-body');
    if (!tbody) return;
    tbody.innerHTML = vendors.map(vendor => {
        const vendorProducts = products.filter(p => p.vendor_id === vendor.id);
        const createdDate = new Date(vendor.created_at).toLocaleDateString();
        return `
            <tr>
                <td>${vendor.vendor_name}</td>
                <td>${vendor.business_name}</td>
                <td>${vendor.phone || 'N/A'}</td>
                <td><span class="status-badge in-stock">active</span></td>
                <td>${vendorProducts.length}</td>
                <td>${createdDate}</td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="6">No vendors yet</td></tr>';
}
function loadRecentOrders(orders) {
    const recentOrdersList = document.getElementById('recent-orders-list');
    if (!recentOrdersList) return;
    const recentOrders = orders.slice(0, 5);
    recentOrdersList.innerHTML = recentOrders.map(order => `
        <div style="padding: 1rem; border-bottom: 1px solid #eee;">
            <strong>${order.id}</strong> - ${order.customer_email} - ₹${order.total} - ${order.status}
        </div>
    `).join('') || '<p>No orders yet</p>';
}



async function loadProductsTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        const products = data.products || [];
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;
        tbody.innerHTML = products.map(product => `
            <tr>
                <td><img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" class="product-image-small"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₹${product.price}</td>
                <td>${product.stock}</td>
                <td><span class="status-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
                <td>
                    <button class="action-btn btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Load products error:', error);
        alert('Failed to load products');
    }
}
async function handleAddProduct(event) {
    event.preventDefault();
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const imageInput = document.getElementById('product-image');
    const messageEl = document.getElementById('form-message');
    let image_url = null;
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            image_url = e.target.result;
            await saveProduct({ name, category, price, stock, image_url });
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        await saveProduct({ name, category, price, stock, image_url });
    }
}
async function saveProduct(productData) {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        const data = await response.json();
        if (data.success) {
            const messageEl = document.getElementById('form-message');
            messageEl.textContent = 'Product added successfully!';
            messageEl.className = 'form-message success';
            setTimeout(() => {
                window.location.href = 'admin-products.html';
            }, 1500);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Add product error:', error);
        alert('Failed to add product: ' + error.message);
    }
}
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            loadProductsTable();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Delete product error:', error);
        alert('Failed to delete product');
    }
}



async function loadOrdersTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`);
        const data = await response.json();
        const orders = data.orders || [];
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customer_email}</td>
                <td>-</td>
                <td>₹${order.total}</td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Packed" ${order.status === 'Packed' ? 'selected' : ''}>Packed</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
                <td>
                    ${order.status === 'Delivered' ? 
                        `<button class="btn-delete" onclick="deleteOrder('${order.id}')" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; font-size: 0.9rem;">Delete</button>` : 
                        `<span style="color: #999; font-size: 0.85rem;">Available after delivery</span>`
                    }
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7">No orders yet</td></tr>';
    } catch (error) {
        console.error('Load orders error:', error);
        alert('Failed to load orders');
    }
}
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();
        if (data.success) {
            loadOrdersTable();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Update order status error:', error);
        alert('Failed to update order status');
    }
}
async function deleteOrder(orderId) {
    if (!confirm(`Are you sure you want to delete order ${orderId}?`)) return;
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            loadOrdersTable();
            alert('Order deleted successfully!');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Delete order error:', error);
        alert('Failed to delete order');
    }
}



async function loadCategoriesDropdown() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        const categories = data.categories || [];
        const categorySelect = document.getElementById('product-category');
        if (!categorySelect) return;
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Load categories error:', error);
    }
}
async function displayCategoriesList() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        const categories = data.categories || [];
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) return;
        categoriesList.innerHTML = '';
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.style.cssText = 'display: flex; align-items: center; gap: 8px; background: white; padding: 8px 12px; border-radius: 5px; border: 1px solid #ddd;';
            const categoryName = document.createElement('span');
            categoryName.textContent = category.name;
            categoryName.style.cssText = 'flex: 1; color: #333;';
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '×';
            deleteBtn.style.cssText = 'background: #d32f2f; color: white; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 18px; line-height: 1;';
            deleteBtn.onclick = () => deleteCategory(category.id);
            deleteBtn.title = 'Delete category';
            categoryItem.appendChild(categoryName);
            categoryItem.appendChild(deleteBtn);
            categoriesList.appendChild(categoryItem);
        });
    } catch (error) {
        console.error('Display categories error:', error);
    }
}
async function addCategory() {
    const input = document.getElementById('new-category-input');
    if (!input) return;
    const newCategory = input.value.trim();
    if (!newCategory) {
        alert('Please enter a category name');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newCategory })
        });
        const data = await response.json();
        if (data.success) {
            input.value = '';
            loadCategoriesDropdown();
            displayCategoriesList();
            showMessage('Category added successfully!', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Add category error:', error);
        alert('Failed to add category: ' + error.message);
    }
}
async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            loadCategoriesDropdown();
            displayCategoriesList();
            showMessage('Category deleted successfully!', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Delete category error:', error);
        alert('Failed to delete category');
    }
}



async function handleAddVendor(event) {
    event.preventDefault();
    const vendor_name = document.getElementById('new-vendor-name').value;
    const business_name = document.getElementById('new-business-name').value;
    const phone = document.getElementById('new-vendor-phone').value;
    const address = document.getElementById('new-vendor-address')?.value;
    const messageEl = document.getElementById('add-vendor-message');
    
    try {
        // Use AdminVendorsAPI if available, otherwise use direct fetch
        if (window.AdminVendorsAPI) {
            const data = await window.AdminVendorsAPI.create({
                vendor_name,
                business_name,
                phone: phone || null,
                address: address || null,
                status: 'active'
            });
            
            messageEl.textContent = 'Vendor created successfully!';
            messageEl.className = 'form-message success';
            setTimeout(() => {
                closeAddVendorModal();
                loadDashboard();
            }, 1500);
        } else {
            // Fallback to direct API call
            const response = await fetch(`${API_BASE_URL}/vendors`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({ 
                    vendor_name, 
                    business_name, 
                    phone: phone || null,
                    address: address || null,
                    status: 'active'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                messageEl.textContent = 'Vendor created successfully!';
                messageEl.className = 'form-message success';
                setTimeout(() => {
                    closeAddVendorModal();
                    loadDashboard();
                }, 1500);
            } else {
                throw new Error(data.message || data.error || 'Failed to create vendor');
            }
        }
    } catch (error) {
        console.error('Add vendor error:', error);
        messageEl.textContent = 'Failed to add vendor: ' + error.message;
        messageEl.className = 'form-message error';
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
function toggleCategoryManagement() {
    const panel = document.getElementById('category-management-panel');
    if (!panel) return;
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        displayCategoriesList();
    } else {
        panel.style.display = 'none';
    }
}
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
    if (file && preview) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}



document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('admin-dashboard.html')) {
        loadDashboard();
    } else if (currentPage.includes('admin-products.html')) {
        loadProductsTable();
    } else if (currentPage.includes('admin-orders.html')) {
        loadOrdersTable();
    } else if (currentPage.includes('admin-add-product.html')) {
        loadCategoriesDropdown();
        displayCategoriesList();
        const categoryInput = document.getElementById('new-category-input');
        if (categoryInput) {
            categoryInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addCategory();
                }
            });
        }
        const panel = document.getElementById('category-management-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
});


function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const messageEl = document.getElementById('login-message');
    // Admin login is handled via Supabase auth
    messageEl.textContent = 'Please use the login page.';
    messageEl.className = 'login-message error';
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
}
function adminLogout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'index.html';
    }
}
function openAddVendorModal() {
    document.getElementById('add-vendor-panel').classList.add('active');
}
function closeAddVendorModal() {
    document.getElementById('add-vendor-panel').classList.remove('active');
    document.getElementById('add-vendor-form').reset();
    document.getElementById('add-vendor-message').textContent = '';
    document.getElementById('add-vendor-message').className = 'form-message';
}
