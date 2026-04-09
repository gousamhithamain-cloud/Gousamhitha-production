// supabase-init.js — DISABLED
// All data access goes through the backend API (/api/...)
// Direct Supabase access from frontend has been removed for security.
// This file is kept as an empty stub to avoid 404 errors from legacy script tags.

console.log('ℹ️ supabase-init.js: Direct Supabase access disabled. Using backend API.');

// Dispatch supabaseReady so legacy listeners don't hang
document.addEventListener('DOMContentLoaded', function() {
    window.dispatchEvent(new Event('supabaseReady'));
});
