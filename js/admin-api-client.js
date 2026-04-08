/**
 * Admin API Client
 * Handles all admin panel API calls to backend
 * Replaces direct Supabase usage
 */

console.log('🔧 Loading Admin API Client...');

// Use global API_BASE_URL from config.js
const ADMIN_API_BASE = window.API_BASE_URL || 'http://localhost:4000/api';

console.log('🔗 Admin API Base:', ADMIN_API_BASE);

// ══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

function getAdminToken() {
    return localStorage.getItem('token') || localStorage.getItem('auth_token');
}

function getAdminUser() {
    try {
        const userStr = localStorage.getItem('user') || localStorage.getItem('auth_user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error('Failed to parse user:', e);
        return null;
    }
}

function checkAdminAuth() {
    const token = getAdminToken();
    const user = getAdminUser();
    
    if (!token || !user) {
        console.error('❌ Not authenticated');
        window.location.href = 'index.html';
        return false;
    }
    
    // Check if user is admin
    if (user.role !== 'admin' && user.email !== 'admin@123.com') {
        console.error('❌ Not authorized - admin access required');
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

async function adminFetch(endpoint, options = {}) {
    const token = getAdminToken();
    
    // For GET requests, token is optional
    const isGetRequest = !options.method || options.method === 'GET';
    
    if (!token && !isGetRequest) {
        throw new Error('No authentication token - please login');
    }
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Only add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = endpoint.startsWith('http') ? endpoint : `${ADMIN_API_BASE}${endpoint}`;
    
    console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    const data = await response.json();
    
    console.log(`📥 API Response (${response.status}):`, data);
    
    if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }
    
    return data;
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCTS API
// ══════════════════════════════════════════════════════════════════════════════

const AdminProductsAPI = {
    // Get all products
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        
        const queryString = params.toString();
        const endpoint = `/products${queryString ? '?' + queryString : ''}`;
        
        const result = await adminFetch(endpoint);
        console.log('🔍 Products API raw result:', result);
        console.log('🔍 Products data structure:', result.data);
        
        // Backend returns: { success: true, data: { items: [...], total: X } }
        const products = result.data?.items || result.data || [];
        console.log('🔍 Extracted products:', products);
        
        return products;
    },
    
    // Get single product
    async getById(id) {
        const result = await adminFetch(`/products/${id}`);
        return result.data;
    },
    
    // Create product
    async create(productData) {
        const result = await adminFetch('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
        return result.data;
    },
    
    // Update product
    async update(id, updates) {
        const result = await adminFetch(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        return result.data;
    },
    
    // Delete product
    async delete(id) {
        const result = await adminFetch(`/products/${id}`, {
            method: 'DELETE'
        });
        return result;
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// VENDORS API
// ══════════════════════════════════════════════════════════════════════════════

const AdminVendorsAPI = {
    // Get all vendors
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        
        const queryString = params.toString();
        const endpoint = `/vendors${queryString ? '?' + queryString : ''}`;
        
        const result = await adminFetch(endpoint);
        console.log('🔍 Vendors API raw result:', result);
        console.log('🔍 Vendors data structure:', result.data);
        
        // Backend returns: { success: true, data: { items: [...], total: X } }
        const vendors = result.data?.items || result.data || [];
        console.log('🔍 Extracted vendors:', vendors);
        
        return vendors;
    },
    
    // Get single vendor
    async getById(id) {
        const result = await adminFetch(`/vendors/${id}`);
        return result.data;
    },
    
    // Create vendor
    async create(vendorData) {
        const result = await adminFetch('/vendors', {
            method: 'POST',
            body: JSON.stringify(vendorData)
        });
        return result.data;
    },
    
    // Update vendor
    async update(id, updates) {
        const result = await adminFetch(`/vendors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        return result.data;
    },
    
    // Delete vendor
    async delete(id) {
        const result = await adminFetch(`/vendors/${id}`, {
            method: 'DELETE'
        });
        return result;
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// ORDERS API
// ══════════════════════════════════════════════════════════════════════════════

const AdminOrdersAPI = {
    // Get all orders
    async getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        
        const queryString = params.toString();
        const endpoint = `/orders${queryString ? '?' + queryString : ''}`;
        
        const result = await adminFetch(endpoint);
        return result.data || [];
    },
    
    // Get single order
    async getById(id) {
        const result = await adminFetch(`/orders/${id}`);
        return result.data;
    },
    
    // Update order status
    async updateStatus(id, status) {
        const result = await adminFetch(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ order_status: status })
        });
        return result.data;
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

window.AdminProductsAPI = AdminProductsAPI;
window.AdminVendorsAPI = AdminVendorsAPI;
window.AdminOrdersAPI = AdminOrdersAPI;
window.checkAdminAuth = checkAdminAuth;
window.getAdminToken = getAdminToken;
window.getAdminUser = getAdminUser;

console.log('✅ Admin API Client loaded');
