// Enhanced Cart System - Real Ecommerce Functionality (Fixed)
class EnhancedCartSystem {
    constructor() {
        this.selectedItems = new Set();
        this.cartItems = new Map();
        this.init();
    }
    
    init() {
        console.log('🛒 Enhanced Cart System initializing...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupCart();
            });
        } else {
            this.setupCart();
        }
    }
    
    setupCart() {
        setTimeout(() => {
            this.enhanceCartItems();
            this.setupSelectAllToggle();
            this.updateCartSummary();
            this.setupEventListeners();
        }, 1000);
        
        document.addEventListener('cartUpdated', () => {
            setTimeout(() => {
                this.enhanceCartItems();
                this.updateCartSummary();
            }, 100);
        });
    }
    
    enhanceCartItems() {
        const cartItems = document.querySelectorAll('.cart-item:not(.enhanced)');
        
        cartItems.forEach(item => {
            this.enhanceCartItem(item);
        });
        
        this.updateCartSummary();
    }
    
    enhanceCartItem(cartItem) {
        if (cartItem.classList.contains('enhanced')) return;
        
        console.log('✨ Enhancing cart item');
        
        const cartItemId = this.getCartItemId(cartItem);
        const itemData = this.extractItemData(cartItem);
        
        this.cartItems.set(cartItemId, itemData);
        
        this.addSelectionCheckbox(cartItem, cartItemId);
        this.enhanceQuantityControls(cartItem, cartItemId);
        this.enhanceRemoveButton(cartItem, cartItemId);
        
        cartItem.classList.add('enhanced');
        cartItem.dataset.cartId = cartItemId;
        
        this.selectedItems.add(cartItemId);
        this.updateItemSelectionState(cartItem, true);
    }
    
    getCartItemId(cartItem) {
        let cartItemId = cartItem.dataset.cartId || cartItem.dataset.productId;
        
        if (!cartItemId) {
            const buttons = cartItem.querySelectorAll('button[onclick]');
            for (const button of buttons) {
                const onclick = button.getAttribute('onclick');
                const match = onclick && onclick.match(/['"]([^'"]+)['"]/);
                if (match) {
                    cartItemId = match[1];
                    break;
                }
            }
        }
        
        if (!cartItemId) {
            cartItemId = 'cart_' + Math.random().toString(36).substr(2, 9);
        }
        
        return cartItemId;
    }
    
    extractItemData(cartItem) {
        const nameElement = cartItem.querySelector('.cart-item-details h3, h3');
        const priceElement = cartItem.querySelector('.cart-item-price');
        const imageElement = cartItem.querySelector('img');
        const quantityElement = cartItem.querySelector('.quantity-input, .mobile-quantity-input, .cart-item-quantity span');
        
        let quantity = 1;
        if (quantityElement) {
            if (quantityElement.tagName === 'INPUT') {
                quantity = parseInt(quantityElement.value) || 1;
            } else {
                quantity = parseInt(quantityElement.textContent) || 1;
            }
        }
        
        const unitPrice = priceElement ? 
            parseFloat(priceElement.textContent.replace('₹', '').replace(',', '')) || 0 : 0;
        
        return {
            name: nameElement ? nameElement.textContent.trim() : 'Unknown Product',
            unitPrice: unitPrice,
            quantity: quantity,
            image: imageElement ? imageElement.src : '',
            total: unitPrice * quantity
        };
    }
    
    addSelectionCheckbox(cartItem, cartItemId) {
        if (cartItem.querySelector('.cart-item-checkbox')) return;
        
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'cart-item-selection';
        checkboxContainer.style.cssText = 'position: absolute; top: 12px; left: 12px; z-index: 10;';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'cart-item-checkbox';
        checkbox.checked = true;
        checkbox.dataset.cartId = cartItemId;
        checkbox.style.cssText = 'width: 20px; height: 20px; cursor: pointer; accent-color: #4a7c59;';
        
        checkbox.addEventListener('change', (e) => {
            this.handleItemSelection(e.target);
        });
        
        checkboxContainer.appendChild(checkbox);
        
        cartItem.style.position = 'relative';
        cartItem.style.paddingLeft = '45px';
        
        cartItem.insertBefore(checkboxContainer, cartItem.firstChild);
    }
    
    enhanceQuantityControls(cartItem, cartItemId) {
        let quantityContainer = cartItem.querySelector('.quantity-selector, .mobile-quantity-controls');
        
        if (!quantityContainer) {
            quantityContainer = this.createQuantityControls(cartItemId);
            
            const controlsArea = cartItem.querySelector('.cart-item-controls, .cart-item-actions');
            if (controlsArea) {
                controlsArea.insertBefore(quantityContainer, controlsArea.firstChild);
            } else {
                const newControlsArea = document.createElement('div');
                newControlsArea.className = 'cart-item-controls';
                newControlsArea.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-top: 8px; gap: 8px;';
                newControlsArea.appendChild(quantityContainer);
                
                const detailsContainer = cartItem.querySelector('.cart-item-details');
                if (detailsContainer) {
                    detailsContainer.appendChild(newControlsArea);
                }
            }
        } else {
            this.enhanceExistingQuantityControls(quantityContainer, cartItemId);
        }
    }
    
    createQuantityControls(cartItemId) {
        const quantityContainer = document.createElement('div');
        quantityContainer.className = 'quantity-selector enhanced-quantity';
        quantityContainer.style.cssText = 'display: flex; align-items: center; background: #f8f9fa; border-radius: 20px; padding: 4px; gap: 4px; border: 1px solid #e0e0e0;';
        
        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'quantity-btn decrease-btn';
        decreaseBtn.textContent = '−';
        decreaseBtn.style.cssText = 'width: 28px; height: 28px; border: none; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #4a7c59; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.1);';
        
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.className = 'quantity-input enhanced-quantity-input';
        quantityInput.value = this.cartItems.get(cartItemId) ? this.cartItems.get(cartItemId).quantity : 1;
        quantityInput.min = '1';
        quantityInput.dataset.cartId = cartItemId;
        quantityInput.style.cssText = 'width: 35px; text-align: center; border: none; background: transparent; font-size: 13px; font-weight: 600; color: #333; padding: 0;';
        
        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'quantity-btn increase-btn';
        increaseBtn.textContent = '+';
        increaseBtn.style.cssText = 'width: 28px; height: 28px; border: none; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #4a7c59; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.1);';
        
        decreaseBtn.addEventListener('click', () => this.decreaseQuantity(cartItemId));
        increaseBtn.addEventListener('click', () => this.increaseQuantity(cartItemId));
        quantityInput.addEventListener('change', (e) => this.updateQuantity(cartItemId, parseInt(e.target.value)));
        
        quantityContainer.appendChild(decreaseBtn);
        quantityContainer.appendChild(quantityInput);
        quantityContainer.appendChild(increaseBtn);
        
        return quantityContainer;
    }