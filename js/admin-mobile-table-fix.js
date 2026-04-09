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
        // Create in a hidden off-screen container, never inside a visible table
        let container = document.getElementById('_mobile-fix-hidden');
        if (!container) {
            container = document.createElement('div');
            container.id = '_mobile-fix-hidden';
            container.style.cssText = 'display:none;position:absolute;left:-9999px;';
            if (document.body) document.body.appendChild(container);
        }
        const tbody = document.createElement('tbody');
        tbody.id = element.id;
        container.appendChild(tbody);
    }
    
    observeTableChanges() {
        if (typeof MutationObserver === 'undefined') return;

        const startObserving = () => {
            if (!document.body) return;
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        setTimeout(() => { this.ensureRequiredElements(); }, 100);
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startObserving);
        } else {
            startObserving();
        }
    }
}

// Initialize the fix safely
if (typeof window !== 'undefined') {
    new AdminMobileTableFix();
}