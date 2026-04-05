// Mobile Cart Handler - SECURE VERSION
// ✅ All operations go through backend API

class MobileCartHandler {
    constructor() {
        this.API_BASE = window.API_BASE_URL || 'http://localhost:4000/api';
        this.init();
    }
    
    init() {
        console.log('🛒 Mobile Cart Handler initializing (SECURE MODE)...');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupMobileCart();
            });
        } else {
            this.setupMobileCart();
        }
    }
    
    setupMobileCart() {
        console.log('📱 Setting up mobile cart for screen width:', window.innerWidth);
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                this.updateCartLayout();
                this.setupStickyTotalBar();
            }, 500);
        }
        
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    this.updateCartLayout();
                    this.setupStickyTotalBar();
                }, 100);
            }
        });
        
        if (window.loadCart) {
            const originalLoadCart = window.loadCart;
            window.loadCart = async () => {
                await originalLoadCart();
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        this.updateCartLayout();
                        this.setupStickyTotalBar();
                    }, 100);
                }
            };
        }
    }
    
    updateCartLayout() {
        const cartItems = document.querySelectorAll('.cart-item');
        cartItems.forEach(item => {
            this.restructureCartItem(item);
        });
    }
    
    restructureCartItem(cartItem) {
        if (cartItem.classList.contains('mobile-restructured')) {
            return;
        }
        
        console.log('🔄 Restructuring cart item for mobile');
        
        const image = cartItem.querySelector('img');
        const details = cartItem.querySelector('.cart-item-details');
        const quantitySection = cartItem.querySelector('.cart-item-quantity');
        
        if (!image || !details) return;
        
        const productName = details.querySelector('h3')?.textContent || 'Product';
        const productPrice = details.querySelector('.cart-item-price')?.textContent || '₹0';
        const quantitySpan = quantitySection?.querySelector('span');
        const currentQuantity = quantitySpan ? parseInt(quantitySpan.textContent) || 1 : 1;
        
        const cartItemId = cartItem.dataset.cartId || '';
        const maxStock = cartItem.dataset.maxStock || '10';
        
        if (!cartItemId) {
            const quantityButtons = cartItem.querySelectorAll('button[onclick*="updateQuantity"]');
            if (quantityButtons.length > 0) {
                const onclickAttr = quantityButtons[0].getAttribute('onclick');
                const match = onclickAttr.match(/updateQuantity\('([^']+)'/);
                if (match) {
                    cartItem.dataset.cartId = match[1];
                }
            }
        }
        
        cartItem.dataset.maxStock = maxStock;
        cartItem.innerHTML = '';
        cartItem.style.cssText = 'display: flex; align-items: flex-start; padding: 1rem; border-bottom: 1px solid #f0f0f0; background: white; gap: 0.8rem;';
        
        const imageContainer = document.createElement('div');
        imageContainer.style.cssText = 'flex-shrink: 0;';
        
        const mobileImage = image.cloneNode(true);
        mobileImage.style.cssText = 'width: 60px; height: 60px; border-radius: 8px; object-fit: cover;';
        imageContainer.appendChild(mobileImage);
        
        const infoContainer = document.createElement('div');
        infoContainer.className = 'cart-item-details';
        infoContainer.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 0.4rem; min-width: 0;';
        
        const nameElement = document.createElement('h3');
        nameElement.textContent = productName;
        nameElement.style.cssText = 'font-size: 14px; font-weight: 600; color: #333; margin: 0; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
        
        const priceElement = document.createElement('div');
        priceElement.className = 'cart-item-price';
        priceElement.textContent = productPrice;
        priceElement.style.cssText = 'font-size: 16px; font-weight: 700; color: #4a7c59; margin: 0;';
        
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'cart-item-controls';
        controlsContainer.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-top: 0.3rem; gap: 0.5rem;';
        
        const quantityContainer = document.createElement('div');
        quantityContainer.className = 'mobile-quantity-controls';
        quantityContainer.style.cssText = 'display: flex; align-items: center; background: #f8f9fa; border-radius: 20px; padding: 0.2rem; gap: 0.3rem; border: 1px solid #e0e0e0;';
        
        const rightControls = document.createElement('div');
        rightControls.style.cssText = 'display: flex; flex-direction: column; align-items: flex-end; gap: 0.2rem;';
        
        const itemTotalElement = document.createElement('div');
        itemTotalElement.className = 'mobile-item-total';
        const itemTotal = parseFloat(productPrice.replace('₹', '')) * currentQuantity;
        itemTotalElement.textContent = `₹${itemTotal.toFixed(2)}`;
        itemTotalElement.style.cssText = 'font-size: 14px; font-weight: 700; color: #333; margin-bottom: 0.1rem;';
        
        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'mobile-quantity-btn';
        decreaseBtn.textContent = '−';
        decreaseBtn.style.cssText = 'width: 28px; height: 28px; border: none; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #4a7c59; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.1);';
        
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.className = 'mobile-quantity-input';
        quantityInput.value = currentQuantity;
        quantityInput.min = '1';
        quantityInput.style.cssText = 'width: 35px; text-align: center; border: none; background: transparent; font-size: 13px; font-weight: 600; color: #333; padding: 0;';
        
        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'mobile-quantity-btn';
        increaseBtn.textContent = '+';
        increaseBtn.style.cssText = 'width: 28px; height: 28px; border: none; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #4a7c59; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.1);';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'mobile-remove-btn';
        removeBtn.textContent = 'REMOVE';
        removeBtn.style.cssText = 'background: none; border: none; color: #dc3545; font-size: 11px; padding: 0.3rem 0.5rem; border-radius: 4px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;';
        
        // ✅ SECURE: Event listeners use API
        decreaseBtn.addEventListener('click', async () => {
            if (quantityInput.value > 1) {
                const newQuantity = parseInt(quantityInput.value) - 1;
                quantityInput.value = newQuantity;
                this.updateItemTotalDisplay(quantityInput, priceElement, itemTotalElement);
                this.updateStickyTotalBar();
                
                const currentCartId = cartItem.dataset.cartId;
                if (currentCartId) {
                    await this.updateCartQuantityViaAPI(currentCartId, newQuantity);
                }
            }
        });
        
        increaseBtn.addEventListener('click', async () => {
            const newQuantity = parseInt(quantityInput.value) + 1;
            quantityInput.value = newQuantity;
            this.updateItemTotalDisplay(quantityInput, priceElement, itemTotalElement);
            this.updateStickyTotalBar();
            
            const currentCartId = cartItem.dataset.cartId;
            if (currentCartId) {
                await this.updateCartQuantityViaAPI(currentCartId, newQuantity);
            }
        });
        
        quantityInput.addEventListener('change', async () => {
            if (quantityInput.value < 1) quantityInput.value = 1;
            const newQuantity = parseInt(quantityInput.value);
            this.updateItemTotalDisplay(quantityInput, priceElement, itemTotalElement);
            this.updateStickyTotalBar();
            
            const currentCartId = cartItem.dataset.cartId;
            if (currentCartId) {
                await this.updateCartQuantityViaAPI(currentCartId, newQuantity);
            }
        });
        
        removeBtn.addEventListener('click', async () => {
            const currentCartId = cartItem.dataset.cartId;
            if (currentCartId && window.removeFromCart) {
                window.removeFromCart(currentCartId);
            } else if (currentCartId) {
                await this.removeCartItemViaAPI(currentCartId);
                cartItem.remove();
                this.updateStickyTotalBar();
            }
        });
        
        quantityContainer.appendChild(decreaseBtn);
        quantityContainer.appendChild(quantityInput);
        quantityContainer.appendChild(increaseBtn);
        
        rightControls.appendChild(itemTotalElement);
        rightControls.appendChild(removeBtn);
        
        controlsContainer.appendChild(quantityContainer);
        controlsContainer.appendChild(rightControls);
        
        infoContainer.appendChild(nameElement);
        infoContainer.appendChild(priceElement);
        infoContainer.appendChild(controlsContainer);
        
        cartItem.appendChild(imageContainer);
        cartItem.appendChild(infoContainer);
        
        cartItem.classList.add('mobile-restructured');
    }
    
    // ✅ SECURE: Remove cart item via backend API
    async removeCartItemViaAPI(cartItemId) {
        if (!cartItemId) {
            console.log('⚠️ Cannot remove: missing cartItemId');
            return;
        }
        
        try {
            console.log(`🗑️ Removing cart item ${cartItemId} via API`);
            
            const token = localStorage.getItem('auth_token') || '';
            const res = await fetch(`${this.API_BASE}/cart/${cartItemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to remove item');
            }
            
            console.log('✅ Cart item removed successfully via API');
            if (typeof showToast === 'function') {
                showToast('Item removed from cart', 'success');
            }
        } catch (error) {
            console.error('❌ Error removing cart item:', error);
            if (typeof showToast === 'function') {
                showToast(error.message || 'Error removing item', 'error');
            }
        }
    }
    
    // ✅ SECURE: Update cart quantity via backend API
    async updateCartQuantityViaAPI(cartItemId, newQuantity) {
        if (!cartItemId) {
            console.log('⚠️ Cannot update: missing cartItemId');
            return;
        }
        
        try {
            console.log(`🔄 Updating cart item ${cartItemId} quantity to ${newQuantity} via API`);
            
            const token = localStorage.getItem('auth_token') || '';
            const res = await fetch(`${this.API_BASE}/cart/${cartItemId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token 
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update quantity');
            }
            
            console.log('✅ Cart quantity updated successfully via API');
        } catch (error) {
            console.error('❌ Error updating cart quantity:', error);
            if (typeof showToast === 'function') {
                showToast(error.message || 'Error updating quantity', 'error');
            }
        }
    }
    
    updateItemTotalDisplay(quantityInput, priceElement, itemTotalElement) {
        if (priceElement && itemTotalElement) {
            const priceText = priceElement.textContent.replace('₹', '').trim();
            const unitPrice = parseFloat(priceText);
            const quantity = parseInt(quantityInput.value) || 1;
            const totalPrice = unitPrice * quantity;
            
            itemTotalElement.textContent = `₹${totalPrice.toFixed(2)}`;
        }
    }
    
    setupStickyTotalBar() {
        const stickyBar = document.getElementById('mobile-cart-total');
        const cartItems = document.querySelectorAll('.cart-item');
        
        if (!stickyBar) {
            return;
        }
        
        if (cartItems.length > 0 && stickyBar) {
            stickyBar.style.display = 'block';
            this.updateStickyTotalBar();
        } else if (stickyBar) {
            stickyBar.style.display = 'none';
        }
    }
    
    updateStickyTotalBar() {
        const cartItems = document.querySelectorAll('.cart-item');
        const totalItemsElement = document.getElementById('mobile-total-items');
        const totalPriceElement = document.getElementById('mobile-total-price');
        const totalSavingsElement = document.getElementById('mobile-total-savings');
        
        if (!totalItemsElement || !totalPriceElement || !totalSavingsElement) {
            return;
        }
        
        let totalItems = 0;
        let totalPrice = 0;
        
        cartItems.forEach(item => {
            let quantity = 1;
            const mobileQuantityInput = item.querySelector('.mobile-quantity-input');
            const quantityInput = item.querySelector('.quantity-input');
            const quantitySpan = item.querySelector('.cart-item-quantity span');
            
            if (mobileQuantityInput) {
                quantity = parseInt(mobileQuantityInput.value) || 1;
            } else if (quantityInput) {
                quantity = parseInt(quantityInput.value) || 1;
            } else if (quantitySpan) {
                quantity = parseInt(quantitySpan.textContent) || 1;
            }
            
            let unitPrice = 0;
            const priceElement = item.querySelector('.cart-item-price');
            if (priceElement) {
                const priceText = priceElement.textContent.replace('₹', '').trim();
                unitPrice = parseFloat(priceText) || 0;
            }
            
            totalItems += quantity;
            totalPrice += unitPrice * quantity;
        });
        
        if (totalItemsElement) {
            totalItemsElement.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
        }
        
        if (totalPriceElement) {
            totalPriceElement.textContent = `₹${totalPrice.toFixed(2)}`;
        }
        
        if (totalSavingsElement) {
            const savings = Math.floor(totalPrice * 0.05);
            totalSavingsElement.textContent = savings > 0 ? `You saved ₹${savings}` : '';
        }
    }
}

// Initialize
if (typeof window !== 'undefined') {
    window.MobileCartHandler = MobileCartHandler;
    new MobileCartHandler();
}

console.log('⚡ Mobile Cart Handler loaded (SECURE MODE - using backend API)');
