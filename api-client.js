




const API_BASE_URL = 'http:

function getAuthToken() {
    return localStorage.getItem('authToken');
}

async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }
    return data;
}



async function fetchProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/products?${params}`);
    return handleResponse(response);
}
async function fetchProductById(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse(response);
}
async function createProduct(productData) {
    const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(productData)
    });
    return handleResponse(response);
}
async function updateProduct(id, productData) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(productData)
    });
    return handleResponse(response);
}
async function deleteProduct(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    return handleResponse(response);
}



async function fetchCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse(response);
}
async function createCategory(categoryData) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(categoryData)
    });
    return handleResponse(response);
}
async function deleteCategory(id) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    return handleResponse(response);
}



async function createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(orderData)
    });
    return handleResponse(response);
}
async function fetchOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    return handleResponse(response);
}
async function fetchOrderById(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    return handleResponse(response);
}
async function fetchAllOrders() {
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    return handleResponse(response);
}
async function updateOrderStatus(orderId, status) {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ status })
    });
    return handleResponse(response);
}



async function fetchVendors() {
    const response = await fetch(`${API_BASE_URL}/admin/vendors`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    return handleResponse(response);
}
async function createVendor(vendorData) {
    const response = await fetch(`${API_BASE_URL}/admin/vendors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(vendorData)
    });
    return handleResponse(response);
}



window.API = {
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
    createCategory,
    deleteCategory,
    createOrder,
    fetchOrders,
    fetchOrderById,
    fetchAllOrders,
    updateOrderStatus,
    fetchVendors,
    createVendor
};
