// Edit Modal Fix - Ensure proper modal behavior
class EditModalFix {
    constructor() {
        this.init();
    }
    
    init() {
        // Run after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.ensureModalHidden();
                this.setupModalControls();
            });
        } else {
            this.ensureModalHidden();
            this.setupModalControls();
        }
    }
    
    ensureModalHidden() {
        // Force modal to be hidden on page load
        const modal = document.getElementById('edit-panel');
        const overlay = document.getElementById('edit-overlay');
        
        if (modal) {
            modal.classList.remove('active');
            modal.style.right = '-500px';
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            console.log('✅ Edit modal forced to hidden state');
        }
        
        if (overlay) {
            overlay.classList.remove('active');
            overlay.style.display = 'none';
            overlay.style.opacity = '0';
            console.log('✅ Edit overlay forced to hidden state');
        }
        
        // Remove any body classes that might affect modal
        document.body.classList.remove('modal-open');
    }
    
    setupModalControls() {
        // Ensure close button works properly
        const closeButton = document.querySelector('.close-panel');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }
        
        // Ensure overlay click closes modal
        const overlay = document.getElementById('edit-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });
        }
        
        // Escape key closes modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        console.log('✅ Modal controls setup complete');
    }
    
    closeModal() {
        const modal = document.getElementById('edit-panel');
        const overlay = document.getElementById('edit-overlay');
        
        if (modal) {
            modal.classList.remove('active');
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        // Reset form if it exists
        const form = document.getElementById('edit-product-form');
        if (form) {
            form.reset();
        }
        
        // Remove body scroll lock
        document.body.classList.remove('modal-open');
        
        console.log('✅ Modal closed');
    }
    
    openModal() {
        const modal = document.getElementById('edit-panel');
        const overlay = document.getElementById('edit-overlay');
        
        if (modal) {
            modal.classList.add('active');
        }
        
        if (overlay) {
            overlay.classList.add('active');
        }
        
        // Prevent body scroll
        document.body.classList.add('modal-open');
        
        console.log('✅ Modal opened');
    }
    
    // Override global functions if they exist
    overrideGlobalFunctions() {
        // Override closeEditPanel if it exists
        if (typeof window.closeEditPanel === 'function') {
            const originalClose = window.closeEditPanel;
            window.closeEditPanel = () => {
                this.closeModal();
                if (originalClose) {
                    originalClose();
                }
            };
        } else {
            window.closeEditPanel = () => this.closeModal();
        }
        
        console.log('✅ Global modal functions overridden');
    }
}

// Initialize the modal fix
const modalFix = new EditModalFix();

// Make it globally available
window.editModalFix = modalFix;

// Override global functions after a short delay to ensure they exist
setTimeout(() => {
    modalFix.overrideGlobalFunctions();
}, 500);