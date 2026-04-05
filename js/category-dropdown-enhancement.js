// Category Navigation - Simple Links Only (No Dropdowns)
document.addEventListener('DOMContentLoaded', function() {
    const categoryNav = document.querySelector('.shop-category-nav');
    const categoryItems = document.querySelectorAll('.category-item');
    
    if (!categoryNav || !categoryItems.length) return;
    
    console.log('🏷️ Initializing simple category navigation (no dropdowns)...');
    
    // Remove any existing dropdown elements
    function removeDropdowns() {
        const dropdowns = document.querySelectorAll('.category-dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.remove();
        });
        console.log('✅ Removed', dropdowns.length, 'dropdown elements');
    }
    
    // Ensure category links work as simple navigation
    function setupSimpleNavigation() {
        categoryItems.forEach(item => {
            const link = item.querySelector('.category-link');
            if (!link) return;
            
            // Remove any hover event listeners that might show dropdowns
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            // Add simple click handler for category filtering
            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links
                document.querySelectorAll('.category-link').forEach(l => {
                    l.classList.remove('active');
                });
                
                // Add active class to clicked link
                newLink.classList.add('active');
                
                // Extract category from URL and filter
                const url = new URL(newLink.href);
                const category = url.searchParams.get('category');
                
                if (category && window.categoryFilterSystem) {
                    window.categoryFilterSystem.filterByCategory(category);
                    window.categoryFilterSystem.updateURL(category);
                } else {
                    // Fallback: navigate to the URL
                    window.location.href = newLink.href;
                }
            });
        });
        
        console.log('✅ Simple navigation setup complete');
    }
    
    // Ensure no horizontal scroll
    function preventHorizontalScroll() {
        const navItems = document.querySelector('.category-nav-items');
        if (navItems) {
            navItems.style.overflowX = 'visible';
            navItems.style.overflowY = 'visible';
        }
        
        const container = categoryNav.querySelector('.container');
        if (container) {
            container.style.overflowX = 'visible';
            container.style.overflowY = 'visible';
        }
    }
    
    // Initialize
    removeDropdowns();
    setupSimpleNavigation();
    preventHorizontalScroll();
    
    console.log('✅ Simple category navigation initialized (no dropdowns)');
});