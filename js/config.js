// API Configuration - Single Source of Truth
// Load this file FIRST before any other scripts

(function() {
    'use strict';
    
    // Set global API base URL - Auto-detect environment
    window.API_BASE_URL = 
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "http://localhost:4000/api"
            : "https://gousamhitha-production.onrender.com/api";
    
    console.log('⚙️ API Config loaded:', window.API_BASE_URL);
    
    // Helper to get API base (for backwards compatibility)
    window.getAPIBase = function() {
        return window.API_BASE_URL;
    };
    
})();
