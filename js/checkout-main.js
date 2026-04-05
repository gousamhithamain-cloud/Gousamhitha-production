/**
 * Entry Point for checkout.html
 */

// Import CSS
import '../styles.css';
import '../css/responsive.css';
import '../css/mobile-menu.css';
import '../css/back-button.css';

// Core scripts
import './mobile-menu.js';
import './back-button.js';
import './api-client.js';
import './auth-handler.js';

// Checkout-specific
import '../payment.js';
import './payment-calculator.js';
import './payment-total-fix.js';
import './upi-payment-system.js';
import './delivery-charges.js';

// Toast
import './toast.js';

console.log('✅ Checkout page initialized');
