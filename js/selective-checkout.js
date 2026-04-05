// Selective Checkout Handler - Mobile Cart Selection
class SelectiveCheckoutHandler {
    constructor() {
        this.selectedItems = new Set();
        this.init();
    }
    
    init() {
        console.log('🛒 Selective Checkout Handler initializing...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupSelectiveCheckout();
            });
        } else {
            this.setupSelectiveCheckout();
        }
    }
    
    setupSelectiveCheckout() {
        // Wait for cart to load, then add selection functionality
        setTimeout(() => {
            this.addSelectionToCartItems();
            this.setupSelectAllToggle();
            this.updateCheckoutButton();
        }, 1000);
        
        // Listen for cart updates
        document.addEventListener('cartUpdated', () => {
            setTimeout(() => {
                this.addSelectionToCartItems();
                this.updateTotals();
            }, 100);
        });
    }
    
    addSelectionToCartItems() {
        const cartItems = document.querySelectorAll('.cart-item:not(.selection-enabled)');
        
        cartItems.forEach(item => {
            this.addSelectionToItem(item);
        });
        
        // Update totals after adding selections
        this.updateTotals();
    }
    
    addSelectionToItem(cartItem) {
        if (cartItem.classList.contains('selection-enabled')) {
            return;
        }
        
        console.log('🚫 Selection checkbox creation disabled per user request');
        
        // Get cart item ID
        const cartItemId = cartItem.dataset.cartId || cartItem.dataset.productId || Math.random().toString(36).substr(2, 9);
        cartItem.dataset.cartId = cartItemId;
        
        // Add to selected items by default (no checkbox needed)
        this.selectedItems.add(cartItemId);
        
        // Add selection styling without checkbox
        cartItem.classList.add('selection-enabled', 'selected');
        
        // Update item styling as selected
        this.updateItemSelectionStyle(cartItem, true);
    }
    
    handleItemSelection(checkbox) {
        const cartItemId = checkbox.dataset.cartId;
        const cartItem = checkbox.closest('.cart-item');
        
        if (checkbox.checked) {
            this.selectedItems.add(cartItemId);
            cartItem.classList.add('selected');
            this.updateItemSelectionStyle(cartItem, true);
            console.log(`✅ Selected item: ${cartItemId}`);
        } else {
            this.selectedItems.delete(cartItemId);
            cartItem.classList.remove('selected');
            this.updateItemSelectionStyle(cartItem, false);
            console.log(`❌ Deselected item: ${cartItemId}`);
        }
        
        this.updateTotals();
        // Skip select all toggle update - disabled per user request
        this.updateCheckoutButton();
    }
    
    updateItemSelectionStyle(cartItem, isSelected) {
        if (isSelected) {
            cartItem.style.opacity = '1';
            cartItem.style.backgroundColor = '#ffffff';
            cartItem.style.border = '2px solid #4a7c59';
            cartItem.style.borderRadius = '8px';
        } else {
            cartItem.style.opacity = '0.6';
            cartItem.style.backgroundColor = '#f8f9fa';
            cartItem.style.border = '2px solid #e0e0e0';
            cartItem.style.borderRadius = '8px';
        }
    }
    
    setupSelectAllToggle() {
        // Select All functionality disabled per user request
        console.log('📝 Select All toggle disabled');
        
        // Remove any existing select all containers
        const existingSelectAlls = document.querySelectorAll('.select-all-container');
        existingSelectAlls.forEach(container => container.remove());
        
        return;
    }
    
    handleSelectAll(selectAll) {
        const checkboxes = document.querySelectorAll('.cart-item-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
            this.handleItemSelection(checkbox);
        });
        
        console.log(`🔄 ${selectAll ? 'Selected' : 'Deselected'} all items`);
    }
    
    updateSelectAllToggle() {
        // Select All functionality disabled per user request
        console.log('📝 Select All toggle update disabled');
        return;
    }
    
    updateSelectedCount() {
        // Select All count display disabled per user request
        console.log('📝 Select All count display disabled');
        return;
    }
    
    updateTotals() {
        let selectedItemsCount = 0;
        let selectedTotalPrice = 0;
        
        // Calculate totals for selected items only
        this.selectedItems.forEach(cartItemId => {
            const cartItem = document.querySelector(`[data-cart-id="${cartItemId}"]`);
            if (!cartItem) return;
            
            // Get quantity
            let quantity = 1;
            const mobileQuantityInput = cartItem.querySelector('.mobile-quantity-input');
            const quantityInput = cartItem.querySelector('.quantity-input');
            const quantitySpan = cartItem.querySelector('.cart-item-quantity span');
            
            if (mobileQuantityInput) {
                quantity = parseInt(mobileQuantityInput.value) || 1;
            } else if (quantityInput) {
                quantity = parseInt(quantityInput.value) || 1;
            } else if (quantitySpan) {
                quantity = parseInt(quantitySpan.textContent) || 1;
            }
            
            // Get unit price
            let unitPrice = 0;
            const priceElement = cartItem.querySelector('.cart-item-price');
            if (priceElement) {
                const priceText = priceElement.textContent.replace('₹', '').trim();
                unitPrice = parseFloat(priceText) || 0;
            }
            
            selectedItemsCount += quantity;
            selectedTotalPrice += unitPrice * quantity;
        });
        
        console.log(`💰 Selected totals: ${selectedItemsCount} items, ₹${selectedTotalPrice}`);
        
        // Update mobile sticky total bar
        this.updateMobileTotalBar(selectedItemsCount, selectedTotalPrice);
        
        // Update desktop cart summary if it exists
        this.updateDesktopCartSummary(selectedItemsCount, selectedTotalPrice);
    }
    
    updateMobileTotalBar(itemCount, totalPrice) {
        // Mobile cart total bar disabled - skip update
        const totalItemsElement = document.getElementById('mobile-total-items');
        const totalPriceElement = document.getElementById('mobile-total-price');
        const totalSavingsElement = document.getElementById('mobile-total-savings');
        
        // Skip if mobile elements don't exist (bar removed)
        if (!totalItemsElement || !totalPriceElement || !totalSavingsElement) {
            return;
        }
        
        if (totalItemsElement) {
            totalItemsElement.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''} selected`;
        }
        
        if (totalPriceElement) {
            totalPriceElement.textContent = `₹${totalPrice.toFixed(2)}`;
        }
        
        if (totalSavingsElement) {
            const savings = Math.floor(totalPrice * 0.05); // 5% savings example
            totalSavingsElement.textContent = savings > 0 ? `You saved ₹${savings}` : '';
        }
    }
    
    updateDesktopCartSummary(itemCount, totalPrice) {
        // Update desktop cart summary if it exists
        const cartSummary = document.querySelector('.cart-summary');
        if (cartSummary) {
            const totalElement = cartSummary.querySelector('h3');
            if (totalElement) {
                totalElement.textContent = `Selected Items Total: ₹${totalPrice.toFixed(2)}`;
            }
        }
    }
    
    updateCheckoutButton() {
        const checkoutButton = document.querySelector('.checkout-btn-mobile');
        const selectedCount = this.selectedItems.size;
        
        if (checkoutButton) {
            if (selectedCount === 0) {
                checkoutButton.textContent = 'Select Items to Checkout';
                checkoutButton.disabled = true;
                checkoutButton.style.opacity = '0.6';
                checkoutButton.style.cursor = 'not-allowed';
            } else {
                checkoutButton.textContent = `Checkout ${selectedCount} Item${selectedCount !== 1 ? 's' : ''}`;
                checkoutButton.disabled = false;
                checkoutButton.style.opacity = '1';
                checkoutButton.style.cursor = 'pointer';
            }
        }
    }
    
    getSelectedItems() {
        const selectedItemsData = [];
        
        this.selectedItems.forEach(cartItemId => {
            const cartItem = document.querySelector(`[data-cart-id="${cartItemId}"]`);
            if (!cartItem) return;
            
            // Extract item data
            const nameElement = cartItem.querySelector('.cart-item-details h3');
            const priceElement = cartItem.querySelector('.cart-item-price');
            const imageElement = cartItem.querySelector('img');
            
            let quantity = 1;
            const mobileQuantityInput = cartItem.querySelector('.mobile-quantity-input');
            const quantityInput = cartItem.querySelector('.quantity-input');
            const quantitySpan = cartItem.querySelector('.cart-item-quantity span');
            
            if (mobileQuantityInput) {
                quantity = parseInt(mobileQuantityInput.value) || 1;
            } else if (quantityInput) {
                quantity = parseInt(quantityInput.value) || 1;
            } else if (quantitySpan) {
                quantity = parseInt(quantitySpan.textContent) || 1;
            }
            
            const itemData = {
                cartId: cartItemId,
                name: nameElement ? nameElement.textContent : 'Unknown Product',
                price: priceElement ? parseFloat(priceElement.textContent.replace('₹', '')) : 0,
                quantity: quantity,
                image: imageElement ? imageElement.src : '',
                total: 0
            };
            
            itemData.total = itemData.price * itemData.quantity;
            selectedItemsData.push(itemData);
        });
        
        return selectedItemsData;
    }
    
    proceedToSelectiveCheckout() {
        const selectedItems = this.getSelectedItems();
        
        if (selectedItems.length === 0) {
            alert('Please select at least one item to checkout.');
            return;
        }
        
        console.log('🛒 Proceeding to checkout with selected items:', selectedItems);
        
        // Store selected items in localStorage for checkout page
        localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
        
        // Calculate totals
        const totalAmount = selectedItems.reduce((sum, item) => sum + item.total, 0);
        const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        localStorage.setItem('checkoutSummary', JSON.stringify({
            totalItems: totalItems,
            totalAmount: totalAmount,
            selectedItemsCount: selectedItems.length
        }));
        
        // Redirect to checkout
        window.location.href = 'checkout.html';
    }
}

// Override the global proceedToCheckout function
function proceedToCheckout() {
    // Since checkboxes are disabled, proceed with all cart items
    console.log('🛒 Proceeding to checkout with all cart items (no selection needed)');
    
    const cartItems = document.querySelectorAll('.cart-item');
    if (cartItems.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        return;
    }
    
    // Redirect to checkout - let checkout.html handle loading all cart items
    window.location.href = 'checkout.html';
}

// Initialize selective checkout handler
window.selectiveCheckoutHandler = new SelectiveCheckoutHandler();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SelectiveCheckoutHandler;
}