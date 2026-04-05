// Remove Select All Elements - Per User Request
(function() {
    'use strict';
    
    function removeSelectAllElements() {
        console.log('🗑️ Removing Select All elements...');
        
        // Remove all select all containers
        const selectAllContainers = document.querySelectorAll(`
            .select-all-container,
            .working-select-all,
            [class*="select-all"]
        `);
        
        selectAllContainers.forEach(container => {
            console.log('🗑️ Removing select all container:', container.className);
            container.remove();
        });
        
        // Remove select all checkboxes
        const selectAllCheckboxes = document.querySelectorAll(`
            #select-all-toggle,
            #working-select-all,
            [id*="select-all"]
        `);
        
        selectAllCheckboxes.forEach(checkbox => {
            console.log('🗑️ Removing select all checkbox:', checkbox.id);
            checkbox.closest('.select-all-container, .working-select-all')?.remove();
        });
        
        // Remove selection count displays
        const selectionCounts = document.querySelectorAll(`
            #selection-count,
            #working-selection-count,
            [id*="selection-count"]
        `);
        
        selectionCounts.forEach(count => {
            console.log('🗑️ Removing selection count:', count.id);
            count.remove();
        });
        
        console.log('✅ Select All elements removed');
    }
    
    // Remove immediately
    removeSelectAllElements();
    
    // Remove after DOM loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeSelectAllElements);
    }
    
    // Remove after other scripts load
    setTimeout(removeSelectAllElements, 1000);
    setTimeout(removeSelectAllElements, 3000);
    setTimeout(removeSelectAllElements, 5000);
    
    // Watch for new elements being added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Check if the added node is a select all element
                    if (node.classList && (
                        node.classList.contains('select-all-container') ||
                        node.classList.contains('working-select-all') ||
                        node.id === 'select-all-toggle' ||
                        node.id === 'working-select-all'
                    )) {
                        console.log('🗑️ Removing dynamically added select all element:', node);
                        node.remove();
                    }
                    
                    // Check for select all elements within the added node
                    const selectAllElements = node.querySelectorAll && node.querySelectorAll(`
                        .select-all-container,
                        .working-select-all,
                        #select-all-toggle,
                        #working-select-all,
                        [class*="select-all"],
                        [id*="select-all"]
                    `);
                    
                    if (selectAllElements && selectAllElements.length > 0) {
                        selectAllElements.forEach(element => {
                            console.log('🗑️ Removing nested select all element:', element);
                            element.remove();
                        });
                    }
                }
            });
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Select All removal system active');
})();