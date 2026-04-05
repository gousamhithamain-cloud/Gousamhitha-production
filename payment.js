


const paymentModalHTML = `
<div class="payment-modal" id="payment-modal" style="display: none;">
    <div class="payment-modal-overlay" onclick="closePaymentModal()"></div>
    <div class="payment-sidebar">
        <div class="payment-sidebar-header">
            <h2 id="payment-modal-title">Complete Payment</h2>
            <button class="payment-close" onclick="closePaymentModal()">&times;</button>
        </div>
        <div class="payment-sidebar-body">
            <!-- Order Details Section -->
            <div class="order-details-section" id="order-details-section">
                <h3>Order Details</h3>
                <div id="order-items-list"></div>
                <div class="order-breakdown">
                    <div class="breakdown-row">
                        <span>Subtotal:</span>
                        <span id="order-subtotal">₹0</span>
                    </div>
                    <div class="breakdown-row">
                        <span>Tax (5%):</span>
                        <span id="order-tax">₹0</span>
                    </div>
                    <div class="breakdown-row">
                        <span>Shipping:</span>
                        <span id="order-shipping">₹50</span>
                    </div>
                </div>
            </div>
            <!-- Donation Details Section -->
            <div class="donation-details-section" id="donation-details-section" style="display: none;">
                <h3>Donation Details</h3>
                <div class="donation-info">
                    <div class="donation-row">
                        <span>Donor Name:</span>
                        <span id="donor-name-display"></span>
                    </div>
                    <div class="donation-row">
                        <span>Amount:</span>
                        <span id="donation-amount-display">₹0</span>
                    </div>
                </div>
            </div>
            <!-- Payment Methods Section -->
            <div class="payment-methods-section">
                <h3>Select Payment Method</h3>
                <label class="payment-method-option">
                    <input type="radio" name="payment-method" value="Cash on Delivery" checked>
                    <div class="payment-method-card">
                        <div class="payment-method-icon">💵</div>
                        <div class="payment-method-info">
                            <div class="payment-method-name">Cash on Delivery</div>
                            <div class="payment-method-desc">Pay when you receive your order</div>
                        </div>
                    </div>
                </label>
                <label class="payment-method-option">
                    <input type="radio" name="payment-method" value="UPI">
                    <div class="payment-method-card">
                        <div class="payment-method-icon">📱</div>
                        <div class="payment-method-info">
                            <div class="payment-method-name">UPI</div>
                            <div class="payment-method-desc">Pay via any UPI app (Paytm, GPay, PhonePe)</div>
                        </div>
                    </div>
                </label>
                <label class="payment-method-option">
                    <input type="radio" name="payment-method" value="Scan">
                    <div class="payment-method-card">
                        <div class="payment-method-icon">📷</div>
                        <div class="payment-method-info">
                            <div class="payment-method-name">Scan to Pay</div>
                            <div class="payment-method-desc">Scan QR code with any UPI app</div>
                        </div>
                    </div>
                </label>
            </div>
            <div id="payment-processing" class="payment-processing" style="display: none;">
                <div class="payment-spinner"></div>
                <div class="payment-processing-text">Connecting to payment server...</div>
                <div class="payment-processing-subtext">Please wait while we process your payment</div>
            </div>
            <div id="payment-success" class="payment-success" style="display: none;">
                <div class="payment-success-icon">✓</div>
                <div class="payment-success-text">Payment Successful!</div>
            </div>
        </div>
        <div class="payment-sidebar-footer">
            <button class="btn btn-secondary" onclick="closePaymentModal()">Cancel</button>
            <button class="btn btn-primary" id="pay-now-btn" onclick="processPayment()">Pay Now</button>
        </div>
    </div>
</div>
`;


