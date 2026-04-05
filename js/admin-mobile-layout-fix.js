// Admin Mobile Layout Fix - Ensure mobile functionality works

class AdminMobileLayoutFix {
    constructor() {
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupMobileLayout();
            });
        } else {
            this.setupMobileLayout();
        }
    }
    
    setupMobileLayout() {
        console.log('🔧 Setting up mobile admin layout...');
        
        // Ensure mobile menu toggle exists
        this.createMobileMenuToggle();
        
        // Ensure mobile overlay exists
        this.createMobileOverlay();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Force content visibility
        this.forceContentVisibility();
        
        // Setup responsive behavior
        this.setupResponsiveBehavior();
        
        console.log('✅ Mobile admin layout setup complete');
    }
    
    createMobileMenuToggle() {
        try {
            // Check if toggle already exists
            if (document.querySelector('.mobile-menu-toggle')) {
                console.log('📱 Mobile menu toggle already exists');
                return;
            }
            
            const toggle = document.createElement('button');
            toggle.className = 'mobile-menu-toggle';
            toggle.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            `;
            
            if (document.body) {
                document.body.appendChild(toggle);
                console.log('✅ Mobile menu toggle created');
            } else {
                console.warn('⚠️ Document body not available for toggle creation');
            }
        } catch (error) {
            console.error('❌ Error creating mobile menu toggle:', error);
        }
    }
    
    createMobileOverlay() {
        try {
            // Check if overlay already exists
            if (document.querySelector('.mobile-overlay')) {
                console.log('📱 Mobile overlay already exists');
                return;
            }
            
            const overlay = document.createElement('div');
            overlay.className = 'mobile-overlay';
            
            if (document.body) {
                document.body.appendChild(overlay);
                console.log('✅ Mobile overlay created');
            } else {
                console.warn('⚠️ Document body not available for overlay creation');
            }
        } catch (error) {
            console.error('❌ Error creating mobile overlay:', error);
        }
    }
    
    setupEventListeners() {
        try {
            const toggle = document.querySelector('.mobile-menu-toggle');
            const sidebar = document.querySelector('.admin-sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            
            if (toggle && sidebar && overlay) {
                // Toggle menu on button click
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleMobileMenu();
                });
                
                // Close menu on overlay click
                overlay.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
                
                // Close menu on nav link click (mobile only)
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        if (window.innerWidth <= 768) {
                            this.closeMobileMenu();
                        }
                    });
                });
                
                // Close menu on escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.closeMobileMenu();
                    }
                });
                
                console.log('✅ Mobile menu event listeners setup');
            } else {
                console.warn('⚠️ Some mobile menu elements not found:', {
                    toggle: !!toggle,
                    sidebar: !!sidebar,
                    overlay: !!overlay
                });
            }
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }
    }
    
    forceContentVisibility() {
        try {
            // Force all admin content to be visible on mobile
            const elementsToShow = [
                '.admin-content',
                '.content-header',
                '.dashboard-cards',
                '.dashboard-card',
                '.section-container',
                '.recent-section',
                '#orders-container',
                '.table-container',
                '.admin-table',
                '.admin-table thead',
                '.admin-table tbody',
                '.admin-table tr',
                '.admin-table th',
                '.admin-table td',
                '#products-table-body',
                '#vendors-table-body',
                '#vendors-list-body',
                '#orders-table-body',
                '#payouts-table-body',
                '#deliveries-table-body',
                '.form-container'
            ];
            
            elementsToShow.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        if (element) {
                            element.style.display = element.tagName === 'TABLE' ? 'table' : 
                                                  element.tagName === 'THEAD' || element.tagName === 'TBODY' ? 'table-row-group' :
                                                  element.tagName === 'TR' ? 'table-row' :
                                                  element.tagName === 'TH' || element.tagName === 'TD' ? 'table-cell' : 'block';
                            element.style.visibility = 'visible';
                            element.style.opacity = '1';
                            
                            // Remove any transform that might hide content
                            if (element.classList.contains('admin-content')) {
                                element.style.transform = 'none';
                                element.style.marginLeft = '0';
                                element.style.width = '100%';
                            }
                        }
                    });
                } catch (error) {
                    console.warn(`⚠️ Could not process selector ${selector}:`, error.message);
                }
            });
            
            // Force body and html to allow scrolling
            if (document.body) {
                document.body.style.overflow = 'visible';
            }
            if (document.documentElement) {
                document.documentElement.style.overflow = 'visible';
            }
            
            console.log('✅ Content visibility forced - all elements should be visible now');
        } catch (error) {
            console.error('❌ Error in forceContentVisibility:', error);
        }
    }
    
    setupResponsiveBehavior() {
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                // Desktop mode - close mobile menu
                this.closeMobileMenu();
            }
            
            // Re-force content visibility
            this.forceContentVisibility();
        });
        
        // Initial check
        if (window.innerWidth <= 768) {
            this.forceContentVisibility();
        }
        
        console.log('✅ Responsive behavior setup');
    }
    
    toggleMobileMenu() {
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (sidebar && overlay) {
            const isOpen = sidebar.classList.contains('mobile-active');
            
            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }
    
    openMobileMenu() {
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('mobile-active');
            overlay.classList.add('active');
            overlay.style.display = 'block';
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            console.log('📱 Mobile menu opened');
        }
    }
    
    closeMobileMenu() {
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-active');
            overlay.classList.remove('active');
            
            // Hide overlay after animation
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            console.log('📱 Mobile menu closed');
        }
    }
    
    // Debug method to check layout
    debugLayout() {
        const elements = {
            'Admin Content': document.querySelector('.admin-content'),
            'Dashboard Cards': document.querySelector('.dashboard-cards'),
            'Content Header': document.querySelector('.content-header'),
            'Mobile Toggle': document.querySelector('.mobile-menu-toggle'),
            'Sidebar': document.querySelector('.admin-sidebar')
        };
        
        console.log('🔍 Layout Debug:');
        Object.entries(elements).forEach(([name, element]) => {
            if (element) {
                const styles = window.getComputedStyle(element);
                console.log(`${name}:`, {
                    display: styles.display,
                    visibility: styles.visibility,
                    opacity: styles.opacity,
                    position: styles.position
                });
            } else {
                console.log(`${name}: NOT FOUND`);
            }
        });
    }
    
    // Method to force show all content (for debugging)
    forceShowAll() {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.classList.contains('admin-content') ||
                element.classList.contains('dashboard-cards') ||
                element.classList.contains('content-header') ||
                element.classList.contains('section-container')) {
                element.style.display = 'block !important';
                element.style.visibility = 'visible !important';
                element.style.opacity = '1 !important';
            }
        });
        console.log('🔧 Forced all content visible');
    }
}

// Initialize the mobile layout fix
const adminMobileLayoutFix = new AdminMobileLayoutFix();

// Make it globally available for debugging
window.adminMobileLayoutFix = adminMobileLayoutFix;

// Auto-fix on page load
window.addEventListener('load', () => {
    setTimeout(() => {
        adminMobileLayoutFix.forceContentVisibility();
    }, 500);
    
    // Run multiple times to ensure content is visible
    setTimeout(() => {
        adminMobileLayoutFix.forceContentVisibility();
    }, 1000);
    
    setTimeout(() => {
        adminMobileLayoutFix.forceContentVisibility();
    }, 2000);
});

// Also run on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        adminMobileLayoutFix.forceContentVisibility();
    }, 100);
});

// Run when window is resized to mobile
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            adminMobileLayoutFix.forceContentVisibility();
        }, 100);
    }
});

console.log('📱 Admin Mobile Layout Fix loaded');