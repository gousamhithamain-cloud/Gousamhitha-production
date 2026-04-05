// Working Cart Selection System - Real Implementation
class WorkingCartSelection {
    constructor() {
        this.selectedItems = new Set();
        this.cartItems = new Map();
        this.isInitialized = false;
        this.init();
    }
    
    init() {
        console.log('🛒 Working Cart Selection System initializing...');
        
        // Wait for DOM and other scripts to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.setupCartSelection(), 2000);
            });
        } else {
            setTimeout(() => this.setupCartSelection(), 2000);
        }
    }
    
    setupCartSelection() {
        if (this.isInitialized) return;
        
        console.log('🔧 Setting up cart selection...');
        
        // Remove any existing select all containers
        const existingSelectAlls = document.querySelectorAll('.select-all-container, .working-select-all');
        existingSelectAlls.forEach(container => container.remove());
        
        // Wait for cart items to load
        this.waitForCartItems().then(() => {
            // Skip adding select all toggle (removed per user request)
            this.addItemCheckboxes();
            this.updateSelectionDisplay();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('✅ Cart selection system ready (without Select All)');
        });
    }
    
    waitForCartItems() {
        return new Promise((resolve) => {
            const checkForItems = () => {
                const cartItems = document.querySelectorAll('.cart-item');
                if (cartItems.length > 0) {
                    console.log(`📦 Found ${cartItems.length} cart items`);
                    resolve();
                } else {
                    // Reduce console spam - only log every 5th attempt
                    if (!window.cartWaitLogCount) window.cartWaitLogCount = 0;
                    window.cartWaitLogCount++;
                    
                    if (window.cartWaitLogCount % 5 === 0) {
                        console.log(`⏳ Waiting for cart items to load... (attempt ${window.cartWaitLogCount})`);
                    }
                    
                    setTimeout(checkForItems, 500);
                }
            };
            checkForItems();
        });
    }
    
    addSelectAllToggle() {
        // Skip adding select all toggle - removed per user request
        console.log('📝 Select All toggle creation disabled per user request');
        return;
    }
    
    addItemCheckboxes() {
        const cartItems = document.querySelectorAll('.cart-item');
        
        cartItems.forEach((cartItem, index) => {
            // Skip if already has working checkbox
            if (cartItem.querySelector('.working-item-checkbox')) return;
            
            const cartItemId = this.getCartItemId(cartItem, index);
            const itemData = this.extractItemData(cartItem);
            
            // Store item data
            this.cartItems.set(cartItemId, itemData);
            
            // Add checkbox
            this.addCheckboxToItem(cartItem, cartItemId);
            
            // Select by default
            this.selectedItems.add(cartItemId);
            this.updateItemVisualState(cartItem, true);
            
            console.log(`✅ Added checkbox to item: ${cartItemId}`);
        });
    }
    
    getCartItemId(cartItem, index) {
        // Try existing IDs first
        let cartItemId = cartItem.dataset.cartId || cartItem.dataset.productId;
        
        // Try to extract from buttons
        if (!cartItemId) {
            const buttons = cartItem.querySelectorAll('button[onclick]');
            for (const button of buttons) {
                const onclick = button.getAttribute('onclick');
                if (onclick) {
                    const match = onclick.match(/['"]([^'"]+)['"]/);
                    if (match) {
                        cartItemId = match[1];
                        break;
                    }
                }
            }
        }
        
        // Fallback to index-based ID
        if (!cartItemId) {
            cartItemId = `cart-item-${index}`;
        }
        
        // Set the ID on the element
        cartItem.dataset.workingCartId = cartItemId;
        
        return cartItemId;
    }
    
    extractItemData(cartItem) {
        const nameElement = cartItem.querySelector('.cart-item-details h3, h3');
        const priceElement = cartItem.querySelector('.cart-item-price');
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
            name: nameElement ? nameElement.textContent.trim() : 'Product',
            unitPrice: unitPrice,
            quantity: quantity,
            total: unitPrice * quantity
        };
    }
    
    addCheckboxToItem(cartItem, cartItemId) {
        // Checkbox creation disabled per user request
        console.log('🚫 Checkbox creation disabled per user request');
        
        // Just mark as selected without checkbox
        cartItem.style.position = 'relative';
        cartItem.dataset.workingCartId = cartItemId;
        
        return;
    }
    
    handleSelectAll(selectAll) {
        console.log(`🔄 ${selectAll ? 'Selecting' : 'Deselecting'} all items`);
        
        const itemCheckboxes = document.querySelectorAll('.working-item-checkbox');
        
        itemCheckboxes.forEach(checkbox => {
            const cartItemId = checkbox.dataset.cartId;
            const cartItem = checkbox.closest('.cart-item');
            
            checkbox.checked = selectAll;
            
            if (selectAll) {
                this.selectedItems.add(cartItemId);
                this.updateItemVisualState(cartItem, true);
            } else {
                this.selectedItems.delete(cartItemId);
                this.updateItemVisualState(cartItem, false);
            }
        });
        
        this.updateSelectionDisplay();
        this.updateCheckoutButton();
    }
    
    handleItemSelection(checkbox) {
        const cartItemId = checkbox.dataset.cartId;
        const cartItem = checkbox.closest('.cart-item');
        
        if (checkbox.checked) {
            this.selectedItems.add(cartItemId);
            this.updateItemVisualState(cartItem, true);
            console.log(`✅ Selected: ${cartItemId}`);
        } else {
            this.selectedItems.delete(cartItemId);
            this.updateItemVisualState(cartItem, false);
            console.log(`❌ Deselected: ${cartItemId}`);
        }
        
        this.updateSelectAllState();
        this.updateSelectionDisplay();
        this.updateCheckoutButton();
    }
    
    updateItemVisualState(cartItem, isSelected) {
        if (isSelected) {
            cartItem.classList.add('working-selected');
            cartItem.style.opacity = '1';
            cartItem.style.backgroundColor = '#ffffff';
            cartItem.style.border = '2px solid #4a7c59';
            cartItem.style.borderRadius = '8px';
            cartItem.style.boxShadow = '0 2px 8px rgba(74, 124, 89, 0.15)';
        } else {
            cartItem.classList.remove('working-selected');
            cartItem.style.opacity = '0.6';
            cartItem.style.backgroundColor = '#f8f9fa';
            cartItem.style.border = '2px solid #e0e0e0';
            cartItem.style.borderRadius = '8px';
            cartItem.style.boxShadow = 'none';
        }
    }
    
    updateSelectAllState() {
        // Skip select all state updates - removed per user request
        console.log('📝 Select All state update disabled per user request');
        return;
    }
    
    updateSelectionDisplay() {
        // Mobile cart total bar disabled - skip mobile elements
        const mobileItemsElement = document.getElementById('mobile-total-items');
        const mobilePriceElement = document.getElementById('mobile-total-price');
        const mobileSavingsElement = document.getElementById('mobile-total-savings');
        
        // Skip if mobile elements don't exist (bar removed)
        if (!mobileItemsElement || !mobilePriceElement || !mobileSavingsElement) {
            return;
        }
        
        const totalItems = document.querySelectorAll('.cart-item').length;
        
        // Calculate totals for ALL items (since checkboxes are disabled)
        let totalPrice = 0;
        let totalQuantity = 0;
        
        this.cartItems.forEach((itemData, cartItemId) => {
            totalPrice += itemData.total;
            totalQuantity += itemData.quantity;
        });
        
        const savings = totalPrice * 0.05; // 5% savings
        
        // Update mobile sticky bar only (removed select all count display)
        if (mobileItemsElement) {
            mobileItemsElement.textContent = `${totalQuantity} item${totalQuantity !== 1 ? 's' : ''}`;
        }
        
        if (mobilePriceElement) {
            mobilePriceElement.textContent = `₹${totalPrice.toFixed(2)}`;
        }
        
        if (mobileSavingsElement) {
            mobileSavingsElement.textContent = savings > 0 ? `You saved ₹${savings.toFixed(0)}` : '';
        }
        
        console.log(`💰 Updated totals: ${totalQuantity} quantity, ₹${totalPrice.toFixed(2)}`);
    }
    
    updateCheckoutButton() {
        const checkoutButtons = document.querySelectorAll('.checkout-btn-mobile');
        const selectedCount = this.selectedItems.size;
        
        checkoutButtons.forEach(button => {
            if (selectedCount === 0) {
                button.textContent = 'Select Items to Checkout';
                button.disabled = true;
                button.style.opacity = '0.6';
                button.style.cursor = 'not-allowed';
                button.style.background = '#ccc';
            } else {
                button.textContent = `Checkout ${selectedCount} Item${selectedCount !== 1 ? 's' : ''}`;
                button.disabled = false;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
                button.style.background = '#4a7c59';
            }
        });
    }
    
    setupEventListeners() {
        // Listen for quantity changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('.quantity-input, .mobile-quantity-input')) {
                const cartItem = e.target.closest('.cart-item');
                const cartItemId = cartItem?.dataset.workingCartId;
                
                if (cartItemId && this.cartItems.has(cartItemId)) {
                    const itemData = this.cartItems.get(cartItemId);
                    itemData.quantity = parseInt(e.target.value) || 1;
                    itemData.total = itemData.unitPrice * itemData.quantity;
                    
                    this.updateSelectionDisplay();
                }
            }
        });
        
        // Listen for item removal
        document.addEventListener('click', (e) => {
            if (e.target.matches('.remove-btn, .mobile-remove-btn, button[onclick*="remove"]')) {
                const cartItem = e.target.closest('.cart-item');
                const cartItemId = cartItem?.dataset.workingCartId;
                
                if (cartItemId) {
                    setTimeout(() => {
                        this.selectedItems.delete(cartItemId);
                        this.cartItems.delete(cartItemId);
                        this.updateSelectAllState();
                        this.updateSelectionDisplay();
                        this.updateCheckoutButton();
                    }, 100);
                }
            }
        });
    }
    
    // Method to get selected items for checkout
    getSelectedItemsData() {
        const selectedItemsData = [];
        
        this.selectedItems.forEach(cartItemId => {
            const itemData = this.cartItems.get(cartItemId);
            if (itemData) {
                selectedItemsData.push({
                    cartId: cartItemId,
                    name: itemData.name,
                    unitPrice: itemData.unitPrice,
                    quantity: itemData.quantity,
                    total: itemData.total
                });
            }
        });
        
        return selectedItemsData;
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

// Initialize the working cart selection system
window.workingCartSelection = new WorkingCartSelection();

// Also make it available globally for debugging
window.WorkingCartSelection = WorkingCartSelection;

console.log('✅ Working Cart Selection System loaded');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkingCartSelection;
}
// Debug function to check system status
window.debugCartSelection = function() {
    console.log('🔍 Cart Selection Debug Info:');
    console.log('- System initialized:', window.workingCartSelection?.isInitialized);
    console.log('- Selected items:', window.workingCartSelection?.selectedItems);
    console.log('- Cart items:', window.workingCartSelection?.cartItems);
    console.log('- Total cart items in DOM:', document.querySelectorAll('.cart-item').length);
    console.log('- Working checkboxes:', document.querySelectorAll('.working-item-checkbox').length);
    console.log('- Select all checkbox:', document.getElementById('working-select-all'));
    
    if (window.workingCartSelection) {
        window.workingCartSelection.updateSelectionDisplay();
    }
};

// Auto-debug after 5 seconds
setTimeout(() => {
    console.log('🔧 Auto-debugging cart selection...');
    window.debugCartSelection();
}, 5000);