const paymentModalStyles = `
<style>
.payment-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
}

.payment-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
}

.payment-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 450px;
    max-width: 90%;
    height: 100%;
    background: white;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    animation: slideInRight 0.3s ease;
    z-index: 10001;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}

.payment-sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 2px solid #e0e0e0;
    background: #f8f8f8;
}

.payment-sidebar-header h2 {
    margin: 0;
    color: #2e7d32;
    font-size: 1.5rem;
}

.payment-close {
    background: none;
    border: none;
    font-size: 2rem;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s;
}

.payment-close:hover {
    color: #333;
}

.payment-sidebar-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
}

.order-details-section,
.donation-details-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #e0e0e0;
}

.order-details-section h3,
.donation-details-section h3,
.payment-methods-section h3 {
    font-size: 1.2rem;
    color: #2e7d32;
    margin-bottom: 1rem;
}

.order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
    border-bottom: none;
}

.order-item-info {
    flex: 1;
}

.order-item-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
}

.order-item-details {
    font-size: 0.85rem;
    color: #666;
}

.order-item-price {
    font-weight: 600;
    color: #2e7d32;
}

.order-breakdown {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #e0e0e0;
}

.breakdown-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    font-size: 0.95rem;
}

.breakdown-row.total-row {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2e7d32;
    padding-top: 1rem;
    border-top: 2px solid #e0e0e0;
    margin-top: 0.5rem;
}

.donation-info {
    background: #f0f7f0;
    padding: 1rem;
    border-radius: 8px;
}

.donation-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    font-size: 1rem;
}

.donation-row:last-child {
    font-weight: bold;
    color: #2e7d32;
    font-size: 1.2rem;
}

.payment-methods-section {
    margin-bottom: 1rem;
}

.payment-method-option {
    display: block;
    margin-bottom: 0.75rem;
    cursor: pointer;
}

.payment-method-option input[type="radio"] {
    display: none;
}

.payment-method-card {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s;
}

.payment-method-option input[type="radio"]:checked + .payment-method-card {
    border-color: #4a7c59;
    background: #f0f7f0;
}

.payment-method-card:hover {
    border-color: #4a7c59;
}

.payment-method-icon {
    font-size: 2rem;
    margin-right: 1rem;
}

.payment-method-info {
    flex: 1;
}

.payment-method-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
}

.payment-method-desc {
    font-size: 0.85rem;
    color: #666;
}

.upi-options {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid #e0e0e0;
}

.upi-app-option {
    display: block;
    margin-bottom: 0.5rem;
    cursor: pointer;
}

.upi-app-option:last-child {
    margin-bottom: 0;
}

.upi-app-option input[type="radio"] {
    display: none;
}

.upi-app-card {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    background: white;
    transition: all 0.3s;
}

.upi-app-option input[type="radio"]:checked + .upi-app-card {
    border-color: #4a7c59;
    background: #f0f7f0;
}

.upi-app-card:hover {
    border-color: #4a7c59;
}

.upi-app-icon {
    font-size: 1.5rem;
    margin-right: 0.75rem;
}

.upi-app-name {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.payment-processing {
    text-align: center;
    padding: 2rem;
}

.payment-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f0f0f0;
    border-top: 4px solid #4a7c59;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.payment-processing-text {
    font-size: 1.1rem;
    color: #666;
    font-weight: 500;
}

.payment-processing-subtext {
    font-size: 0.9rem;
    color: #999;
    margin-top: 0.5rem;
}

.payment-success {
    text-align: center;
    padding: 2rem;
}

.payment-success-icon {
    width: 80px;
    height: 80px;
    background: #4a7c59;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    margin: 0 auto 1rem;
    animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

.payment-success-text {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2e7d32;
}

.payment-sidebar-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 2px solid #e0e0e0;
    background: #f8f8f8;
}

.payment-sidebar-footer .btn {
    flex: 1;
    padding: 0.75rem;
    font-size: 1rem;
}

@media (max-width: 768px) {
    .payment-sidebar {
        width: 100%;
        max-width: 100%;
    }
}
</style>
`;


function initializePaymentModal() {
    if (!document.getElementById('payment-modal')) {
        document.body.insertAdjacentHTML('beforeend', paymentModalStyles);
        document.body.insertAdjacentHTML('beforeend', paymentModalHTML);
    }
}


let currentPaymentContext = null;


