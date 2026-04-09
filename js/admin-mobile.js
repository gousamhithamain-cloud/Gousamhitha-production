// Admin Mobile Functionality
class AdminMobile {
    constructor() {
        this.sidebar = null;
        this.overlay = null;
        this.menuToggle = null;
        this.isMenuOpen = false;
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupMobileElements();
            this.setupEventListeners();
            this.setupTableResponsive();
            this.handleResize();
            this.ensureScrollingEnabled(); // Ensure scrolling on load
        });
        
        if (document.readyState !== 'loading') {
            this.setupMobileElements();
            this.setupEventListeners();
            this.setupTableResponsive();
            this.handleResize();
            this.ensureScrollingEnabled(); // Ensure scrolling on load
        }
        
        // Safety check - ensure scrolling every 2 seconds for first 10 seconds
        let scrollCheckCount = 0;
        const scrollChecker = setInterval(() => {
            if (scrollCheckCount < 5) { // Check 5 times
                this.ensureScrollingEnabled();
                scrollCheckCount++;
            } else {
                clearInterval(scrollChecker);
            }
        }, 2000);
    }
    
    setupMobileElements() {
        // Create mobile menu toggle button
        this.createMobileToggle();
        
        // Create mobile overlay
        this.createMobileOverlay();
        
        // Get sidebar reference
        this.sidebar = document.querySelector('.admin-sidebar');
        
        // Setup mobile card layouts for tables
        this.setupMobileCardLayouts();
    }
    
    createMobileToggle() {
        // Check if toggle already exists
        if (document.querySelector('.mobile-menu-toggle')) return;
        
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
        
        document.body.appendChild(toggle);
        this.menuToggle = toggle;
    }
    
    createMobileOverlay() {
        // Check if overlay already exists
        if (document.querySelector('.mobile-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }
    
    setupEventListeners() {
        // Menu toggle click
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });
        }
        
        // Overlay click to close menu
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        // Escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Close menu when clicking nav links on mobile
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMobileMenu();
                }
            });
        });
        
        // Handle modal positioning
        this.setupModalHandling();
    }
    
    setupModalHandling() {
        // Watch for modals opening
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('edit-panel')) {
                        this.adjustModalForMobile(node);
                    }
                });
                
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.classList && target.classList.contains('edit-panel')) {
                        this.adjustModalForMobile(target);
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
        
        // Handle existing modals
        const existingModals = document.querySelectorAll('.edit-panel');
        existingModals.forEach(modal => {
            this.adjustModalForMobile(modal);
        });
    }
    
    adjustModalForMobile(modal) {
        if (window.innerWidth <= 768) {
            // Add mobile class for styling
            modal.classList.add('mobile-modal');
            
            // Ensure proper positioning
            modal.style.position = 'fixed';
            modal.style.top = '60px';
            modal.style.left = '50%';
            modal.style.transform = 'translateX(-50%)';
            modal.style.width = 'calc(100% - 2rem)';
            modal.style.maxWidth = '500px';
            modal.style.maxHeight = 'calc(100vh - 80px)';
            modal.style.zIndex = '1003';
            
            // Add body class to prevent scrolling
            document.body.classList.add('modal-open');
        }
    }
    
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        if (!this.sidebar || !this.overlay) return;
        
        this.isMenuOpen = true;
        this.sidebar.classList.add('mobile-active');
        this.overlay.style.display = 'block';
        
        // Trigger overlay fade in
        setTimeout(() => {
            this.overlay.classList.add('active');
        }, 10);
        
        // Prevent body scroll ONLY when menu is open
        document.body.classList.add('mobile-menu-open');
        
        console.log('📱 Mobile menu opened');
    }
    
    closeMobileMenu() {
        if (!this.sidebar || !this.overlay) return;
        
        this.isMenuOpen = false;
        this.sidebar.classList.remove('mobile-active');
        this.overlay.classList.remove('active');
        
        // Hide overlay after animation
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300);
        
        // Restore body scroll immediately
        document.body.classList.remove('mobile-menu-open');
        document.body.style.overflow = ''; // Clear any inline styles
        document.body.style.position = ''; // Clear any inline position
        
        console.log('📱 Mobile menu closed');
    }
    
    handleResize() {
        // Close mobile menu if window becomes desktop size
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Ensure scrolling is enabled on resize
        this.ensureScrollingEnabled();
        
        // Update table layouts
        this.updateTableLayouts();
    }
    
    // New method to ensure scrolling is always enabled
    ensureScrollingEnabled() {
        // Force enable scrolling on body
        document.body.style.overflowY = 'auto';
        document.body.style.height = 'auto';
        document.body.style.minHeight = '100vh';
        
        // Remove any classes that might disable scrolling
        if (!this.isMenuOpen) {
            document.body.classList.remove('mobile-menu-open');
        }
        
        // Ensure main content allows scrolling
        const adminContent = document.querySelector('.admin-content');
        if (adminContent) {
            adminContent.style.overflowY = 'visible';
            adminContent.style.height = 'auto';
            adminContent.style.minHeight = '100vh';
        }
        
        console.log('📱 Scrolling enabled check completed');
    }
    
    setupTableResponsive() {
        const tables = document.querySelectorAll('.admin-table');
        
        tables.forEach(table => {
            // Wrap table in responsive container if not already wrapped
            if (!table.closest('.table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
            
            // Add data labels for mobile card view (if needed)
            this.addDataLabelsToTable(table);
        });
        
        // Ensure all required table bodies exist
        this.ensureRequiredTableElements();
    }
    
    addDataLabelsToTable(table) {
        const headers = table.querySelectorAll('thead th');
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index].textContent.trim());
                }
            });
        });
    }
    
    ensureRequiredTableElements() {
        // Ensure critical table elements exist for JavaScript functionality
        const requiredElements = [
            'products-table-body',
            'vendors-table-body', 
            'orders-table-body',
            'vendors-list-body'
        ];
        
        requiredElements.forEach(id => {
            if (!document.getElementById(id)) {
                // Only warn if there's actually a table on this page
                const tables = document.querySelectorAll('.admin-table');
                if (tables.length > 0) {
                    // Create placeholder only if a table exists but is missing this tbody
                    const placeholder = document.createElement('tbody');
                    placeholder.id = id;
                    placeholder.style.display = 'none'; // hidden placeholder
                    tables[0].appendChild(placeholder);
                }
            }
        });
    }
    
    setupMobileCardLayouts() {
        // Remove mobile card layout setup since we're keeping tables visible
        // This method is kept for backward compatibility but does nothing
        console.log('📱 Mobile card layouts disabled - using responsive tables instead');
    }
    
    updateTableLayouts() {
        if (window.innerWidth <= 768) {
            // Update table responsive features instead of mobile cards
            this.updateTableResponsiveFeatures();
        }
    }
    
    updateTableResponsiveFeatures() {
        // Add responsive features to tables
        const tables = document.querySelectorAll('.admin-table');
        
        tables.forEach(table => {
            // Ensure table has responsive wrapper
            if (!table.closest('.table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
            
            // Update data labels for current content
            this.addDataLabelsToTable(table);
        });
    }
    
    updateMobileCards() {
        // Deprecated - no longer using mobile cards
        // Tables remain visible with horizontal scrolling
        console.log('📱 Mobile cards deprecated - using responsive tables');
    }
    
    updateVendorMobileCards() {
        // Deprecated - vendors now use responsive tables
        console.log('📱 Vendor mobile cards deprecated');
    }
    
    updateOrderMobileCards() {
        // Deprecated - orders now use responsive tables  
        console.log('📱 Order mobile cards deprecated');
    }
    
    // Utility method to check if device is mobile
    isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Method to refresh mobile layouts when data changes
    refreshMobileLayouts() {
        if (this.isMobile()) {
            setTimeout(() => {
                this.updateTableResponsiveFeatures();
                this.ensureRequiredTableElements();
            }, 100);
        }
    }
    
    // Add method to toggle card-style view for very small screens
    toggleCardStyleView() {
        const tableContainers = document.querySelectorAll('.table-container');
        
        tableContainers.forEach(container => {
            if (window.innerWidth <= 480) {
                container.classList.add('card-style');
            } else {
                container.classList.remove('card-style');
            }
        });
    }
}

// Initialize admin mobile functionality
window.adminMobile = new AdminMobile();

// Export for use in other scripts
window.AdminMobile = AdminMobile;