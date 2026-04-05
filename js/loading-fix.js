// Loading Fix - Remove duplicate loading messages
(function() {
    'use strict';
    
    console.log('🔄 Loading fix system initializing...');
    
    // Track loading states to prevent duplicates
    const loadingStates = new Map();
    const loadingTimeouts = new Map();
    
    // Override common loading functions
    window.showLoadingFixed = function(containerId, message = 'Loading...') {
        const container = document.getElementById(containerId) || document.querySelector(containerId);
        if (!container) return;
        
        // Check if already loading
        if (loadingStates.get(containerId)) {
            console.log('⚠️ Already loading for:', containerId);
            return;
        }
        
        loadingStates.set(containerId, true);
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #666;">${message}</div>`;
    };
    
    window.hideLoadingFixed = function(containerId) {
        loadingStates.delete(containerId);
    };
    
    // Prevent multiple loading calls for the same table
    const originalLoadFunctions = {};
    
    // Override loadProductsTable to prevent duplicates
    if (window.loadProductsTable) {
        originalLoadFunctions.loadProductsTable = window.loadProductsTable;
        window.loadProductsTable = function() {
            if (loadingStates.get('products-table')) {
                console.log('🚫 Products table already loading, skipping...');
                return;
            }
            loadingStates.set('products-table', true);
            
            return originalLoadFunctions.loadProductsTable().finally(() => {
                loadingStates.delete('products-table');
            });
        };
    }
    
    // Override loadVendorsTable to prevent duplicates
    if (window.loadVendorsTable) {
        originalLoadFunctions.loadVendorsTable = window.loadVendorsTable;
        window.loadVendorsTable = function() {
            if (loadingStates.get('vendors-table')) {
                console.log('🚫 Vendors table already loading, skipping...');
                return;
            }
            loadingStates.set('vendors-table', true);
            
            return originalLoadFunctions.loadVendorsTable().finally(() => {
                loadingStates.delete('vendors-table');
            });
        };
    }
    
    // Override loadOrdersTable to prevent duplicates
    if (window.loadOrdersTable) {
        originalLoadFunctions.loadOrdersTable = window.loadOrdersTable;
        window.loadOrdersTable = function() {
            if (loadingStates.get('orders-table')) {
                console.log('🚫 Orders table already loading, skipping...');
                return;
            }
            loadingStates.set('orders-table', true);
            
            return originalLoadFunctions.loadOrdersTable().finally(() => {
                loadingStates.delete('orders-table');
            });
        };
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
            if (row.textContent.includes('Loading...') && row.children.length === 1) {
                const cell = row.children[0];
                if (cell && cell.textContent.trim().startsWith('Loading')) {
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
                
                rows.forEach(row => {
                    if (row.textContent.includes('Loading...')) {
                        loadingRowCount++;
                        // Keep only the first loading row, remove others
                        if (loadingRowCount > 1) {
                            row.remove();
                        }
                    }
                });
                
                if (loadingRowCount > 1) {
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
                    row.textContent.includes('Loading...') || row.textContent.includes('Loading')
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
    
    // Override setTimeout to prevent multiple loading calls
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(callback, delay) {
        // Check if callback contains loading logic
        const callbackStr = callback.toString();
        if (callbackStr.includes('Loading...') && delay < 1000) {
            console.log('🚫 Blocked duplicate loading timeout');
            return;
        }
        return originalSetTimeout.call(this, callback, delay);
    };
    
    // Clean up function
    function performCleanup() {
        removeExistingLoadingMessages();
        cleanTableLoadingMessages();
        fixAdminDashboardLoading();
    }
    
    // Run cleanup immediately
    performCleanup();
    
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
    setInterval(performCleanup, 3000);
    
    // Override common loading functions used in admin
    window.showLoading = function(message) {
        // Do nothing - prevent showing loading
        console.log('🚫 Blocked loading message:', message);
    };
    
    // Override table loading functions
    window.showTableLoading = function(tableId) {
        console.log('🚫 Blocked table loading for:', tableId);
    };
    
    // Add function to check if table is empty and should show "no data" message
    window.checkEmptyTable = function(tableId, emptyMessage) {
        const tbody = document.getElementById(tableId);
        if (tbody && tbody.children.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">${emptyMessage}</td></tr>`;
        }
    };
    
    console.log('✅ Loading fix system initialized');
})();