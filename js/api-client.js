/**
 * api-client.js
 * Central frontend API client — all backend calls go through here.
 * No direct Supabase DB calls from frontend.
 */

const API_BASE = window.API_BASE_URL || 'http://localhost:4000/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const err = new Error(data.error || `HTTP ${res.status}`);
        err.status = res.status;
        throw err;
    }
    return data;
}

// ── Products ──────────────────────────────────────────────────────────────────

const ProductsAPI = {
    getAll: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return apiFetch(`/products${qs ? '?' + qs : ''}`);
    },
    getById: (id) => apiFetch(`/products/${id}`),
    create: (data) => apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' })
};

// ── Cart ──────────────────────────────────────────────────────────────────────

const CartAPI = {
    get: (userId) => apiFetch(`/cart/${userId}`),
    add: (userId, productId, quantity) =>
        apiFetch('/cart', { method: 'POST', body: JSON.stringify({ user_id: userId, product_id: productId, quantity }) }),
    update: (itemId, quantity) =>
        apiFetch(`/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    remove: (itemId) => apiFetch(`/cart/${itemId}`, { method: 'DELETE' }),
    clear: (userId) => apiFetch(`/cart/user/${userId}`, { method: 'DELETE' })
};

// ── Orders ────────────────────────────────────────────────────────────────────

const OrdersAPI = {
    getAll: () => apiFetch('/orders'),
    getByUser: (userId) => apiFetch(`/orders/user/${userId}`),
    getById: (id) => apiFetch(`/orders/${id}`),
    create: (orderData) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
    updateStatus: (id, status) =>
        apiFetch(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    delete: (id) => apiFetch(`/orders/${id}`, { method: 'DELETE' })
};

// ── Users ─────────────────────────────────────────────────────────────────────

const UsersAPI = {
    get: (id) => apiFetch(`/users/${id}`),
    create: (data) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

// ── Auth ──────────────────────────────────────────────────────────────────────

const AuthAPI = {
    signup: (email, password, full_name, phone) =>
        apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, full_name, phone }) }),

    signin: async (email, password) => {
        const data = await apiFetch('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) });
        if (data.session?.access_token) {
            localStorage.setItem('auth_token', data.session.access_token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
        return data;
    },

    signout: async () => {
        await apiFetch('/auth/signout', { method: 'POST' }).catch(() => {});
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    },

    getUser: () => {
        const raw = localStorage.getItem('auth_user');
        return raw ? JSON.parse(raw) : null;
    },

    isLoggedIn: () => !!localStorage.getItem('auth_token')
};

// ── Expose globally ───────────────────────────────────────────────────────────

window.API = { Products: ProductsAPI, Cart: CartAPI, Orders: OrdersAPI, Users: UsersAPI, Auth: AuthAPI };
window.ProductsAPI = ProductsAPI;
window.CartAPI = CartAPI;
window.OrdersAPI = OrdersAPI;
window.UsersAPI = UsersAPI;
window.AuthAPI = AuthAPI;

console.log('✅ API client loaded — all calls routed through backend');
