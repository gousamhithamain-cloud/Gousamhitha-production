// Nhost Client Configuration (CDN Version - No Build Required)
// This version loads Nhost from CDN and works without npm install

// Load Nhost from CDN
const script = document.createElement('script');
script.type = 'module';
script.textContent = `
    import { NhostClient } from 'https://cdn.jsdelivr.net/npm/@nhost/nhost-js@2.2.3/+esm';
    
    // Initialize Nhost client
    const nhost = new NhostClient({
        subdomain: "mplmzjcwaxqmtyngivxf",
        region: "ap-south-1"
    });
    
    // Make globally available
    window.nhost = nhost;
    window.nhostAuth = nhost.auth;
    
    // Helper functions
    window.isLoggedIn = function() {
        return nhost.auth.isAuthenticated();
    };
    
    window.getCurrentUser = function() {
        return nhost.auth.getUser();
    };
    
    window.getSession = function() {
        return nhost.auth.getSession();
    };
    
    window.getAccessToken = function() {
        const session = nhost.auth.getSession();
        return session?.accessToken || null;
    };
    
    console.log('✅ Nhost client initialized (CDN)');
    console.log('📍 Subdomain: mplmzjcwaxqmtyngivxf');
    console.log('🔗 GraphQL: https://mplmzjcwaxqmtyngivxf.nhost.run/v1/graphql');
    
    // Dispatch event to signal Nhost is ready
    window.dispatchEvent(new Event('nhostReady'));
`;

document.head.appendChild(script);
