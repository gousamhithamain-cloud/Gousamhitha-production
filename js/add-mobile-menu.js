document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    const navItems = navbar.querySelector('.nav-items');
    if (navItems && !navItems.querySelector('.mobile-menu-toggle')) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = '☰';
        navItems.appendChild(menuToggle);
    }
    
    if (!document.querySelector('.mobile-menu')) {
        const mobileMenuHTML = `
            <div class="mobile-menu-overlay"></div>
            <div class="mobile-menu">
                <div class="mobile-menu-header">
                    <div class="logo">Gousamhitha</div>
                    <button class="mobile-menu-close">×</button>
                </div>
                <div class="mobile-menu-links">
                    <a href="index.html">Home</a>
                    <a href="shop.html">Shop</a>
                    <a href="about.html">About</a>
                    <a href="gowshala.html">Gowshala</a>
                    <a href="contact.html">Contact</a>
                    <a href="how-to-use.html">How To Use</a>
                    <a href="orders.html">My Orders</a>
                    <a href="cart.html">Cart</a>
                </div>
            </div>
        `;
        navbar.insertAdjacentHTML('afterend', mobileMenuHTML);
    }
});
