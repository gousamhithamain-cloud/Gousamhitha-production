// Comprehensive Select All Disabler - Per User Request
(function() {
    'use strict';
    
    console.log('🚫 Disabling Select All functionality completely...');
    
    // Override any select all related functions
    window.handleSelectAll = function() {
        console.log('🚫 Select All function disabled per user request');
        return false;
    };
    
    // Disable select all in any cart selection systems
    function disableSelectAllInSystems() {
        // Disable in working cart selection
        if (window.workingCartSelection) {
            window.workingCartSelection.handleSelectAll = function() {
                console.log('🚫 Working cart select all disabled');
                return false;
            };
            window.workingCartSelection.addSelectAllToggle = function() {
                console.log('🚫 Working cart select all toggle creation disabled');
                return;
            };
            window.workingCartSelection.updateSelectAllState = function() {
                console.log('🚫 Working cart select all state update disabled');
                return;
            };
        }
        
        // Disable in selective checkout handler
        if (window.selectiveCheckoutHandler) {
            window.selectiveCheckoutHandler.handleSelectAll = function() {
                console.log('🚫 Selective checkout select all disabled');
                return false;
            };
            window.selectiveCheckoutHandler.setupSelectAllToggle = function() {
                console.log('🚫 Selective checkout select all toggle setup disabled');
                return;
            };
            window.selectiveCheckoutHandler.updateSelectAllToggle = function() {
                console.log('🚫 Selective checkout select all toggle update disabled');
                return;
            };
        }
        
        // Disable in enhanced cart system
        if (window.enhancedCartSystem) {
            window.enhancedCartSystem.handleSelectAll = function() {
                console.log('🚫 Enhanced cart select all disabled');
                return false;
            };
        }
    }
    
    // Remove all select all elements and checkboxes
    function removeAllSelectAllElements() {
        const selectAllSelectors = [
            '.select-all-container',
            '.working-select-all',
            '#select-all-toggle',
            '#working-select-all',
            '#selection-count',
            '#working-selection-count',
            '[class*="select-all"]',
            '[id*="select-all"]',
            'label[for*="select-all"]',
            // Also remove individual checkboxes
            '.cart-item-checkbox',
            '.working-item-checkbox',
            '.cart-item-selection',
            '.working-item-selection'
        ];
        
        selectAllSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    console.log('🗑️ Removing element:', element.className || element.id);
                    element.remove();
                });
            } catch (e) {
                // Ignore selector errors
            }
        });
        
        // Also remove padding from cart items that had checkboxes
        const cartItems = document.querySelectorAll('.cart-item');
        cartItems.forEach(item => {
            item.style.paddingLeft = '0px';
        });
    }
    
    // Add CSS to hide any remaining select all elements
    function addHidingCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Force hide all select all elements and checkboxes */
            .select-all-container,
            .working-select-all,
            #select-all-toggle,
            #working-select-all,
            #selection-count,
            #working-selection-count,
            [class*="select-all"],
            [id*="select-all"],
            label[for*="select-all"],
            .cart-item-checkbox,
            .working-item-checkbox,
            .cart-item-selection,
            .working-item-selection {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
            }
            
            /* Reset cart item padding */
            .cart-item {
                padding-left: 0px !important;
            }
            
            /* Ensure cart items don't have extra spacing */
            .cart-items,
            #cart-items {
                margin-top: 0 !important;
                padding-top: 0 !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Added CSS to hide select all elements');
    }
    
    // Main execution function
    function executeDisabling() {
        removeAllSelectAllElements();
        disableSelectAllInSystems();
        addHidingCSS();
        console.log('✅ Select All functionality completely disabled');
    }
    
    // Execute immediately
    executeDisabling();
    
    // Execute after DOM loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executeDisabling);
    }
    
    // Execute after other scripts load
    setTimeout(executeDisabling, 500);
    setTimeout(executeDisabling, 1500);
    setTimeout(executeDisabling, 3000);
    
    // Watch for dynamically added select all elements
    const observer = new MutationObserver((mutations) => {
        let shouldExecute = false;
        
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Check if it's a select all element or checkbox
                    if (node.classList && (
                        node.classList.contains('select-all-container') ||
                        node.classList.contains('working-select-all') ||
                        node.classList.contains('cart-item-checkbox') ||
                        node.classList.contains('working-item-checkbox') ||
                        node.classList.contains('cart-item-selection') ||
                        node.classList.contains('working-item-selection') ||
                        Array.from(node.classList).some(cls => cls.includes('select-all'))
                    )) {
                        shouldExecute = true;
                    }
                    
                    // Check if it has select all elements inside
                    if (node.querySelectorAll) {
                        const selectAllElements = node.querySelectorAll(`
                            .select-all-container,
                            .working-select-all,
                            .cart-item-checkbox,
                            .working-item-checkbox,
                            .cart-item-selection,
                            .working-item-selection,
                            [class*="select-all"],
                            [id*="select-all"]
                        `);
                        if (selectAllElements.length > 0) {
                            shouldExecute = true;
                        }
                    }
                }
            });
        });
        
        if (shouldExecute) {
            console.log('🔄 Detected new select all elements, removing...');
            setTimeout(executeDisabling, 100);
        }
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Select All disabler system active and monitoring');
})();