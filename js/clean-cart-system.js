// Clean Cart System - Simple and reliable cart functionality
(function() {
    'use strict';
    
    console.log('🛒 Clean Cart System loading...');
    
    class CleanCartSystem {
        constructor() {
            this.isUpdating = false;
        }
        
        async init() {
            console.log('🛒 Initializing clean cart system');
            
            // Check if Supabase is available
            if (!window.supabase) {
                console.error('🛒 Supabase not initialized');
                this.showError('System not ready', 'Please refresh the page to try again');
                return;
            }
            
            // Check if cart container exists
            if (!document.getElementById('cart-items')) {
                console.error('🛒 Cart container not found');
                return;
            }
            
            console.log('🛒 System ready, loading cart');
            await this.loadCart();
            this.setupEventHandlers();
        }
        
        async loadCart() {
            const cartItemsDiv = document.getElementById('cart-items');

            if (!cartItemsDiv) {
                console.error('🛒 Cart container not found');
                return;
            }

            if (typeof showLoader === 'function') showLoader();
            cartItemsDiv.innerHTML = '';

            try {
                // Get user from localStorage (set by AuthAPI.signin)
                let user = null;
                try { const raw = localStorage.getItem('auth_user'); if (raw) user = JSON.parse(raw); } catch(e){}
                if (!user && window.supabase) {
                    try { const r = await window.supabase.auth.getUser(); if (!r.error && r.data?.user) user = r.data.user; } catch(e){}
                }

                if (!user) {
                    console.log('🛒 No user logged in, showing login prompt');
                    this.showLoginPrompt('Please login to view your cart');
                    if (typeof hideLoader === 'function') hideLoader();
                    return;
                }
                
                console.log('🛒 Fetching cart for user:', user.id);
                
                // Fetch cart via backend API
                const token = localStorage.getItem('auth_token') || '';
                const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/cart/${user.id}`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const json = await res.json();
                const cartItems = (json.cart || []).map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    products: item.products
                }));

                console.log('🛒 Cart items loaded:', cartItems);

                if (!cartItems.length) {
                    this.showEmptyCart();
                    this.updateCartCount(0);
                    if (typeof hideLoader === 'function') hideLoader();
                    return;
                }
                
                this.renderCartItems(cartItems);
                if (typeof hideLoader === 'function') hideLoader();

                console.log('🛒 Cart loaded successfully');

            } catch (error) {
                console.error('🛒 Error loading cart:', error);
                this.showError('Error loading cart', 'Please try refreshing the page');
                if (typeof hideLoader === 'function') hideLoader();
            }
        }
        
        showLoginPrompt(message) {
            const cartItemsDiv = document.getElementById('cart-items');
            if (cartItemsDiv) {
                cartItemsDiv.innerHTML = `
                    <div class="empty-cart" style="text-align: center; padding: 40px;">
                        <p style="font-size: 18px; margin-bottom: 20px;">${message}</p>
                        <button onclick="if(typeof openAuthModal==='function'){openAuthModal();}else{window.location.href='login.html';}" class="btn btn-primary" style="padding: 12px 24px; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">Login</button>
                    </div>
                `;
            }
        }
        
        showError(title, message) {
            const cartItemsDiv = document.getElementById('cart-items');
            if (cartItemsDiv) {
                cartItemsDiv.innerHTML = `
                    <div class="empty-cart" style="text-align: center; padding: 40px;">
                        <p style="font-size: 18px; margin-bottom: 20px; color: #d32f2f;">${title}</p>
                        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">${message}</p>
                        <button onclick="window.location.reload()" class="btn btn-primary" style="padding: 12px 24px; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer;">Retry</button>
                    </div>
                `;
            }
        }
        
        showEmptyCart() {
            const cartItemsDiv = document.getElementById('cart-items');
            if (cartItemsDiv) {
                cartItemsDiv.innerHTML = `
                    <div class="empty-cart" style="text-align: center; padding: 40px;">
                        <p style="font-size: 18px; margin-bottom: 20px;">Your cart is empty</p>
                        <a href="shop.html" class="btn btn-primary" style="display: inline-block; padding: 12px 24px; background: #4a7c59; color: white; text-decoration: none; border-radius: 8px;">Start Shopping</a>
                    </div>
                `;
            }
        }
        
        renderCartItems(cartItems) {
            const cartItemsDiv = document.getElementById('cart-items');
            if (!cartItemsDiv) return;
            
            let total = 0;
            let totalItems = 0;
            
            // Display cart items
            const cartHTML = cartItems.map(item => {
                const product = item.products;
                if (!product) {
                    console.warn('🛒 Product not found for cart item:', item.id);
                    return '';
                }
                
                const itemTotal = product.price * item.quantity;
                total += itemTotal;
                totalItems += item.quantity;
                
                return `
                    <div class="cart-item" data-cart-id="${item.id}" style="display: flex; align-items: center; padding: 20px; border-bottom: 1px solid #eee; gap: 20px;">
                        <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                        <div class="cart-item-details" style="flex: 1;">
                            <h3 style="margin: 0 0 5px 0; font-size: 18px;">${product.name}</h3>
                            ${product.display_unit ? `<p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">${product.display_unit}</p>` : ''}
                            <p class="cart-item-price" style="color: #4a7c59; margin: 0; font-size: 16px; font-weight: 600;">₹${product.price}</p>
                        </div>
                        <div class="cart-item-quantity" style="display: flex; align-items: center; gap: 10px;">
                            <button class="qty-btn minus-btn" data-cart-id="${item.id}" data-current="${item.quantity}" data-max="${product.stock}" style="width: 35px; height: 35px; border: 2px solid #4a7c59; background: white; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold; color: #4a7c59;">-</button>
                            <span class="quantity-display" style="min-width: 40px; text-align: center; font-weight: 600; font-size: 16px;">${item.quantity}</span>
                            <button class="qty-btn plus-btn" data-cart-id="${item.id}" data-current="${item.quantity}" data-max="${product.stock}" style="width: 35px; height: 35px; border: 2px solid #4a7c59; background: white; border-radius: 6px; cursor: pointer; font-size: 18px; font-weight: bold; color: #4a7c59;">+</button>
                        </div>
                        <div class="cart-item-total" style="text-align: right; min-width: 120px;">
                            <p class="item-total" style="font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">₹${itemTotal.toFixed(2)}</p>
                            <button class="remove-btn" data-cart-id="${item.id}" style="padding: 8px 16px; background: #d32f2f; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">Remove</button>
                        </div>
                    </div>
                `;
            }).filter(html => html !== '').join('');
            
            const summaryHTML = `
                <div class="cart-summary" style="padding: 30px; background: #f9f9f9; margin-top: 20px; border-radius: 8px;">
                    <h3 class="cart-total" style="margin: 0 0 20px 0; font-size: 24px;">Cart Total: ₹${total.toFixed(2)}</h3>
                    <button onclick="proceedToCheckout()" class="btn btn-primary checkout-btn" style="width: 100%; padding: 14px 28px; background: #4a7c59; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.background='#3d6b4a'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#4a7c59'; this.style.transform='translateY(0)'">Proceed to Checkout</button>
                </div>
            `;
            
            cartItemsDiv.innerHTML = cartHTML + summaryHTML;
            this.updateCartCount(totalItems);
        }
        
        setupEventHandlers() {
            console.log('🛒 Setting up event handlers');
            
            // Use event delegation for all cart buttons
            document.addEventListener('click', async (event) => {
                const target = event.target;
                
                // Handle quantity buttons
                if (target.classList.contains('qty-btn')) {
                    event.preventDefault();
                    await this.handleQuantityClick(target);
                }
                
                // Handle remove buttons
                if (target.classList.contains('remove-btn')) {
                    event.preventDefault();
                    await this.handleRemoveClick(target);
                }
            });
        }
        
        async handleQuantityClick(button) {
            if (this.isUpdating) return;
            
            const cartId = button.dataset.cartId;
            const currentQty = parseInt(button.dataset.current);
            const maxStock = parseInt(button.dataset.max);
            const isPlus = button.classList.contains('plus-btn');
            
            const newQty = isPlus ? currentQty + 1 : currentQty - 1;
            
            console.log(`🛒 Quantity change: ${cartId}, ${currentQty} -> ${newQty}`);
            
            // Validate quantity
            if (newQty < 1) {
                if (confirm('Remove this item from cart?')) {
                    await this.removeItem(cartId);
                }
                return;
            }
            
            if (newQty > maxStock) {
                alert(`Maximum available stock is ${maxStock}`);
                return;
            }
            
            await this.updateQuantity(cartId, newQty);
        }
        
        async handleRemoveClick(button) {
            if (this.isUpdating) return;
            
            const cartId = button.dataset.cartId;
            
            if (confirm('Remove this item from cart?')) {
                await this.removeItem(cartId);
            }
        }
        
        async updateQuantity(cartId, newQuantity) {
            if (this.isUpdating) return;
            
            this.isUpdating = true;
            console.log(`🛒 Updating quantity: ${cartId} -> ${newQuantity}`);
            
            try {
                // Update via backend API
                const token = localStorage.getItem('auth_token') || '';
                const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/cart/${cartId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({ quantity: newQuantity })
                });
                if (!res.ok) throw new Error('Update failed');
                
                // Update UI instantly
                this.updateCartItemUI(cartId, newQuantity);
                console.log('🛒 Quantity updated successfully');
                
            } catch (error) {
                console.error('🛒 Update error:', error);
                alert('Error updating quantity. Please try again.');
            } finally {
                this.isUpdating = false;
            }
        }
        
        async removeItem(cartId) {
            if (this.isUpdating) return;
            
            this.isUpdating = true;
            console.log(`🛒 Removing item: ${cartId}`);
            
            try {
                // Remove via backend API
                const token = localStorage.getItem('auth_token') || '';
                const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/cart/${cartId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (!res.ok) throw new Error('Remove failed');
                
                // Remove from UI
                const cartItem = document.querySelector(`[data-cart-id="${cartId}"]`);
                if (cartItem) {
                    cartItem.style.transition = 'opacity 0.3s ease';
                    cartItem.style.opacity = '0';
                    
                    setTimeout(() => {
                        cartItem.remove();
                        console.log(`🛒 Item ${cartId} removed from UI`);
                        this.updateCartTotals();
                        this.checkEmptyCart();
                    }, 300);
                }
                
                console.log('🛒 Item removed successfully');
                
            } catch (error) {
                console.error('🛒 Remove error:', error);
                alert('Error removing item. Please try again.');
            } finally {
                this.isUpdating = false;
            }
        }
        
        updateCartItemUI(cartId, newQuantity) {
            console.log(`🛒 Updating UI for cart item ${cartId} to quantity ${newQuantity}`);
            
            const cartItem = document.querySelector(`[data-cart-id="${cartId}"]`);
            if (!cartItem) {
                console.warn(`🛒 Cart item ${cartId} not found in UI`);
                return;
            }
            
            // Update quantity display
            const quantityDisplay = cartItem.querySelector('.quantity-display');
            if (quantityDisplay) {
                quantityDisplay.textContent = newQuantity;
                console.log(`🛒 Updated quantity display to ${newQuantity}`);
            }
            
            // Update button data attributes
            const buttons = cartItem.querySelectorAll('.qty-btn');
            buttons.forEach(btn => {
                btn.dataset.current = newQuantity;
            });
            
            // Update item total
            const priceElement = cartItem.querySelector('.cart-item-price');
            const totalElement = cartItem.querySelector('.item-total');
            
            if (priceElement && totalElement) {
                const price = parseFloat(priceElement.textContent.replace('₹', ''));
                const newTotal = price * newQuantity;
                totalElement.textContent = `₹${newTotal.toFixed(2)}`;
                console.log(`🛒 Updated item total to ₹${newTotal.toFixed(2)}`);
            }
            
            // Update cart totals - this is crucial!
            setTimeout(() => {
                this.updateCartTotals();
            }, 100);
        }
        
        updateCartTotals() {
            let total = 0;
            let totalItems = 0;
            
            console.log('🛒 Updating cart totals...');
            
            // Calculate totals from UI
            const cartItems = document.querySelectorAll('.cart-item');
            console.log(`🛒 Found ${cartItems.length} cart items`);
            
            cartItems.forEach((item, index) => {
                const quantityDisplay = item.querySelector('.quantity-display');
                const itemTotalElement = item.querySelector('.item-total');
                
                if (quantityDisplay && itemTotalElement) {
                    const quantity = parseInt(quantityDisplay.textContent) || 0;
                    const itemTotal = parseFloat(itemTotalElement.textContent.replace('₹', '')) || 0;
                    
                    console.log(`🛒 Item ${index + 1}: qty=${quantity}, total=₹${itemTotal}`);
                    
                    totalItems += quantity;
                    total += itemTotal;
                }
            });
            
            console.log(`🛒 Calculated totals: ${totalItems} items, ₹${total.toFixed(2)}`);
            
            // Update cart total display
            const cartTotalElement = document.querySelector('.cart-total');
            if (cartTotalElement) {
                const newTotalText = `Cart Total: ₹${total.toFixed(2)}`;
                cartTotalElement.textContent = newTotalText;
                console.log(`🛒 Updated cart total display: ${newTotalText}`);
            } else {
                console.warn('🛒 Cart total element not found!');
            }
            
            // Update cart count
            this.updateCartCount(totalItems);
        }
        
        updateCartCount(count) {
            // Update navigation cart count
            const navCartCount = document.getElementById('nav-cart-count');
            if (navCartCount) {
                navCartCount.textContent = count;
            }
            
            // Update bottom nav cart count
            const bottomNavCount = document.getElementById('bottom-nav-cart-count');
            if (bottomNavCount) {
                bottomNavCount.textContent = count;
                bottomNavCount.classList.toggle('hidden', count === 0);
            }
            
            console.log(`🛒 Cart count updated: ${count}`);
        }
        
        checkEmptyCart() {
            const cartItems = document.querySelectorAll('.cart-item');
            if (cartItems.length === 0) {
                const cartItemsDiv = document.getElementById('cart-items');
                if (cartItemsDiv) {
                    cartItemsDiv.innerHTML = `
                        <div class="empty-cart" style="text-align: center; padding: 40px;">
                            <p style="font-size: 18px; margin-bottom: 20px;">Your cart is empty</p>
                            <a href="shop.html" class="btn btn-primary" style="display: inline-block; padding: 12px 24px; background: #4a7c59; color: white; text-decoration: none; border-radius: 8px;">Start Shopping</a>
                        </div>
                    `;
                }
                this.updateCartCount(0);
            }
        }
    }
    
    // Initialize clean cart system
    const cleanCartSystem = new CleanCartSystem();
    
    // Strong global function overrides to prevent conflicts
    window.loadCart = () => cleanCartSystem.loadCart();
    window.updateQuantity = () => {}; // Disable old function
    window.removeFromCart = () => {}; // Disable old function
    window.updateCartCount = () => {}; // Disable conflicting cart count updaters
    window.forceCartTotalUpdate = () => {}; // Disable cart total fix
    
    // Prevent other cart systems from initializing
    window.CartOptimizer = { initialized: true };
    window.CartCountUpdater = { initialized: true };
    
    // Clean initialization - only after DOM is ready
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('🛒 DOM ready, initializing cart system');
        await cleanCartSystem.init();
    });
    
    // Expose for debugging
    window.CleanCartSystem = cleanCartSystem;
    
    // Global checkout function
    window.proceedToCheckout = async function() {
        console.log('🛒 Proceeding to checkout...');
        
        try {
            // Simple checkout without complex authentication checks
            const cartItems = document.querySelectorAll('.cart-item');
            console.log('🛒 Found cart items:', cartItems.length);
            
            if (cartItems.length === 0) {
                alert('Your cart is empty. Please add items before checkout.');
                return;
            }
            
            console.log('🛒 Navigating to checkout page...');
            
            // Direct navigation to checkout page
            window.location.href = 'checkout.html';
            
        } catch (error) {
            console.error('🛒 Error during checkout:', error);
            // Fallback: direct navigation
            window.location.href = 'checkout.html';
        }
    };
    
    console.log('✅ Clean Cart System loaded');
    
})();