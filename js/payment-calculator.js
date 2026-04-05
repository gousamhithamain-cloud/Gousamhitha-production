// Payment Calculator - Single execution, no fallback overrides
class PaymentCalculator {
    constructor() {
        this.subtotal = 0;
        this.tax = 0;
        this.shipping = 0;
        this.total = 0;
        this.taxRate = 0.05;
        this.calculated = false; // guard flag
        console.log('💳 Payment Calculator initialized');
    }

    calculateFromOrderData(orderData) {
        // Guard: skip if already calculated
        if (this.calculated) {
            console.log('💳 Skipping: already calculated');
            return this.total;
        }

        // Guard: skip if no valid items
        if (!orderData || !orderData.items || orderData.items.length === 0) {
            console.warn('💳 Skipping calculation: no valid items');
            return 0;
        }

        console.log('💳 Calculating from items:', orderData.items);

        this.subtotal = orderData.items.reduce((sum, item) => {
            const unitPrice = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return sum + (unitPrice * quantity);
        }, 0);

        this.tax = this.subtotal * this.taxRate;
        this.shipping = Number(orderData.delivery_charge) || 0;
        this.total = this.subtotal + this.tax + this.shipping;
        this.calculated = true;

        console.log('💳 Calculation complete:', {
            subtotal: this.subtotal,
            tax: this.tax,
            shipping: this.shipping,
            total: this.total
        });

        this.updateUI();
        return this.total;
    }

    reset() {
        // Call this when modal closes so next open recalculates fresh
        this.calculated = false;
        this.subtotal = 0;
        this.tax = 0;
        this.shipping = 0;
        this.total = 0;
        console.log('💳 Calculator reset');
    }

    updateUI() {
        const subtotalEl = document.getElementById('order-subtotal');
        const taxEl = document.getElementById('order-tax');
        const shippingEl = document.getElementById('order-shipping');

        if (subtotalEl) subtotalEl.textContent = `₹${this.subtotal.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `₹${this.tax.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = `₹${this.shipping.toFixed(2)}`;

        console.log('💳 UI updated — subtotal:', this.subtotal, 'tax:', this.tax);
    }

    forceRecalculate() {
        // Only recalculate if we have valid context
        if (window.currentPaymentContext && window.currentPaymentContext.data) {
            this.calculated = false; // allow one more run
            return this.calculateFromOrderData(window.currentPaymentContext.data);
        }
        console.warn('💳 forceRecalculate: no payment context available');
        return 0;
    }

    setCustomTotal(subtotal, tax = null, shipping = 0) {
        this.subtotal = subtotal;
        this.tax = tax !== null ? tax : subtotal * this.taxRate;
        this.shipping = shipping;
        this.total = this.subtotal + this.tax + this.shipping;
        this.calculated = true;
        this.updateUI();
        return this.total;
    }
}

// Single instance
const paymentCalculator = new PaymentCalculator();
window.paymentCalculator = paymentCalculator;

window.fixPaymentTotal = () => paymentCalculator.forceRecalculate();
window.setPaymentTotal = (s, t, sh) => paymentCalculator.setCustomTotal(s, t, sh);
window.forceCorrectTotal = () => paymentCalculator.forceRecalculate();

console.log('💳 Payment Calculator ready');
