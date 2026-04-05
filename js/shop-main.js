/**
 * Entry Point for shop.html
 * Minimal imports to get started
 */

// Set API base URL first
window.API_BASE_URL = window.API_BASE_URL || 'http://localhost:4000/api';

// Don't import CSS here - let HTML link tags handle it for now

// Essential scripts only
import './toast.js';
import './api-client.js';
import './auth-handler.js';
import './cart-count-updater.js';

console.log('✅ Shop page initialized');
