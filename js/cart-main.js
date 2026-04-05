/**
 * Entry Point for cart.html
 */

// Import CSS
import '../styles.css';
import '../css/responsive.css';
import '../css/mobile-menu.css';
import '../css/back-button.css';
import '../css/bottom-nav.css';
import '../empty-states.css';

// Core scripts
import './mobile-menu.js';
import './bottom-nav.js';
import './back-button.js';
import './cart-count-updater.js';
import './api-client.js';
import './auth-handler.js';

// Cart-specific
import './mobile-cart-handler.js';
import './cart-initialization-fix.js';
import './cart-total-fix.js';
import './selective-checkout-handler.js';
import './working-cart-selection.js';

// Toast
import './toast.js';

console.log('✅ Cart page initialized');
