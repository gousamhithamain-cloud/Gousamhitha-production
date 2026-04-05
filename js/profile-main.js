/**
 * Entry Point for profile.html
 */

// Import CSS
import '../styles.css';
import '../css/responsive.css';
import '../css/mobile-menu.css';
import '../css/back-button.css';
import '../css/bottom-nav.css';

// Core scripts
import './mobile-menu.js';
import './bottom-nav.js';
import './back-button.js';
import './api-client.js';
import './auth-handler.js';

// Profile-specific
import '../profile-supabase.js';
import './profile-handler.js';

// Toast
import './toast.js';

console.log('✅ Profile page initialized');
