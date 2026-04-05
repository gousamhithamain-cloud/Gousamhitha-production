// Selective Checkout Handler for Checkout Page
class SelectiveCheckoutPageHandler {
    constructor() {
        this.selectedItems = [];
        this.checkoutSummary = null;
        this.init();
    }
    
    init() {
        console.log('🛒 Selective Checkout Page Handler initializing...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadSelectedItems();
            });
        } else {
            this.loadSelectedItems();
        }
    }
    
    loadSelectedItems() {
        // Check if we have selected items from cart
        const selectedItemsData = localStorage.getItem('selectedCartItems');
        const checkoutSummaryData = localStorage.getItem('checkoutSummary');
        
        if (selectedItemsData) {
            this.selectedItems = JSON.parse(selectedItemsData);
            console.log('📦 Loaded selected items:', this.selectedItems);
        } else {
            console.log('📦 No selected items found - using all cart items');
            // Don't override checkout if no selected items
            return;
        }
        
        if (checkoutSummaryData) {
            this.checkoutSummary = JSON.parse(checkoutSummaryData);
            console.log('💰 Loaded checkout summary:', this.checkoutSummary);
        }
        
        // Only override checkout if we have selected items
        if (this.selectedItems.length > 0) {
            this.overrideCheckoutSummary();
        }
    }
    
    overrideCheckoutSummary() {
        // Override the loadCheckoutSummary function
        const originalLoadCheckoutSummary = window.loadCheckoutSummary;
        
        window.loadCheckoutSummary = () => {
            this.displaySelectedItemsSummary();
        };
        
        // Call immediately if page is already loaded
        if (document.getElementById('checkout-summary')) {
            this.displaySelectedItemsSummary();
        }
    }
    
    displaySelectedItemsSummary() {
        const summaryDiv = document.getElementById('checkout-summary');
        if (!summaryDiv) return;
        
        console.log('🎯 Displaying selected items summary');
        
        // Calculate totals
        const subtotal = this.selectedItems.reduce((sum, item) => sum + item.total, 0);
        const totalItems = this.selectedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        // Set global cartSubtotal for delivery calculation
        window.cartSubtotal = subtotal;
        
        let html = '<div class="summary-items">';
        html += `<div style="background: #e8f5e8; padding: 12px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #4a7c59;">
            <div style="font-weight: 600; color: #4a7c59; font-size: 14px;">
                ✅ Selected Items (${this.selectedItems.length} of ${totalItems} items)
            </div>
        </div>`;
        
        // Display selected items
        this.selectedItems.forEach(item => {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">` : ''}
                        <div>
                            <div style="font-weight: 500; font-size: 14px; color: #333;">${item.name}</div>
                            <div style="font-size: 12px; color: #666;">Qty: ${item.quantity} × ₹${item.price.toFixed(2)}</div>
                        </div>
                    </div>
                    <div style="font-weight: 600; color: #4a7c59;">₹${item.total.toFixed(2)}</div>
                </div>
            `;
        });
        html += '</div>';
        
        // Add totals section
        html += `
            <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #eee;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span>Subtotal (${totalItems} items)</span>
                    <span id="cart-subtotal">₹${subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span>Delivery Charge</span>
                    <span id="delivery-charge" style="color: #4caf50; font-weight: 600;">Enter pincode</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid #ddd; font-weight: 700; font-size: 16px; color: #4a7c59;">
                    <span>Total</span>
                    <span id="order-total">₹${subtotal.toFixed(2)}</span>
                </div>
            </div>
        `;
        
        summaryDiv.innerHTML = html;
        
        // Update delivery calculation if pincode is already entered
        const pincodeInput = document.getElementById('pincode');
        if (pincodeInput && pincodeInput.value) {
            this.calculateDeliveryForPincode(pincodeInput.value);
        }
        
        console.log('✅ Selected items summary displayed');
    }
    
    calculateDeliveryForPincode(pincode) {
        // Use existing delivery calculation logic
        if (window.calculateDeliveryCharge) {
            window.calculateDeliveryCharge(pincode);
        }
    }
    
    getSelectedItemsForOrder() {
        // Return selected items in format expected by order creation
        return this.selectedItems.map(item => ({
            cart_id: item.cartId,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total
        }));
    }
    
    // Override the order creation to use selected items
    overrideOrderCreation() {
        // Only override if we have selected items
        if (this.selectedItems.length === 0) {
            console.log('📝 No selected items - skipping order creation override');
            return;
        }
        
        const originalHandleCheckoutSubmit = window.handleCheckoutSubmit;
        
        window.handleCheckoutSubmit = async (event) => {
            if (this.selectedItems.length > 0) {
                return this.handleSelectiveCheckoutSubmit(event);
            } else {
                return originalHandleCheckoutSubmit(event);
            }
        };
    }
    
    async handleSelectiveCheckoutSubmit(event) {
        event.preventDefault();
        
        console.log('🚀 Processing selective checkout...');
        
        // Get form data
        const form = document.getElementById('checkout-form');
        const formData = new FormData(form);
        
        // Validate required fields
        const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'pincode'];
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                alert(`Please fill in the ${field} field`);
                return;
            }
        }
        
        try {
            // Get current user
            const { data: { user } } = await window.supabase.auth.getUser();
            
            if (!user) {
                alert('Please login to place order');
                return;
            }
            
            // Calculate totals
            const subtotal = this.selectedItems.reduce((sum, item) => sum + item.total, 0);
            const deliveryCharge = window.currentDeliveryCharge || 0;
            const totalAmount = subtotal + deliveryCharge;
            
            // Create order
            const orderData = {
                user_id: user.id,
                customer_name: formData.get('name'),
                customer_email: formData.get('email'),
                customer_phone: formData.get('phone'),
                delivery_address: formData.get('address'),
                city: formData.get('city'),
                pincode: formData.get('pincode'),
                order_notes: formData.get('notes') || '',
                subtotal: subtotal,
                delivery_charge: deliveryCharge,
                total_amount: totalAmount,
                status: 'pending',
                payment_status: 'pending'
            };
            
            console.log('📝 Creating order via API...');

            const token = localStorage.getItem('auth_token') || '';
            const res = await fetch(`${window.API_BASE_URL || 'http://localhost:4000/api'}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({
                    user_id: user.id,
                    customer_name: formData.get('name'),
                    customer_email: formData.get('email'),
                    customer_phone: formData.get('phone'),
                    delivery_address: formData.get('address'),
                    city: formData.get('city'),
                    pincode: formData.get('pincode'),
                    order_notes: formData.get('notes') || '',
                    subtotal,
                    delivery_charge: deliveryCharge,
                    total_amount: totalAmount,
                    items: this.selectedItems.map(item => ({
                        product_id: item.cartId,
                        product_name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Order creation failed');
            const order = json.order;
            console.log('✅ Order created:', order);

            localStorage.removeItem('selectedCartItems');
            localStorage.removeItem('checkoutSummary');
            alert(`Order placed successfully! Order ID: ${order.id}`);
            window.location.href = `orders.html?order=${order.id}`;
            
        } catch (error) {
            console.error('❌ Checkout error:', error);
            alert('An error occurred during checkout. Please try again.');
        }
    }
    
    async removeSelectedItemsFromCart() {
        // Cart is cleared server-side by the order creation API
        console.log('✅ Cart cleared by backend order API');
    }
}

// Initialize selective checkout page handler
window.selectiveCheckoutPageHandler = new SelectiveCheckoutPageHandler();

// Override order creation when page loads ONLY if we have selected items
document.addEventListener('DOMContentLoaded', () => {
    if (window.selectiveCheckoutPageHandler.selectedItems.length > 0) {
        window.selectiveCheckoutPageHandler.overrideOrderCreation();
        console.log('✅ Selective checkout override enabled');
    } else {
        console.log('📝 No selected items - using default checkout process');
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SelectiveCheckoutPageHandler;
}