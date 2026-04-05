// Nhost Client Configuration
// Configured with Nhost credentials

import { NhostClient } from "@nhost/nhost-js";

// Initialize Nhost client with your project credentials
export const nhost = new NhostClient({
    subdomain: "mplmzjcwaxqmtyngivxf",           // Your Nhost subdomain
    region: "eu-central-1"              // Your Nhost region
});

// Export auth methods for convenience
export const auth = nhost.auth;

// Nhost connection details
export const NHOST_CONFIG = {
    subdomain: "mplmzjcwaxqmtyngivxf",
    region: "eu-central-1",
    graphqlEndpoint: "https://mplmzjcwaxqmtyngivxf.eu-central-1.nhost.run/v1/graphql",
    backendUrl: "https://mplmzjcwaxqmtyngivxf.eu-central-1.nhost.run"
};

// Helper function to check if user is logged in
export function isLoggedIn() {
    return nhost.auth.isAuthenticated();
}

// Helper function to get current user
export function getCurrentUser() {
    return nhost.auth.getUser();
}

// Helper function to get session
export function getSession() {
    return nhost.auth.getSession();
}

// Helper function to get access token
export function getAccessToken() {
    const session = nhost.auth.getSession();
    return session?.accessToken || null;
}

console.log('✅ Nhost client initialized');
console.log('📍 Subdomain: mplmzjcwaxqmtyngivxf');
console.log('🌍 Region: eu-central-1');
console.log('🔗 GraphQL: https://mplmzjcwaxqmtyngivxf.eu-central-1.nhost.run/v1/graphql');