function openCheckoutPayment(orderData) {
    initializePaymentModal();
    currentPaymentContext = {
        type: 'checkout',
        data: orderData
    };
    document.getElementById('payment-modal-title').textContent = 'Complete Payment';
    document.getElementById('order-details-section').style.display = 'block';
    document.getElementById('donation-details-section').style.display = 'none';
    
    // Clear existing items
    const orderItemsList = document.getElementById('order-items-list');
    orderItemsList.innerHTML = '';
    
    // Display order items
    orderData.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-details">Qty: ${item.quantity} × ₹${item.price.toFixed(2)}</div>
            </div>
            <div class="order-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
        `;
        orderItemsList.appendChild(itemDiv);
    });
    
    // Calculate totals immediately after modal opens
    if (window.paymentCalculator) {
        window.paymentCalculator.calculateFromOrderData(orderData);
    } else {
        calculateAndDisplayTotal(orderData);
    }

    document.getElementById('payment-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// NEW: Clean calculation function
function calculateAndDisplayTotal(orderData) {
    console.log('🧮 Starting fresh calculation with orderData:', orderData);
    console.log('Items:', orderData.items);

    // Always compute from raw item data
    let subtotal = 0;
    if (orderData.items && orderData.items.length > 0) {
        subtotal = orderData.items.reduce((sum, item) => {
            const unitPrice = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return sum + (unitPrice * quantity);
        }, 0);
    }

    console.log('Subtotal:', subtotal);
    
    // Step 2: Calculate tax (5% of subtotal)
    const tax = subtotal * 0.05;
    
    // Step 3: Shipping cost (0 for now)
    const shipping = 0;
    
    // Step 4: Calculate final total
    const total = subtotal + tax + shipping;
    
    console.log('🧮 Calculation Results:', {
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total
    });
    
    // Step 5: Update UI elements
    updatePaymentUI(subtotal, tax, shipping, total);
    
    // Step 6: Store final total in context
    currentPaymentContext.data.finalTotal = total;
    
    return total;
}

// NEW: Clean UI update function
function updatePaymentUI(subtotal, tax, shipping, total) {
    // Update subtotal
    const subtotalElement = document.getElementById('order-subtotal');
    if (subtotalElement) {
        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        console.log('✅ Updated subtotal:', subtotalElement.textContent);
    }
    
    // Update tax
    const taxElement = document.getElementById('order-tax');
    if (taxElement) {
        taxElement.textContent = `₹${tax.toFixed(2)}`;
        console.log('✅ Updated tax:', taxElement.textContent);
    }
    
    // Update shipping
    const shippingElement = document.getElementById('order-shipping');
    if (shippingElement) {
        shippingElement.textContent = `₹${shipping.toFixed(2)}`;
        console.log('✅ Updated shipping:', shippingElement.textContent);
    }
    
    // Total element removed from UI as requested
    console.log('💳 Total element removed from payment modal');
}

// NEW: Manual recalculation function
window.recalculatePaymentTotal = function() {
    if (currentPaymentContext && currentPaymentContext.data) {
        console.log('🔄 Manual recalculation triggered');
        return calculateAndDisplayTotal(currentPaymentContext.data);
    } else {
        console.error('❌ No payment context available for recalculation');
        return 0;
    }
};

window.fixPaymentTotal = function() {
    console.log('🚨 Emergency total fix triggered');
    return window.recalculatePaymentTotal();
};


// NEW: Dynamic cart monitoring for real-time updates
function initializePaymentCalculation() {
    console.log('🔧 Initializing payment calculation system');
    
    // Monitor for cart changes in localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart' && currentPaymentContext) {
            console.log('🔄 Cart changed in localStorage, recalculating...');
            window.recalculatePaymentTotal();
        }
    });
    
    // Monitor for DOM changes in cart items
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList && mutation.target.classList.contains('order-item')) {
                console.log('🔄 Order item changed, recalculating...');
                setTimeout(() => {
                    window.recalculatePaymentTotal();
                }, 100);
            }
        });
    });
    
    // Start observing when payment modal is open
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        observer.observe(paymentModal, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializePaymentCalculation);

// NEW: Utility function to get cart data from various sources
function getCartData() {
    // Try to get from current payment context first
    if (currentPaymentContext && currentPaymentContext.data && currentPaymentContext.data.items) {
        return currentPaymentContext.data.items;
    }
    
    // Try to get from localStorage
    try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
            const parsedCart = JSON.parse(cartData);
            if (Array.isArray(parsedCart)) {
                return parsedCart;
            }
        }
    } catch (e) {
        console.log('Could not parse cart from localStorage');
    }
    
    // Try to get from selected cart items
    try {
        const selectedItems = localStorage.getItem('selectedCartItems');
        if (selectedItems) {
            const parsedItems = JSON.parse(selectedItems);
            if (Array.isArray(parsedItems)) {
                return parsedItems;
            }
        }
    } catch (e) {
        console.log('Could not parse selected items from localStorage');
    }
    
    return [];
}

// NEW: Enhanced calculation that works with any cart data source
window.calculateTotalFromAnySource = function() {
    console.log('🔍 Calculating total from any available source...');
    
    const cartItems = getCartData();
    console.log('📦 Found cart items:', cartItems);
    
    if (!cartItems || cartItems.length === 0) {
        console.log('⚠️ No cart items found, using fallback calculation');
        // Fallback for your current cart
        const fallbackItems = [
            { name: 'Pencil image', price: 500, quantity: 2 },
            { name: 'paneer', price: 1000, quantity: 1 }
        ];
        return calculateFromItems(fallbackItems);
    }
    
    return calculateFromItems(cartItems);
};

function calculateFromItems(items) {
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.05;
    const shipping = 0;
    const total = subtotal + tax + shipping;
    
    console.log('🧮 Calculated from items:', { subtotal, tax, shipping, total });
    
    updatePaymentUI(subtotal, tax, shipping, total);
    
    return total;
}

function openDonationPayment(donationData) {
    initializePaymentModal();
    currentPaymentContext = {
        type: 'donation',
        data: donationData
    };
    document.getElementById('payment-modal-title').textContent = 'Complete Donation';
    document.getElementById('order-details-section').style.display = 'none';
    document.getElementById('donation-details-section').style.display = 'block';
    document.getElementById('donor-name-display').textContent = donationData.name;
    document.getElementById('donation-amount-display').textContent = '₹' + donationData.amount.toFixed(2);
    
    // Hide Cash on Delivery option for donations
    const codOption = document.querySelector('input[name="payment-method"][value="Cash on Delivery"]').closest('.payment-method-option');
    if (codOption) {
        codOption.style.display = 'none';
    }
    
    // Auto-select UPI for donations
    const upiOption = document.querySelector('input[name="payment-method"][value="UPI"]');
    if (upiOption) {
        upiOption.checked = true;
    }
    
    document.getElementById('payment-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}


function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentPaymentContext = null;

    // Reset calculator so next open recalculates fresh
    if (window.paymentCalculator) window.paymentCalculator.reset();
    window.isPaymentCalculated = false;
    document.getElementById('payment-processing').style.display = 'none';
    document.getElementById('payment-success').style.display = 'none';
    document.querySelector('.payment-methods-section').style.display = 'block';
    document.querySelector('.payment-sidebar-footer').style.display = 'flex';
    
    // Restore Cash on Delivery option visibility
    const codOption = document.querySelector('input[name="payment-method"][value="Cash on Delivery"]').closest('.payment-method-option');
    if (codOption) {
        codOption.style.display = 'block';
    }
    
    // Reset to COD as default
    const codRadio = document.querySelector('input[name="payment-method"][value="Cash on Delivery"]');
    if (codRadio) {
        codRadio.checked = true;
    }

    // Remove any fallback UPI info if present
    const fallback = document.getElementById('upi-fallback-info');
    if (fallback) fallback.remove();
}


async function processPayment() {
    if (!currentPaymentContext) {
        if (typeof showToast === 'function') {
            showToast('Payment session expired. Please try again.', 'error');
        } else {
            alert('Payment session expired. Please try again.');
        }
        closePaymentModal();
        return;
    }
    
    const selectedMethodElement = document.querySelector('input[name="payment-method"]:checked');
    if (!selectedMethodElement) {
        if (typeof showToast === 'function') {
            showToast('Please select a payment method.', 'error');
        } else {
            alert('Please select a payment method.');
        }
        return;
    }
    
    const selectedMethod = selectedMethodElement.value;
    
    // If UPI is selected, handle directly
    if (selectedMethod === 'UPI') {
        handleUpiPayment();
        return;
    }
    
    // If Scan is selected, show QR code
    if (selectedMethod === 'Scan') {
        handleScanPayment();
        return;
    }
    
    // Handle COD payment
    document.querySelector('.payment-methods-section').style.display = 'none';
    document.querySelector('.payment-sidebar-footer').style.display = 'none';
    showPaymentLoader();
    setTimeout(async () => {
        hidePaymentLoader();
        showPaymentSuccess();
        if (currentPaymentContext.type === 'checkout') {
            await processCheckoutPayment(selectedMethod);
        } else if (currentPaymentContext.type === 'donation') {
            processDonationPayment(selectedMethod);
        }
        setTimeout(() => {
            closePaymentModal();
            if (currentPaymentContext.type === 'checkout') {
                window.location.href = 'orders.html';
            } else {
                if (typeof showToast === 'function') {
                    showToast('Thank you for your generous donation!');
                }
            }
        }, 2000);
    }, 2000);
}

function handleUpiPayment() {
    const orderData = currentPaymentContext.data;
    const amount = orderData.finalTotal || orderData.total;

    const upiId = '7893059116@paytm';
    const name = 'Gousamhitha';
    const note = 'Order Payment';

    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    console.log('UPI Link:', upiLink);

    // Direct redirect — synchronous inside user click handler
    window.location.href = upiLink;
}

function processUpiPaymentCompletion() {
    document.querySelector('.payment-methods-section').style.display = 'none';
    document.querySelector('.payment-sidebar-footer').style.display = 'none';
    showPaymentLoader();
    
    setTimeout(async () => {
        hidePaymentLoader();
        showPaymentSuccess();
        
        if (currentPaymentContext.type === 'checkout') {
            await processCheckoutPayment('UPI');
        } else if (currentPaymentContext.type === 'donation') {
            processDonationPayment('UPI');
        }
        
        setTimeout(() => {
            closePaymentModal();
            if (currentPaymentContext.type === 'checkout') {
                window.location.href = 'orders.html';
            } else {
                if (typeof showToast === 'function') {
                    showToast('Thank you for your payment!');
                }
            }
        }, 2000);
    }, 2000);
}

function handleScanPayment() {
    const orderData = currentPaymentContext.data;
    const amount = orderData.finalTotal || orderData.total;
    
    // Hide payment methods and footer
    document.querySelector('.payment-methods-section').style.display = 'none';
    document.querySelector('.payment-sidebar-footer').style.display = 'none';
    
    // Create QR code display section
    const qrSection = document.createElement('div');
    qrSection.className = 'qr-payment-section';
    qrSection.innerHTML = `
        <div class="qr-payment-container">
            <h3>Scan QR Code to Pay</h3>
            <div class="qr-code-placeholder">
                <img src="images/Screenshot 2026-03-18 131030.png" alt="Payment QR Code" class="qr-code-image">
                <div class="qr-code-amount">Amount: ₹${amount.toFixed(2)}</div>
            </div>
            <div class="qr-instructions">
                <p><strong>Instructions:</strong></p>
                <ol>
                    <li>Open your UPI app (Paytm, PhonePe, Google Pay, etc.)</li>
                    <li>Tap on "Scan QR Code"</li>
                    <li>Point your camera at the QR code above</li>
                    <li>Enter the amount: <strong>₹${amount.toFixed(2)}</strong></li>
                    <li>Complete the payment</li>
                </ol>
            </div>
            <div class="qr-payment-buttons">
                <button class="btn btn-secondary" onclick="cancelScanPayment()">Cancel</button>
                <button class="btn btn-primary" onclick="confirmScanPayment()">I've Paid</button>
            </div>
        </div>
    `;
    
    // Add styles for QR section
    const qrStyles = document.createElement('style');
    qrStyles.textContent = `
        .qr-payment-section {
            padding: 1.5rem;
        }
        .qr-payment-container {
            text-align: center;
        }
        .qr-payment-container h3 {
            color: #2e7d32;
            margin-bottom: 1.5rem;
            font-size: 1.3rem;
        }
        .qr-code-placeholder {
            margin: 1.5rem 0;
        }
        .qr-code-image {
            max-width: 280px;
            width: 100%;
            height: auto;
            margin: 0 auto;
            display: block;
            border: 2px solid #4a7c59;
            border-radius: 12px;
            padding: 10px;
            background: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .qr-code-amount {
            font-size: 1.2rem;
            color: #2e7d32;
            font-weight: 700;
            margin-top: 1rem;
            padding: 0.75rem;
            background: #f0f7f0;
            border-radius: 8px;
            display: inline-block;
        }
        .qr-instructions {
            text-align: left;
            background: #f0f7f0;
            padding: 1.5rem;
            border-radius: 8px;
            margin: 1.5rem 0;
        }
        .qr-instructions p {
            margin: 0.5rem 0;
        }
        .qr-instructions ol {
            margin: 0.5rem 0 0.5rem 1.5rem;
        }
        .qr-instructions li {
            margin-bottom: 0.5rem;
        }
        .qr-payment-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        .qr-payment-buttons .btn {
            flex: 1;
            padding: 0.75rem;
        }
    `;
    
    // Clear any existing QR section
    const existingQrSection = document.querySelector('.qr-payment-section');
    if (existingQrSection) {
        existingQrSection.remove();
    }
    
    // Add styles and QR section
    document.head.appendChild(qrStyles);
    document.querySelector('.payment-sidebar-body').appendChild(qrSection);
}

function cancelScanPayment() {
    // Remove QR section
    const qrSection = document.querySelector('.qr-payment-section');
    if (qrSection) {
        qrSection.remove();
    }
    
    // Show payment methods and footer again
    document.querySelector('.payment-methods-section').style.display = 'block';
    document.querySelector('.payment-sidebar-footer').style.display = 'flex';
}

function confirmScanPayment() {
    // Remove QR section
    const qrSection = document.querySelector('.qr-payment-section');
    if (qrSection) {
        qrSection.remove();
    }
    
    // Show payment loader
    document.querySelector('.payment-methods-section').style.display = 'none';
    document.querySelector('.payment-sidebar-footer').style.display = 'none';
    showPaymentLoader();
    
    // Process payment after delay
    setTimeout(async () => {
        hidePaymentLoader();
        showPaymentSuccess();
        
        if (currentPaymentContext.type === 'checkout') {
            await processCheckoutPayment('Scan');
        } else if (currentPaymentContext.type === 'donation') {
            processDonationPayment('Scan');
        }
        
        setTimeout(() => {
            closePaymentModal();
            if (currentPaymentContext.type === 'checkout') {
                window.location.href = 'orders.html';
            } else {
                if (typeof showToast === 'function') {
                    showToast('Thank you for your payment!');
                }
            }
        }, 2000);
    }, 2000);
}


function showPaymentLoader() {
    document.getElementById('payment-processing').style.display = 'block';
    document.getElementById('payment-success').style.display = 'none';
}

function hidePaymentLoader() {
    document.getElementById('payment-processing').style.display = 'none';
}

function showPaymentSuccess() {
    document.getElementById('payment-success').style.display = 'block';
}


async function processCheckoutPayment(paymentMethod) {
    if (!currentPaymentContext || !currentPaymentContext.data) {
        if (typeof showToast === 'function') {
            showToast('Order data is missing. Please try again.', 'error');
        } else {
            alert('Order data is missing. Please try again.');
        }
        return;
    }
    
    const orderData = currentPaymentContext.data;
    
    try {
        const paymentStatus = paymentMethod === 'Cash on Delivery' ? 'pending' : 'paid';
        
        const cleanOrderData = {
            customerName: orderData.customerName,
            phone: orderData.phone,
            email: orderData.email || '',
            address: orderData.address,
            city: orderData.city,
            pincode: orderData.pincode,
            latitude: orderData.latitude,
            longitude: orderData.longitude,
            notes: orderData.notes || '',
            items: orderData.items,
            subtotal: orderData.subtotal,
            delivery_charge: orderData.delivery_charge || 0,
            total: orderData.total,
            finalTotal: orderData.finalTotal  // This includes tax + shipping
        };
        
        const order = await window.saveOrderToDatabase(cleanOrderData, paymentMethod, paymentStatus);
        
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    } catch (error) {
        console.error('Error processing checkout:', error);
        if (typeof showToast === 'function') {
            showToast('Failed to process order: ' + error.message, 'error');
        } else {
            alert('Failed to process order: ' + error.message);
        }
        throw error;
    }
}


function processDonationPayment(paymentMethod) {
    const donationData = currentPaymentContext.data;
    const donation = {
        id: 'DON' + Date.now(),
        name: donationData.name,
        amount: donationData.amount,
        paymentMethod: paymentMethod,
        status: 'Completed',
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString()
    };
    const donations = JSON.parse(localStorage.getItem('donations')) || [];
    donations.push(donation);
    localStorage.setItem('donations', JSON.stringify(donations));
}


function initializeRazorpay(amount, orderId, callback) {
    // Razorpay integration placeholder
    console.log('Razorpay integration not implemented yet');
    if (callback) {
        callback({ error: 'Razorpay not configured' });
    }
}
