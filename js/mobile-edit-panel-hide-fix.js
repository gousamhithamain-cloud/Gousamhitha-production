// Mobile Edit Panel Hide Fix - Ensure edit panel is hidden on page load
(function() {
    'use strict';
    
    console.log('🔧 Mobile edit panel hide fix initializing...');
    
    // Function to force hide edit panel
    function forceHideEditPanel() {
        const editPanel = document.getElementById('edit-panel');
        const editOverlay = document.getElementById('edit-overlay');
        
        if (editPanel) {
            editPanel.classList.remove('active');
            editPanel.style.right = '-100%';
            editPanel.style.opacity = '0';
            editPanel.style.visibility = 'hidden';
            console.log('✅ Edit panel hidden');
        }
        
        if (editOverlay) {
            editOverlay.classList.remove('active');
            editOverlay.style.opacity = '0';
            editOverlay.style.visibility = 'hidden';
            console.log('✅ Edit overlay hidden');
        }
        
        // Remove any body classes that might be keeping it open
        document.body.classList.remove('edit-panel-open');
    }
    
    // Function to properly show edit panel
    function showEditPanel() {
        const editPanel = document.getElementById('edit-panel');
        const editOverlay = document.getElementById('edit-overlay');
        
        if (editPanel && editOverlay) {
            editOverlay.classList.add('active');
            editPanel.classList.add('active');
            document.body.classList.add('edit-panel-open');
            console.log('✅ Edit panel shown');
        }
    }
    
    // Function to properly hide edit panel
    function hideEditPanel() {
        const editPanel = document.getElementById('edit-panel');
        const editOverlay = document.getElementById('edit-overlay');
        
        if (editPanel) {
            editPanel.classList.remove('active');
        }
        
        if (editOverlay) {
            editOverlay.classList.remove('active');
        }
        
        document.body.classList.remove('edit-panel-open');
        console.log('✅ Edit panel hidden');
    }
    
    // Override the global closeEditPanel function
    window.closeEditPanel = function() {
        hideEditPanel();
        
        // Reset form if it exists
        const form = document.getElementById('edit-product-form');
        if (form) {
            form.reset();
        }
        
        // Clear editing product ID
        if (window.editingProductId) {
            window.editingProductId = null;
        }
    };
    
    // Override the editProduct function to use proper show/hide
    const originalEditProduct = window.editProduct;
    if (originalEditProduct) {
        window.editProduct = function(productId) {
            console.log('🔧 Opening edit panel for product:', productId);
            
            // Call original function
            originalEditProduct(productId);
            
            // Ensure proper display
            setTimeout(() => {
                showEditPanel();
            }, 100);
        };
    }
    
    // Force hide on page load
    function initializeHideFix() {
        forceHideEditPanel();
        
        // Set up event listeners
        document.addEventListener('click', function(e) {
            // If clicking outside edit panel, close it
            if (e.target.classList.contains('edit-overlay')) {
                hideEditPanel();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hideEditPanel();
            }
        });
    }
    
    // Initialize immediately
    initializeHideFix();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeHideFix);
    } else {
        initializeHideFix();
    }
    
    // Also initialize after a delay to catch any late-loading elements
    setTimeout(initializeHideFix, 1000);
    
    // Periodic check to ensure edit panel stays hidden when it should be
    setInterval(() => {
        const editPanel = document.getElementById('edit-panel');
        if (editPanel && !editPanel.classList.contains('active')) {
            // If panel doesn't have active class but is visible, force hide it
            if (editPanel.style.right !== '-100%') {
                forceHideEditPanel();
                console.log('🔧 Forced hide of accidentally visible edit panel');
            }
        }
    }, 2000);
    
    console.log('✅ Mobile edit panel hide fix initialized');
})();