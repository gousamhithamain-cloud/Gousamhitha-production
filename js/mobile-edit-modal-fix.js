// Mobile Edit Modal Fix - Ensures edit modal works perfectly on mobile

class MobileEditModalFix {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupMobileModal();
            });
        } else {
            this.setupMobileModal();
        }
        
        // Listen for window resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            this.setupMobileModal();
        });
    }
    
    setupMobileModal() {
        console.log('🔧 Setting up mobile edit modal...');
        
        // Ensure modal elements exist
        this.ensureModalElements();
        
        // Force modal to be hidden initially
        this.forceModalHidden();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Override global edit functions
        this.overrideEditFunctions();
        
        console.log('✅ Mobile edit modal setup complete');
    }
    
    ensureModalElements() {
        // Ensure modal exists
        let modal = document.getElementById('edit-panel');
        if (!modal) {
            console.warn('⚠️ Edit panel not found, modal may not work');
            return;
        }
        
        // Ensure overlay exists
        let overlay = document.getElementById('edit-overlay');
        if (!overlay) {
            console.warn('⚠️ Edit overlay not found, creating one...');
            overlay = document.createElement('div');
            overlay.id = 'edit-overlay';
            overlay.className = 'edit-overlay';
            document.body.appendChild(overlay);
        }
        
        console.log('✅ Modal elements verified');
    }
    
    forceModalHidden() {
        const modal = document.getElementById('edit-panel');
        const overlay = document.getElementById('edit-overlay');
        
        if (modal) {
            modal.classList.remove('active');
            if (this.isMobile) {
                modal.style.transform = 'translateX(100%)';
            } else {
                modal.style.right = '-500px';
            }
            modal.style.opacity = '1';
            modal.style.visibility = 'visible';
        }
        
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
            overlay.style.opacity = '0';
        }
        
        // Remove body scroll lock
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.position = '';
        
        console.log('✅ Modal forced to hidden state');
    }
    
    setupEventListeners() {
        try {
            // Close button
            const closeButton = document.querySelector('.close-panel');
            if (closeButton) {
                closeButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.closeModal();
                });
            } else {
                console.warn('⚠️ Close button not found');
            }
            
            // Overlay click
            const overlay = document.getElementById('edit-overlay');
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.closeModal();
                    }
                });
            } else {
                console.warn('⚠️ Edit overlay not found');
            }
            
            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                }
            });
            
            console.log('✅ Mobile modal event listeners setup');
        } catch (error) {
            console.error('❌ Error setting up mobile modal event listeners:', error);
        }
    }
    
    openModal() {
        console.log('📱 Opening mobile edit modal...');
        
        const modal = document.getElementById('edit-panel');
        const overlay = document.getElementById('edit-overlay');
        
        if (!modal) {
            console.error('❌ Modal not found!');
            return;
        }
        
        // Show overlay first
        if (overlay) {
            overlay.style.display = 'block';
            overlay.classList.add('active');
        }
        
        // Show modal
        modal.classList.add('active');
        
        // Prevent body scroll on mobile
        if (this.isMobile) {
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
        
        console.log('✅ Mobile modal opened successfully');
    }
    
    closeModal() {
        console.log('📱 Closing mobile edit modal...');
        
        const modal = document.getElementById('edit-panel');
        const overlay = document.getElementById('edit-overlay');
        
        if (modal) {
            modal.classList.remove('active');
        }
        
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
        
        // Reset form
        const form = document.getElementById('edit-product-form');
        if (form) {
            form.reset();
        }
        
        // Restore body scroll
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        
        console.log('✅ Mobile modal closed successfully');
    }
    
    overrideEditFunctions() {
        try {
            // Override the global editProduct function
            const originalEditProduct = window.editProduct;
            
            window.editProduct = async (productId) => {
                console.log('📱 Mobile editProduct called for:', productId);
                
                try {
                    // Call original function first to populate form
                    if (originalEditProduct && typeof originalEditProduct === 'function') {
                        await originalEditProduct(productId);
                    }
                    
                    // Then open modal with mobile-specific handling
                    setTimeout(() => {
                        this.openModal();
                    }, 100);
                } catch (error) {
                    console.error('❌ Error in mobile editProduct:', error);
                }
            };
            
            // Override closeEditPanel
            window.closeEditPanel = () => {
                try {
                    this.closeModal();
                } catch (error) {
                    console.error('❌ Error in closeEditPanel:', error);
                }
            };
            
            console.log('✅ Edit functions overridden for mobile');
        } catch (error) {
            console.error('❌ Error overriding edit functions:', error);
        }
    }
    
    // Debug method
    debugModal() {
        const modal = document.getElementById('edit-panel');
        const overlay = document.getElementById('edit-overlay');
        
        console.log('🔍 Modal Debug Info:');
        console.log('Is Mobile:', this.isMobile);
        console.log('Modal Element:', modal);
        console.log('Modal Classes:', modal ? modal.className : 'N/A');
        console.log('Modal Style:', modal ? modal.style.cssText : 'N/A');
        console.log('Overlay Element:', overlay);
        console.log('Overlay Classes:', overlay ? overlay.className : 'N/A');
        
        if (modal) {
            modal.classList.add('debug-mobile');
        }
    }
}

// Initialize mobile modal fix
const mobileEditModalFix = new MobileEditModalFix();

// Make it globally available
window.mobileEditModalFix = mobileEditModalFix;

// Auto-debug on mobile (remove in production)
if (window.innerWidth <= 768) {
    setTimeout(() => {
        console.log('📱 Mobile Edit Modal Fix loaded and ready');
        // Uncomment for debugging: mobileEditModalFix.debugModal();
    }, 1000);
}

console.log('📱 Mobile Edit Modal Fix initialized');