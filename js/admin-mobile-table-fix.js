// Admin Mobile Table Fix - Ensures all required elements exist
class AdminMobileTableFix {
    constructor() {
        this.init();
    }
    
    init() {
        // Run immediately and after DOM is ready
        this.ensureRequiredElements();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.ensureRequiredElements();
            });
        } else {
            this.ensureRequiredElements();
        }
        
        // Monitor for dynamically added content
        this.observeTableChanges();
    }
    
    ensureRequiredElements() {
        const requiredElements = [
            { id: 'products-table-body', parent: '.admin-table', columns: 7 },
            { id: 'vendors-table-body', parent: '.admin-table', columns: 7 },
            { id: 'vendors-list-body', parent: '.admin-table', columns: 6 },
            { id: 'orders-table-body', parent: '.admin-table', columns: 8 },
            { id: 'payouts-table-body', parent: '.admin-table', columns: 8 }
        ];
        
        requiredElements.forEach(element => {
            if (!document.getElementById(element.id)) {
                this.createMissingTableBody(element);
            }
        });
    }
    
    createMissingTableBody(element) {
        const tables = document.querySelectorAll(element.parent);
        if (tables.length > 0) {
            const tbody = document.createElement('tbody');
            tbody.id = element.id;
            tbody.innerHTML = `<tr><td colspan="${element.columns}" style="text-align: center; padding: 2rem; color: #666;">Loading...</td></tr>`;
            
            tables[0].appendChild(tbody);
            console.log(`✅ Created missing table body: ${element.id}`);
        }
    }
    
    observeTableChanges() {
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        // Re-check required elements when DOM changes
                        setTimeout(() => {
                            this.ensureRequiredElements();
                        }, 100);
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
}

// Initialize the fix safely
if (typeof window !== 'undefined') {
    new AdminMobileTableFix();
}