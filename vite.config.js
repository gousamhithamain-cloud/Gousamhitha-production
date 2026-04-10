import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Root directory (current folder)
  publicDir: 'images', // Static assets directory
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        // Keep files in root of dist for static serving
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]'
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
