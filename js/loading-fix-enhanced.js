// Enhanced Loading Fix - Remove duplicate loading messages from all admin pages
(function() {
    'use strict';
    
    console.log('🔄 Enhanced loading fix system initializing...');
    
    // Track loading states to prevent duplicates
    const loadingStates = new Map();
    const loadingTimeouts = new Map();
    
    // Store original functions to prevent infinite loops
    const originalFunctions = {};
    
    // Function to wrap loading functions with duplicate prevention
    function wrapLoadingFunction(functionName, tableKey) {
        if (window[functionName] && !originalFunctions[functionName]) {
            originalFunctions[functionName] = window[functionName];
            
            window[functionName] = async function(...args) {
                if (loadingStates.get(tableKey)) {
                    console.log(`🚫 ${functionName} already loading, skipping...`);
                    return;
                }
                
                loadingStates.set(tableKey, true);
                
                try {
                    const result = await originalFunctions[functionName].apply(this, args);
                    return result;
                } finally {
                    setTimeout(() => {
                        loadingStates.delete(tableKey);
                    }, 500);
                }
            };
            
            console.log(`✅ Wrapped ${functionName} with loading prevention`);
        }
    }
    
    // Wrap all possible loading functions
    function wrapAllLoadingFunctions() {
        // Main admin script functions
        wrapLoadingFunction('loadProductsTable', 'products-table');
        wrapLoadingFunction('loadVendorsTable', 'vendors-table');
        wrapLoadingFunction('loadOrdersTable', 'orders-table');
        
        // Individual page functions
        wrapLoadingFunction('loadProducts', 'products-page');
        wrapLoadingFunction('loadVendors', 'vendors-page');
        wrapLoadingFunction('loadOrders', 'orders-page');
        wrapLoadingFunction('loadPayouts', 'payouts-page');
    }
    
    // Remove existing loading messages immediately
    function removeExistingLoadingMessages() {
        // Find all elements containing "Loading..."
        const allElements = document.querySelectorAll('*');
        let removedCount = 0;
        
        allElements.forEach(element => {
            if (element.textContent && element.textContent.trim() === 'Loading...') {
                // Check if it's a standalone loading message
                if (element.children.length === 0 && element.textContent.trim() === 'Loading...') {
                    element.remove();
                    removedCount++;
                }
            }
        });
        
        // Also remove loading table rows
        const loadingRows = document.querySelectorAll('tr');
        loadingRows.forEach(row => {
            if (row.textContent.includes('Loading') && row.children.length === 1) {
                const cell = row.children[0];
                if (cell && (cell.textContent.trim().startsWith('Loading') || cell.textContent.trim() === 'Loading...')) {
                    row.remove();
                    removedCount++;
                }
            }
        });
        
        if (removedCount > 0) {
            console.log('🧹 Removed', removedCount, 'duplicate loading messages');
        }
    }
    
    // Clean up loading messages in tables specifically
    function cleanTableLoadingMessages() {
        const tableIds = ['products-table-body', 'vendors-table-body', 'orders-table-body', 'payouts-table-body'];
        
        tableIds.forEach(tableId => {
            const tbody = document.getElementById(tableId);
            if (tbody) {
                const rows = tbody.querySelectorAll('tr');
                let loadingRowCount = 0;
                const loadingRows = [];
                
                rows.forEach(row => {
                    if (row.textContent.includes('Loading')) {
                        loadingRowCount++;
                        loadingRows.push(row);
                    }
                });
                
                // Keep only the first loading row, remove others
                if (loadingRowCount > 1) {
                    for (let i = 1; i < loadingRows.length; i++) {
                        loadingRows[i].remove();
                    }
                    console.log(`🧹 Cleaned ${loadingRowCount - 1} duplicate loading rows from ${tableId}`);
                }
            }
        });
    }
    
    // Fix admin dashboard loading issues
    function fixAdminDashboardLoading() {
        // Remove duplicate loading messages from specific tables
        const tables = [
            { id: 'products-table-body', name: 'products' },
            { id: 'vendors-table-body', name: 'vendors' },
            { id: 'orders-table-body', name: 'orders' },
            { id: 'payouts-table-body', name: 'payouts' }
        ];
        
        tables.forEach(table => {
            const tbody = document.getElementById(table.id);
            if (tbody) {
                const loadingRows = Array.from(tbody.querySelectorAll('tr')).filter(row => 
                    row.textContent.includes('Loading') || row.textContent.includes('loading')
                );
                
                // Keep only the first loading row, remove others
                if (loadingRows.length > 1) {
                    for (let i = 1; i < loadingRows.length; i++) {
                        loadingRows[i].remove();
                    }
                    console.log(`🧹 Removed ${loadingRows.length - 1} duplicate loading rows from ${table.name} table`);
                }
            }
        });
    }
    
    // Clean up function
    function performCleanup() {
        removeExistingLoadingMessages();
        cleanTableLoadingMessages();
        fixAdminDashboardLoading();
    }
    
    // Initialize function wrapping
    function initializeLoadingFix() {
        wrapAllLoadingFunctions();
        performCleanup();
        
        // Try again after a delay to catch dynamically loaded functions
        setTimeout(() => {
            wrapAllLoadingFunctions();
            performCleanup();
        }, 1000);
        
        setTimeout(() => {
            wrapAllLoadingFunctions();
            performCleanup();
        }, 3000);
    }
    
    // Run cleanup immediately
    initializeLoadingFix();
    
    // Run cleanup after DOM changes
    const observer = new MutationObserver(function(mutations) {
        let shouldCleanup = false;
        
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.textContent && node.textContent.includes('Loading')) {
                    shouldCleanup = true;
                }
            });
        });
        
        if (shouldCleanup) {
            // Debounce cleanup calls
            clearTimeout(loadingTimeouts.get('cleanup'));
            loadingTimeouts.set('cleanup', setTimeout(performCleanup, 100));
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Clean up periodically
    setInterval(performCleanup, 2000);
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLoadingFix);
    } else {
        initializeLoadingFix();
    }
    
    // Also initialize when Supabase is ready
    window.addEventListener('supabaseReady', () => {
        setTimeout(initializeLoadingFix, 500);
    });
    
    console.log('✅ Enhanced loading fix system initialized');
})();