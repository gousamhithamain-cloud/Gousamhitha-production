import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.', // Root directory (current folder)
  publicDir: 'images', // Static assets directory
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    
    rollupOptions: {
      input: {
        // Main pages
        main: resolve(__dirname, 'index.html'),
        shop: resolve(__dirname, 'shop.html'),
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        product: resolve(__dirname, 'product.html'),
        
        // Auth pages
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'signup.html'),
        profile: resolve(__dirname, 'profile.html'),
        
        // Info pages
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        donations: resolve(__dirname, 'donations.html'),
        gowshala: resolve(__dirname, 'gowshala.html'),
        'how-to-use': resolve(__dirname, 'how-to-use.html'),
        'privacy-policy': resolve(__dirname, 'privacy-policy.html'),
        terms: resolve(__dirname, 'terms.html'),
        
        // Order pages
        orders: resolve(__dirname, 'orders.html'),
        
        // Admin pages
        'admin-dashboard': resolve(__dirname, 'admin-dashboard.html'),
        'admin-products': resolve(__dirname, 'admin-products.html'),
        'admin-add-product': resolve(__dirname, 'admin-add-product.html'),
        'admin-orders': resolve(__dirname, 'admin-orders.html'),
        'admin-vendors': resolve(__dirname, 'admin-vendors.html'),
        'admin-deliveries': resolve(__dirname, 'admin-deliveries.html'),
        'admin-delivery-settings': resolve(__dirname, 'admin-delivery-settings.html'),
        'admin-payouts': resolve(__dirname, 'admin-payouts.html'),
        'admin-debug': resolve(__dirname, 'admin-debug.html'),
      },
      
      output: {
        // Organize output files
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    },
    
    // Optimize chunks
    chunkSizeWarningLimit: 1000,
    
    // Source maps for debugging
    sourcemap: false, // Set to true for debugging
  },
  
  server: {
    port: 5173,
    strictPort: false,
    open: true, // Auto-open browser
    
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      }
    },
    
    // CORS configuration
    cors: true,
  },
  
  preview: {
    port: 4173,
    strictPort: false,
    open: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [],
    exclude: []
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
  },
});
