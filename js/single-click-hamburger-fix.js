// Single Click Hamburger Menu Fix
// Ensures hamburger menu works on first click

class SingleClickHamburgerFix {
    constructor() {
        this.isMenuOpen = false;
        this.isInitialized = false;
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
        
        // Fallback setup after delay
        setTimeout(() => {
            if (!this.isInitialized) {
                this.setup();
            }
        }, 1000);
    }
    
    setup() {
        try {
            console.log('🔧 Setting up single-click hamburger menu...');
            
            // Only run on mobile
            if (window.innerWidth > 768) {
                console.log('📱 Desktop detected, skipping hamburger setup');
                return;
            }
            
            // Remove any existing event listeners to prevent conflicts
            this.removeExistingListeners();
            
            // Ensure elements exist
            this.ensureElements();
            
            // Setup single event listener
            this.setupSingleEventListener();
            
            // Ensure menu is closed initially
            this.forceCloseMenu();
            
            this.isInitialized = true;
            console.log('✅ Single-click hamburger menu setup complete');
            
        } catch (error) {
            console.error('❌ Error in hamburger setup:', error);
        }
    }
    
    removeExistingListeners() {
        try {
            // Remove existing hamburger buttons to prevent conflicts
            const existingToggles = document.querySelectorAll('.mobile-menu-toggle');
            existingToggles.forEach((toggle, index) => {
                if (index > 0) { // Keep only the first one
                    toggle.remove();
                }
            });
            
            console.log('🧹 Cleaned up duplicate hamburger buttons');
        } catch (error) {
            console.error('❌ Error removing existing listeners:', error);
        }
    }
    
    ensureElements() {
        try {
            // Ensure hamburger button exists
            let toggle = document.querySelector('.mobile-menu-toggle');
            if (!toggle) {
                toggle = document.createElement('button');
                toggle.className = 'mobile-menu-toggle';
                toggle.setAttribute('aria-label', 'Toggle navigation menu');
                toggle.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                `;
                document.body.appendChild(toggle);
                console.log('✅ Hamburger button created');
            }
            
            // Ensure overlay exists
            let overlay = document.querySelector('.mobile-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'mobile-overlay';
                overlay.setAttribute('aria-hidden', 'true');
                document.body.appendChild(overlay);
                console.log('✅ Mobile overlay created');
            }
            
            // Ensure sidebar exists
            const sidebar = document.querySelector('.admin-sidebar');
            if (!sidebar) {
                console.warn('⚠️ Admin sidebar not found');
            }
            
        } catch (error) {
            console.error('❌ Error ensuring elements:', error);
        }
    }
    
    setupSingleEventListener() {
        try {
            const toggle = document.querySelector('.mobile-menu-toggle');
            const overlay = document.querySelector('.mobile-overlay');
            
            if (!toggle) {
                console.error('❌ Hamburger button not found');
                return;
            }
            
            // Remove any existing event listeners by cloning the element
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
            
            // Add single click event listener
            newToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });
            
            // Overlay click to close
            if (overlay) {
                const newOverlay = overlay.cloneNode(true);
                overlay.parentNode.replaceChild(newOverlay, overlay);
                
                newOverlay.addEventListener('click', (e) => {
                    if (e.target === newOverlay) {
                        this.closeMenu();
                    }
                });
            }
            
            // Escape key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isMenuOpen) {
                    this.closeMenu();
                }
            });
            
            // Close menu when nav links are clicked
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.isMenuOpen) {
                        this.closeMenu();
                    }
                });
            });
            
            console.log('✅ Single event listener attached to hamburger');
            
        } catch (error) {
            console.error('❌ Error setting up event listener:', error);
        }
    }
    
    toggleMenu() {
        try {
            console.log('🍔 Hamburger clicked, current state:', this.isMenuOpen ? 'open' : 'closed');
            
            if (this.isMenuOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        } catch (error) {
            console.error('❌ Error toggling menu:', error);
        }
    }
    
    openMenu() {
        try {
            const sidebar = document.querySelector('.admin-sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            
            if (!sidebar) {
                console.error('❌ Sidebar not found for opening');
                return;
            }
            
            // Show overlay first
            if (overlay) {
                overlay.style.display = 'block';
                overlay.classList.add('active');
                // Force reflow
                overlay.offsetHeight;
                overlay.style.opacity = '1';
            }
            
            // Show sidebar
            sidebar.classList.add('mobile-active');
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            this.isMenuOpen = true;
            
            console.log('✅ Menu opened successfully');
            
        } catch (error) {
            console.error('❌ Error opening menu:', error);
        }
    }
    
    closeMenu() {
        try {
            const sidebar = document.querySelector('.admin-sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            
            if (sidebar) {
                sidebar.classList.remove('mobile-active');
            }
            
            if (overlay) {
                overlay.classList.remove('active');
                overlay.style.opacity = '0';
                
                // Hide overlay after animation
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 300);
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            
            this.isMenuOpen = false;
            
            console.log('✅ Menu closed successfully');
            
        } catch (error) {
            console.error('❌ Error closing menu:', error);
        }
    }
    
    forceCloseMenu() {
        try {
            // Ensure menu starts in closed state
            const sidebar = document.querySelector('.admin-sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            
            if (sidebar) {
                sidebar.classList.remove('mobile-active');
            }
            
            if (overlay) {
                overlay.classList.remove('active');
                overlay.style.display = 'none';
                overlay.style.opacity = '0';
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            
            this.isMenuOpen = false;
            
            console.log('✅ Menu forced to closed state');
            
        } catch (error) {
            console.error('❌ Error forcing menu closed:', error);
        }
    }
    
    // Public method for debugging
    debug() {
        console.log('🔍 Hamburger Menu Debug:');
        console.log('Is Initialized:', this.isInitialized);
        console.log('Is Menu Open:', this.isMenuOpen);
        console.log('Window Width:', window.innerWidth);
        
        const elements = {
            'Hamburger Button': document.querySelector('.mobile-menu-toggle'),
            'Sidebar': document.querySelector('.admin-sidebar'),
            'Overlay': document.querySelector('.mobile-overlay')
        };
        
        Object.entries(elements).forEach(([name, element]) => {
            console.log(`${name}:`, element ? 'Found' : 'Not Found');
            if (element) {
                console.log(`  Classes:`, element.className);
            }
        });
    }
}

// Initialize the single-click hamburger fix
const singleClickHamburgerFix = new SingleClickHamburgerFix();

// Make it globally available for debugging
window.singleClickHamburgerFix = singleClickHamburgerFix;

// Override any existing hamburger functions to prevent conflicts
window.toggleMobileMenu = () => singleClickHamburgerFix.toggleMenu();
window.openMobileMenu = () => singleClickHamburgerFix.openMenu();
window.closeMobileMenu = () => singleClickHamburgerFix.closeMenu();

console.log('🍔 Single-click hamburger fix loaded');