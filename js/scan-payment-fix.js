// Scan Payment Fix - Handle scan payment errors
(function() {
    'use strict';
    
    // Fix for handleScanPayment function
    window.handleScanPayment = function() {
        try {
            console.log('Scan payment initiated');
            
            // Get amount from current context or calculate from cart
            let amount = 0;
            
            if (window.currentPaymentContext && window.currentPaymentContext.data) {
                amount = window.currentPaymentContext.data.finalTotal || window.currentPaymentContext.data.total || 0;
            } else {
                // Fallback: calculate from cart
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                cart.forEach(item => {
                    const price = parseFloat(item.price) || 0;
                    const quantity = parseInt(item.quantity) || 1;
                    amount += price * quantity;
                });
            }
            
            console.log('Scan payment amount:', amount);
            
            if (amount <= 0) {
                alert('Invalid payment amount. Please try again.');
                return;
            }
            
            // Show QR code payment modal
            showQRPaymentModal(amount);
            
        } catch (error) {
            console.error('Error in handleScanPayment:', error);
            alert('Scan payment is currently unavailable. Please try UPI payment instead.');
        }
    };
    
    // Show QR payment modal
    function showQRPaymentModal(amount) {
        // Remove existing modal if any
        const existingModal = document.getElementById('qr-payment-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create QR payment modal
        const modal = document.createElement('div');
        modal.id = 'qr-payment-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                text-align: center;
            ">
                <h3 style="margin: 0 0 1rem 0; color: #333;">Scan QR Code to Pay</h3>
                <p style="margin-bottom: 1.5rem; color: #666; font-size: 1.2rem; font-weight: bold;">Amount: ₹${amount}</p>
                
                <div style="
                    width: 200px;
                    height: 200px;
                    border: 2px solid #4a7c59;
                    margin: 0 auto 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f9f9f9;
                    border-radius: 8px;
                ">
                    <div style="text-align: center; color: #666;">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem;">📱</div>
                        <div style="font-weight: bold;">QR Code</div>
                        <div style="font-size: 0.8rem; margin-top: 0.5rem;">Scan with any UPI app</div>
                    </div>
                </div>
                
                <div style="background: #f0f8ff; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: left;">
                    <p style="margin: 0; font-size: 0.9rem; color: #333;">
                        <strong>UPI ID:</strong> 7893059116@paytm<br>
                        <strong>Amount:</strong> ₹${amount}<br>
                        <strong>Merchant:</strong> Gousamhitha
                    </p>
                </div>
                
                <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="margin: 0; font-size: 0.9rem; color: #856404;">
                        <strong>Instructions:</strong><br>
                        1. Open your UPI app<br>
                        2. Scan the QR code above<br>
                        3. Enter amount: ₹${amount}<br>
                        4. Complete the payment<br>
                        5. Click "Payment Done" below
                    </p>
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <button onclick="confirmQRPayment(${amount})" style="
                        flex: 1;
                        padding: 0.75rem;
                        border: none;
                        background: #4a7c59;
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        Payment Done
                    </button>
                    <button onclick="closeQRPaymentModal()" style="
                        flex: 1;
                        padding: 0.75rem;
                        border: 1px solid #ccc;
                        background: white;
                        color: #666;
                        border-radius: 8px;
                        cursor: pointer;
                    ">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Close QR payment modal
    window.closeQRPaymentModal = function() {
        const modal = document.getElementById('qr-payment-modal');
        if (modal) {
            modal.remove();
        }
    };
    
    // Confirm QR payment
    window.confirmQRPayment = function(amount) {
        closeQRPaymentModal();
        
        const confirmed = confirm(`Confirm that you have completed the payment of ₹${amount}?`);
        
        if (confirmed) {
            // Process payment completion
            handleQRPaymentSuccess(amount);
        }
    };
    
    // Handle QR payment success
    function handleQRPaymentSuccess(amount) {
        try {
            console.log('QR Payment successful:', amount);
            
            // Save order
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            const order = {
                id: 'ORD_' + Date.now(),
                items: cart,
                amount: amount,
                status: 'confirmed',
                paymentMethod: 'QR Code',
                createdAt: new Date().toISOString()
            };
            
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.setItem('cart', '[]'); // Clear cart
            
            alert('Payment confirmed! Thank you for your purchase.');
            
            // Close any payment modals
            const paymentModal = document.querySelector('.payment-modal, .auth-modal');
            if (paymentModal) {
                paymentModal.style.display = 'none';
            }
            
            // Redirect to orders page
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 1000);
            
        } catch (error) {
            console.error('Error processing QR payment:', error);
            alert('Error processing payment. Please try again.');
        }
    }
    
    // Fix for cancelScanPayment function
    window.cancelScanPayment = function() {
        closeQRPaymentModal();
    };
    
    // Fix for confirmScanPayment function
    window.confirmScanPayment = function() {
        // Get amount from context or default
        let amount = 0;
        
        if (window.currentPaymentContext && window.currentPaymentContext.data) {
            amount = window.currentPaymentContext.data.finalTotal || window.currentPaymentContext.data.total || 0;
        }
        
        if (amount > 0) {
            confirmQRPayment(amount);
        } else {
            alert('Unable to determine payment amount. Please try again.');
        }
    };
    
    console.log('Scan payment fix loaded');
})();