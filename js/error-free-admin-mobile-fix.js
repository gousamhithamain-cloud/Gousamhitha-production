// Error-Free Admin Mobile Layout Fix
// Handles all edge cases and prevents JavaScript errors

class ErrorFreeAdminMobileFix {
    constructor() {
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.init();
    }
    
    init() {
        try {
            // Wait for DOM to be ready with multiple fallbacks
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.safeSetup());
            } else {
                this.safeSetup();
            }
            
            // Fallback initialization after delay
            setTimeout(() => {
                if (!this.isInitialized && this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    console.log(`🔄 Retry ${this.retryCount}: Attempting mobile fix initialization...`);
                    this.safeSetup();
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error in init:', error);
        }
    }
    
    safeSetup() {
        try {
            console.log('🔧 Starting error-free admin mobile setup...');
            
            // Only run on mobile devices
            if (window.innerWidth > 768) {
                console.log('📱 Desktop detected, skipping mobile fixes');
                return;
            }
            
            // Setup with error handling
            this.safeCreateMobileElements();
            this.safeForceContentVisibility();
            this.safeSetupEventListeners();
            this.safeSetupResponsiveBehavior();
            
            this.isInitialized = true;
            console.log('✅ Error-free admin mobile setup complete');
            
        } catch (error) {
            console.error('❌ Error in safeSetup:', error);
        }
    }
    
    safeCreateMobileElements() {
        try {
            // Create hamburger menu toggle if it doesn't exist
            if (!document.querySelector('.mobile-menu-toggle') && document.body) {
                const toggle = document.createElement('button');
                toggle.className = 'mobile-menu-toggle';
                toggle.setAttribute('aria-label', 'Toggle mobile menu');
                toggle.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                `;
                document.body.appendChild(toggle);
                console.log('✅ Mobile menu toggle created');
            }
            
            // Create mobile overlay if it doesn't exist
            if (!document.querySelector('.mobile-overlay') && document.body) {
                const overlay = document.createElement('div');
                overlay.className = 'mobile-overlay';
                overlay.setAttribute('aria-hidden', 'true');
                document.body.appendChild(overlay);
                console.log('✅ Mobile overlay created');
            }
            
        } catch (error) {
            console.error('❌ Error creating mobile elements:', error);
        }
    }
    
    safeForceContentVisibility() {
        try {
            // List of selectors to make visible
            const selectors = [
                '.admin-content',
                '.content-header',
                '.dashboard-cards',
                '.dashboard-card',
                '.section-container',
                '.recent-section',
                '.table-container',
                '.admin-table',
                '.form-container'
            ];
            
            // Specific table body selectors
            const tableBodySelectors = [
                '#products-table-body',
                '#vendors-table-body',
                '#vendors-list-body',
                '#orders-table-body',
                '#payouts-table-body',
                '#deliveries-table-body'
            ];
            
            // Force visibility on main elements
            selectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        if (element && element.style) {
                            element.style.display = 'block';
                            element.style.visibility = 'visible';
                            element.style.opacity = '1';
                            
                            // Special handling for admin content
                            if (element.classList && element.classList.contains('admin-content')) {
                                element.style.marginLeft = '0';
                                element.style.width = '100%';
                                element.style.transform = 'none';
                            }
                        }
                    });
                } catch (selectorError) {
                    console.warn(`⚠️ Could not process selector ${selector}:`, selectorError.message);
                }
            });
            
            // Force visibility on table elements
            tableBodySelectors.forEach(selector => {
                try {
                    const element = document.querySelector(selector);
                    if (element && element.style) {
                        element.style.display = 'table-row-group';
                        element.style.visibility = 'visible';
                        element.style.opacity = '1';
                    }
                } catch (selectorError) {
                    console.warn(`⚠️ Could not process table selector ${selector}:`, selectorError.message);
                }
            });
            
            // Force tables to be visible
            const tables = document.querySelectorAll('.admin-table');
            tables.forEach(table => {
                try {
                    if (table && table.style) {
                        table.style.display = 'table';
                        table.style.visibility = 'visible';
                        table.style.opacity = '1';
                    }
                } catch (tableError) {
                    console.warn('⚠️ Could not process table:', tableError.message);
                }
            });
            
            // Ensure body allows scrolling
            if (document.body && document.body.style) {
                document.body.style.overflow = 'visible';
            }
            if (document.documentElement && document.documentElement.style) {
                document.documentElement.style.overflow = 'visible';
            }
            
            console.log('✅ Content visibility forced safely');
            
        } catch (error) {
            console.error('❌ Error in safeForceContentVisibility:', error);
        }
    }
    
    safeSetupEventListeners() {
        try {
            const toggle = document.querySelector('.mobile-menu-toggle');
            const sidebar = document.querySelector('.admin-sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            
            if (toggle && sidebar && overlay) {
                // Toggle menu on button click
                toggle.addEventListener('click', (e) => {
                    try {
                        e.stopPropagation();
                        this.safeToggleMobileMenu();
                    } catch (clickError) {
                        console.error('❌ Error in toggle click:', clickError);
                    }
                });
                
                // Close menu on overlay click
                overlay.addEventListener('click', () => {
                    try {
                        this.safeCloseMobileMenu();
                    } catch (overlayError) {
                        console.error('❌ Error in overlay click:', overlayError);
                    }
                });
                
                // Close menu on nav link click (mobile only)
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    try {
                        link.addEventListener('click', () => {
                            if (window.innerWidth <= 768) {
                                this.safeCloseMobileMenu();
                            }
                        });
                    } catch (linkError) {
                        console.warn('⚠️ Could not add listener to nav link:', linkError.message);
                    }
                });
                
                // Close menu on escape key
                document.addEventListener('keydown', (e) => {
                    try {
                        if (e.key === 'Escape') {
                            this.safeCloseMobileMenu();
                        }
                    } catch (keyError) {
                        console.error('❌ Error in escape key handler:', keyError);
                    }
                });
                
                console.log('✅ Mobile menu event listeners setup safely');
            } else {
                console.warn('⚠️ Some mobile menu elements not found:', {
                    toggle: !!toggle,
                    sidebar: !!sidebar,
                    overlay: !!overlay
                });
            }
        } catch (error) {
            console.error('❌ Error in safeSetupEventListeners:', error);
        }
    }
    
    safeToggleMobileMenu() {
        try {
            const sidebar = document.querySelector('.admin-sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            
            if (sidebar && overlay) {
                const isOpen = sidebar.classList.contains('mobile-active');
                
                if (isOpen) {
                    this.safeCloseMobileMenu();
                } else {
                    this.safeOpenMobileMenu();
                }
            }
        } catch (error) {
            console.error('❌ Error in safeToggleMobileMenu:', error);
        }
    }
    
    safeOpenMobileMenu() {
        try {
            const sidebar = document.querySelector('.admin-sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            
            if (sidebar) {
                sidebar.classList.add('mobile-active');
            }
            
            if (overlay) {
                overlay.classList.add('active');
                overlay.style.display = 'block';
            }
            
            // Prevent body scroll
            if (document.body) {
                document.body.style.overflow = 'hidden';
            }
            
            console.log('📱 Mobile menu opened safely');
        } catch (error) {
            console.error('❌ Error in safeOpenMobileMenu:', error);
        }
    }
    
    safeCloseMobileMenu() {
        try {
            const sidebar = document.querySelector('.admin-sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            
            if (sidebar) {
                sidebar.classList.remove('mobile-active');
            }
            
            if (overlay) {
                overlay.classList.remove('active');
                
                // Hide overlay after animation
                setTimeout(() => {
                    if (overlay && overlay.style) {
                        overlay.style.display = 'none';
                    }
                }, 300);
            }
            
            // Restore body scroll
            if (document.body) {
                document.body.style.overflow = '';
            }
            
            console.log('📱 Mobile menu closed safely');
        } catch (error) {
            console.error('❌ Error in safeCloseMobileMenu:', error);
        }
    }
    
    safeSetupResponsiveBehavior() {
        try {
            // Handle window resize
            window.addEventListener('resize', () => {
                try {
                    if (window.innerWidth > 768) {
                        // Desktop mode - close mobile menu
                        this.safeCloseMobileMenu();
                    } else {
                        // Mobile mode - re-force content visibility
                        setTimeout(() => {
                            this.safeForceContentVisibility();
                        }, 100);
                    }
                } catch (resizeError) {
                    console.error('❌ Error in resize handler:', resizeError);
                }
            });
            
            console.log('✅ Responsive behavior setup safely');
        } catch (error) {
            console.error('❌ Error in safeSetupResponsiveBehavior:', error);
        }
    }
    
    // Public method to force visibility (can be called from console)
    forceVisibility() {
        this.safeForceContentVisibility();
    }
    
    // Public method to debug (can be called from console)
    debug() {
        console.log('🔍 Error-Free Admin Mobile Fix Debug:');
        console.log('Initialized:', this.isInitialized);
        console.log('Retry Count:', this.retryCount);
        console.log('Window Width:', window.innerWidth);
        console.log('Is Mobile:', window.innerWidth <= 768);
        
        const elements = {
            'Mobile Toggle': document.querySelector('.mobile-menu-toggle'),
            'Mobile Overlay': document.querySelector('.mobile-overlay'),
            'Admin Sidebar': document.querySelector('.admin-sidebar'),
            'Admin Content': document.querySelector('.admin-content'),
            'Products Table Body': document.querySelector('#products-table-body')
        };
        
        Object.entries(elements).forEach(([name, element]) => {
            console.log(`${name}:`, element ? 'Found' : 'Not Found');
        });
    }
}

// Initialize the error-free mobile fix
const errorFreeAdminMobileFix = new ErrorFreeAdminMobileFix();

// Make it globally available for debugging
window.errorFreeAdminMobileFix = errorFreeAdminMobileFix;

// Auto-run visibility fix multiple times to ensure it works
setTimeout(() => errorFreeAdminMobileFix.forceVisibility(), 500);
setTimeout(() => errorFreeAdminMobileFix.forceVisibility(), 1500);
setTimeout(() => errorFreeAdminMobileFix.forceVisibility(), 3000);

console.log('📱 Error-Free Admin Mobile Fix loaded');