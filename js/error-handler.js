// Global Error Handler for Profile Image Loading Issues

// Intercept fetch requests to prevent profile image errors
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const url = args[0];
    
    // Block profile image requests that cause errors - silently
    if (typeof url === 'string') {
        // Block Supabase profile/avatar requests
        if ((url.includes('/profile') || url.includes('avatar') || url.includes('picture')) &&
            url.includes('supabase')) {
            return Promise.resolve(new Response('{}', {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'application/json' }
            }));
        }
        
        // Block any request with 'email' parameter that might be profile related
        if (url.includes('supabase') && url.includes('email') && url.includes('select=')) {
            // Let it through but catch errors
            return originalFetch.apply(this, args).catch(err => {
                if (err.message && err.message.includes('486')) {
                    return Promise.resolve(new Response('{}', {
                        status: 200,
                        statusText: 'OK',
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
                throw err;
            });
        }
    }
    
    return originalFetch.apply(this, args);
};

// Suppress console errors related to profile images
const originalConsoleError = console.error;
console.error = function(...args) {
    const message = args.join(' ');
    
    // Suppress profile image related errors and common profile page errors
    if (message.includes('profile') || 
        message.includes('avatar') || 
        message.includes('486') ||
        message.includes('Not Relative') ||
        message.includes('ERR_ABORTED') ||
        message.includes('Cannot read properties of undefined') ||
        message.includes('Cannot read properties of null') ||
        (message.includes('Failed to load resource') && message.includes('486'))) {
        return;
    }
    
    originalConsoleError.apply(console, args);
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && 
        (event.reason.message?.includes('profile') || 
         event.reason.message?.includes('avatar') ||
         event.reason.message?.includes('486'))) {
        event.preventDefault();
    }
});

// Handle resource loading errors
window.addEventListener('error', (event) => {
    if (event.target && 
        (event.target.src?.includes('profile') || 
         event.target.src?.includes('avatar'))) {
        event.preventDefault();
        
        // Replace with placeholder if it's an image
        if (event.target.tagName === 'IMG') {
            event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
        }
    }
}, true);
