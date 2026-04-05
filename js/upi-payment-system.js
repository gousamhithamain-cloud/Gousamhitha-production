// Fixed UPI Payment System - Admin UPI ID Integration
class UPIPaymentSystem {
    constructor() {
        // Admin payment details
        this.adminUPI = '7893059116@paytm';
        this.merchantName = 'Gousamhitha';
        this.currency = 'INR';
        
        this.initializeSystem();
    }
    
    initializeSystem() {
        // Override existing payment functions
        this.overrideExistingPaymentFunctions();
        
        // Initialize payment buttons
        this.initializePaymentButtons();
        
        console.log('UPI Payment System initialized with admin UPI:', this.adminUPI);
    }
    
    // Calculate total amount from cart
    calculateCartTotal() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            let total = 0;
            
            if (Array.isArray(cart)) {
                cart.forEach(item => {
                    const price = parseFloat(item.price) || 0;
                    const quantity = parseInt(item.quantity) || 1;
                    total += price * quantity;
                });
            }
            
            console.log('Calculated cart total:', total);
            return total;
        } catch (e) {
            console.warn('Error calculating cart total:', e.message);
            return 0;
        }
    }
    
    // Generate UPI payment link
    generateUPILink(amount, transactionNote = 'Payment') {
        // Ensure amount is valid
        const validAmount = parseFloat(amount) || 0;
        
        if (validAmount <= 0) {
            console.error('Invalid amount for UPI link:', amount);
            return null;
        }
        
        const upiLink = `upi://pay?pa=${this.adminUPI}&pn=${encodeURIComponent(this.merchantName)}&am=${validAmount}&cu=${this.currency}&tn=${encodeURIComponent(transactionNote)}`;
        console.log('Generated UPI link:', upiLink);
        return upiLink;
    }
    
    // Generate Paytm payment link
    generatePaytmLink(amount) {
        // Ensure amount is valid
        const validAmount = parseFloat(amount) || 0;
        
        if (validAmount <= 0) {
            console.error('Invalid amount for Paytm link:', amount);
            return null;
        }
        
        const paytmLink = `https://paytm.me/7893059116/${validAmount}`;
        console.log('Generated Paytm link:', paytmLink);
        return paytmLink;
    }
    
    // Process UPI payment for cart checkout
    processCartPayment() {
        const total = this.calculateCartTotal();
        
        console.log('Processing cart payment with total:', total);
        
        if (total <= 0) {
            this.showMessage('Cart is empty or invalid total amount', 'error');
            return;
        }
        
        this.openUPIPayment(total, 'order');
    }
    
    // Process UPI payment for donations
    processDonationPayment(amount) {
        const validAmount = parseFloat(amount) || 0;
        
        console.log('Processing donation payment with amount:', validAmount);
        
        if (validAmount <= 0) {
            this.showMessage('Please enter a valid donation amount', 'error');
            return;
        }
        
        this.openUPIPayment(validAmount, 'donation');
    }
    
    // Main function to open UPI payment
    openUPIPayment(amount, type = 'order') {
        const validAmount = parseFloat(amount) || 0;
        
        console.log('Opening UPI payment - Amount:', validAmount, 'Type:', type);
        
        if (validAmount <= 0) {
            this.showMessage('Invalid payment amount', 'error');
            return;
        }
        
        // Show payment options
        this.showPaymentOptions(validAmount, type);
    }
    
    // Show payment options (UPI or Paytm)
    showPaymentOptions(amount, type) {
        const message = `Choose payment method for ₹${amount}:\n\n1. UPI App (Recommended)\n2. Paytm Web\n3. Manual Payment Instructions`;
        
        const choice = prompt(message + '\n\nEnter 1, 2, or 3:');
        
        switch (choice) {
            case '1':
                this.redirectToUPI(amount, type);
                break;
            case '2':
                this.redirectToPaytm(amount, type);
                break;
            case '3':
                this.showManualPaymentInstructions(amount);
                break;
            default:
                this.showMessage('Payment cancelled', 'info');
                break;
        }
    }
    
    // Redirect to UPI app
    redirectToUPI(amount, type) {
        const validAmount = parseFloat(amount) || 0;
        
        console.log('Redirecting 
to UPI app with amount:', validAmount);
        
        if (validAmount <= 0) {
            this.showMessage('Invalid amount for UPI payment', 'error');
            return;
        }
        
        const transactionNote = type === 'donation' ? 'Donation - Gousamhitha Gowshala' : 'Order Payment - Gousamhitha';
        const upiLink = this.generateUPILink(validAmount, transactionNote);
        
        if (!upiLink) {
            this.showMessage('Failed to generate UPI link', 'error');
            return;
        }
        
        // Store payment details for confirmation
        const paymentData = {
            amount: validAmount,
            type: type,
            timestamp: new Date().toISOString(),
            upiId: this.adminUPI,
            method: 'UPI'
        };
        
        sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
        
        // Show confirmation and redirect
        const confirmed = confirm(`You will be redirected to your UPI app to pay ₹${validAmount} to ${this.merchantName}.\n\nUPI ID: ${this.adminUPI}\nAmount: ₹${validAmount}\n\nProceed with payment?`);
        
        if (confirmed) {
            try {
                window.location.href = upiLink;
                this.setupPaymentCompletionCheck(validAmount, type);
            } catch (e) {
                console.error('UPI redirect failed:', e);
                this.showManualPaymentInstructions(validAmount);
            }
        }
    }
    
    // Redirect to Paytm web
    redirectToPaytm(amount, type) {
        const validAmount = parseFloat(amount) || 0;
        
        console.log('Redirecting to Paytm with amount:', validAmount);
        
        if (validAmount <= 0) {
            this.showMessage('Invalid amount for Paytm payment', 'error');
            return;
        }
        
        const paytmLink = this.generatePaytmLink(validAmount);
        
        if (!paytmLink) {
            this.showMessage('Failed to generate Paytm link', 'error');
            return;
        }
        
        // Store payment details for confirmation
        const paymentData = {
            amount: validAmount,
            type: type,
            timestamp: new Date().toISOString(),
            upiId: this.adminUPI,
            method: 'Paytm'
        };
        
        sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
        
        // Show confirmation and redirect
        const confirmed = confirm(`You will be redirected to Paytm to pay ₹${validAmount} to ${this.merchantName}.\n\nPhone: 7893059116\nAmount: ₹${validAmount}\n\nProceed with payment?`);
        
        if (confirmed) {
            try {
                window.open(paytmLink, '_blank');
                this.setupPaymentCompletionCheck(validAmount, type);
            } catch (e) {
                console.error('Paytm redirect failed:', e);
                this.showManualPaymentInstructions(validAmount);
            }
        }
    }
    
    // Show manual payment instructions
    showManualPaymentInstructions(amount) {
        const validAmount = parseFloat(amount) || 0;
        
        const instructions = `Manual Payment Instructions:
        
UPI ID: ${this.adminUPI}
Phone: 7893059116
Amount: ₹${validAmount}
Merchant: ${this.merchantName}

Please open your UPI app manually and send the payment to the above details.`;
        
        alert(instructions);
        this.setupPaymentCompletionCheck(validAmount, 'manual');
    }
    
    // Setup payment completion check
    setupPaymentCompletionCheck(amount, type) {
        const validAmount = parseFloat(amount) || 0;
        
        console.log('Setting up payment completion check for amount:', validAmount);
        
        // Check after 10 seconds if user completed payment
        setTimeout(() => {
            const confirmed = confirm(`Have you completed the payment of ₹${validAmount}?\n\nClick OK if payment is successful\nClick Cancel to try again`);
            
            if (confirmed) {
                this.handlePaymentSuccess(validAmount, type);
            } else {
                this.handlePaymentFailure();
            }
        }, 10000);
    }
    
    // Handle successful payment
    handlePaymentSuccess(amount, type) {
        const validAmount = parseFloat(amount) || 0;
        
        console.log('Processing successful payment:', validAmount, type);
        
        const paymentData = {
            amount: validAmount,
            type: type,
            status: 'completed',
            paymentMethod: 'UPI',
            upiId: this.adminUPI,
            timestamp: new Date().toISOString(),
            transactionId: 'UPI_' + Date.now()
        };
        
        if (type === 'order') {
            this.processOrderCompletion(paymentData);
        } else if (type === 'donation') {
            this.processDonationCompletion(paymentData);
        }
        
        // Clear pending payment
        sessionStorage.removeItem('pendingPayment');
        
        this.showMessage('Payment successful! Thank you for your payment.', 'success');
    }
    
    // Handle payment failure
    handlePaymentFailure() {
        console.log('Payment failed or cancelled');
        this.showMessage('Payment was not completed. Please try again.', 'error');
        sessionStorage.removeItem('pendingPayment');
    }
    
    // Process order completion
    processOrderCompletion(paymentData) {
        try {
            console.log('Processing order completion:', paymentData);
            
            // Save order to localStorage or send to server
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            const order = {
                id: 'ORD_' + Date.now(),
                items: cart,
                payment: paymentData,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            };
            
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Clear cart
            localStorage.setItem('cart', '[]');
            
            // Redirect to success page or orders page
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 2000);
            
        } catch (e) {
            console.error('Error processing order:', e);
        }
    }
    
    // Process donation completion
    processDonationCompletion(paymentData) {
        try {
            console.log('Processing donation completion:', paymentData);
            
            // Get donor name from session storage
            const donorName = sessionStorage.getItem('donorName') || 'Anonymous Donor';
            
            // Save donation to localStorage
            const donations = JSON.parse(localStorage.getItem('donations') || '[]');
            
            const donation = {
                id: 'DON_' + Date.now(),
                amount: paymentData.amount,
                payment: paymentData,
                name: donorName,
                date: new Date().toLocaleDateString(),
                paymentMethod: 'UPI',
                status: 'completed'
            };
            
            donations.push(donation);
            localStorage.setItem('donations', JSON.stringify(donations));
            
            // Clear donor name from session
            sessionStorage.removeItem('donorName');
            
            // Redirect to donations page
            setTimeout(() => {
                window.location.href = 'donations.html';
            }, 2000);
            
        } catch (e) {
            console.error('Error processing donation:', e);
        }
    }
    
    // Override existing payment functions
    overrideExistingPaymentFunctions() {
        // Override proceedToCheckout function
        window.proceedToCheckout = () => {
            console.log('proceedToCheckout called');
            this.processCartPayment();
        };
        
        // Override donation payment function
        window.processDonationPayment = (amount) => {
            console.log('processDonationPayment called with amount:', amount);
            this.processDonationPayment(amount);
        };
        
        // Create openUPIPayment function
        window.openUPIPayment = (amount, type = 'order') => {
            console.log('openUPIPayment called with amount:', amount, 'type:', type);
            this.openUPIPayment(amount, type);
        };
        
        // Override any existing UPI payment handlers
        window.handleUpiPayment = (amount, type = 'order') => {
            console.log('handleUpiPayment called with amount:', amount, 'type:', type);
            if (type === 'donation') {
                this.processDonationPayment(amount);
            } else {
                this.processCartPayment();
            }
        };
    }
    
    // Initialize payment buttons
    initializePaymentButtons() {
        // Find and update existing payment buttons
        document.addEventListener('DOMContentLoaded', () => {
            this.updatePaymentButtons();
        });
        
        // Also update if DOM is already loaded
        if (document.readyState !== 'loading') {
            this.updatePaymentButtons();
        }
    }
    
    // Update payment buttons to use new UPI system
    updatePaymentButtons() {
        console.log('Updating payment buttons');
        
        // Update cart checkout buttons
        const checkoutButtons = document.querySelectorAll('[onclick*="proceedToCheckout"], .checkout-btn, .checkout-btn-mobile');
        checkoutButtons.forEach(button => {
            button.onclick = (e) => {
                e.preventDefault();
                console.log('Checkout button clicked');
                this.processCartPayment();
            };
        });
        
        // Update donation buttons
        const donationButtons = document.querySelectorAll('[onclick*="Proceed to Payment"], .btn[type="submit"]');
        donationButtons.forEach(button => {
            if (button.closest('form') && button.closest('form').id === 'donation-form') {
                button.onclick = (e) => {
                    e.preventDefault();
                    console.log('Donation button clicked');
                    const form = button.closest('form');
                    const amountInput = form.querySelector('input[name="amount"], #donation-amount');
                    const amount = parseFloat(amountInput?.value) || 0;
                    console.log('Donation amount from form:', amount);
                    this.processDonationPayment(amount);
                };
            }
        });
    }
    
    // Show message to user
    showMessage(message, type = 'info') {
        console.log('Showing message:', message, 'Type:', type);
        
        // Try to use existing toast function
        if (typeof showToast === 'function') {
            showToast(message, type);
            return;
        }
        
        // Fallback to alert
        alert(message);
    }
    
    // Get current cart total for display
    getCurrentTotal() {
        return this.calculateCartTotal();
    }
    
    // Validate UPI ID format
    validateUPIId(upiId) {
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        return upiRegex.test(upiId);
    }
    
    // Get payment status
    getPaymentStatus() {
        const pendingPayment = sessionStorage.getItem('pendingPayment');
        return pendingPayment ? JSON.parse(pendingPayment) : null;
    }
}

// Initialize UPI Payment System
console.log('Initializing UPI Payment System...');
window.upiPaymentSystem = new UPIPaymentSystem();

// Make functions available globally for backward compatibility
window.processUPIPayment = (amount, type = 'order') => {
    console.log('Global processUPIPayment called:', amount, type);
    if (type === 'donation') {
        window.upiPaymentSystem.processDonationPayment(amount);
    } else {
        window.upiPaymentSystem.processCartPayment();
    }
};

// Global openUPIPayment function
window.openUPIPayment = (amount, type = 'order') => {
    console.log('Global openUPIPayment called:', amount, type);
    window.upiPaymentSystem.openUPIPayment(amount, type);
};

console.log('UPI Payment System loaded successfully');