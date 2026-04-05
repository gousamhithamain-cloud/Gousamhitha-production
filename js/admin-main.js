/**
 * Entry Point for admin pages
 */

// Import CSS
import '../admin-styles.css';
import '../admin-styles-professional.css';
import '../css/responsive.css';

// Core scripts
import './api-client.js';
import './auth-handler.js';

// Admin-specific
import '../admin-db.js';
import './admin-mobile.js';
import './admin-cache-invalidator.js';
import './persistent-admin-cache.js';

// Toast
import './toast.js';

console.log('✅ Admin page initialized');
