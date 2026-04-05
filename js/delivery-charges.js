// Delivery Charges Calculator
// Calculates delivery charges based on pincode and order total

class DeliveryChargeCalculator {
    constructor() {
        this.deliveryInfo = null;
    }

    // Get delivery charge for a pincode
    async getDeliveryCharge(pincode, orderTotal = 0) {
        if (!window.supabase) {
            // Using backend API instead
            return this.getDefaultCharge();
        }

        try {
            // Call the database function to get delivery charge
            const { data, error } = await window.supabase
                .rpc('get_delivery_charge', { pincode_input: pincode });

            if (error) {
                console.error('Error fetching delivery charge:', error);
                return this.getDefaultCharge();
            }

            if (!data || data.length === 0) {
                return this.getDefaultCharge();
            }

            const zoneInfo = data[0];
            
            // Check if order qualifies for free delivery
            const isFreeDelivery = zoneInfo.min_order_for_free_delivery && 
                                   orderTotal >= zoneInfo.min_order_for_free_delivery;

            this.deliveryInfo = {
                zoneName: zoneInfo.zone_name,
                charge: isFreeDelivery ? 0 : parseFloat(zoneInfo.delivery_charge),
                originalCharge: parseFloat(zoneInfo.delivery_charge),
                minOrderForFree: zoneInfo.min_order_for_free_delivery ? parseFloat(zoneInfo.min_order_for_free_delivery) : null,
                estimatedDays: zoneInfo.estimated_days,
                isFreeDelivery: isFreeDelivery,
                pincode: pincode
            };

            return this.deliveryInfo;

        } catch (error) {
            console.error('Exception in getDeliveryCharge:', error);
            return this.getDefaultCharge();
        }
    }

    // Get default delivery charge (fallback)
    getDefaultCharge() {
        return {
            zoneName: 'Standard Delivery',
            charge: 100,
            originalCharge: 100,
            minOrderForFree: 1000,
            estimatedDays: '5-7 days',
            isFreeDelivery: false,
            pincode: null
        };
    }

    // Calculate total with delivery
    calculateTotal(subtotal, deliveryCharge) {
        return parseFloat(subtotal) + parseFloat(deliveryCharge);
    }

    // Format delivery info for display
    formatDeliveryInfo(deliveryInfo) {
        if (!deliveryInfo) return '';

        let html = `
            <div class="delivery-info-box" style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2196F3;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <strong style="color: #333; font-size: 16px;">🚚 ${deliveryInfo.zoneName}</strong>
                        <div style="color: #666; font-size: 13px; margin-top: 4px;">
                            Estimated Delivery: ${deliveryInfo.estimatedDays}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        ${deliveryInfo.isFreeDelivery 
                            ? `<span style="color: #4caf50; font-weight: 600; font-size: 16px;">FREE</span>
                               <div style="color: #999; font-size: 12px; text-decoration: line-through;">₹${deliveryInfo.originalCharge}</div>`
                            : `<span style="color: #333; font-weight: 600; font-size: 16px;">₹${deliveryInfo.charge}</span>`
                        }
                    </div>
                </div>
        `;

        // Show free delivery progress
        if (!deliveryInfo.isFreeDelivery && deliveryInfo.minOrderForFree) {
            const remaining = deliveryInfo.minOrderForFree - (window.cartSubtotal || 0);
            if (remaining > 0) {
                html += `
                    <div style="background: #fff3cd; padding: 10px; border-radius: 6px; margin-top: 10px;">
                        <div style="color: #856404; font-size: 13px;">
                            💡 Add ₹${remaining.toFixed(2)} more to get FREE delivery!
                        </div>
                        <div style="background: #fff; height: 6px; border-radius: 3px; margin-top: 6px; overflow: hidden;">
                            <div style="background: #ffc107; height: 100%; width: ${((window.cartSubtotal || 0) / deliveryInfo.minOrderForFree * 100)}%; transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }
        }

        html += `</div>`;
        return html;
    }

    // Show delivery charge in checkout
    async updateCheckoutDelivery(pincode, subtotal) {
        const deliveryInfo = await this.getDeliveryCharge(pincode, subtotal);
        
        // Update delivery charge display
        const deliveryChargeEl = document.getElementById('delivery-charge');
        if (deliveryChargeEl) {
            deliveryChargeEl.textContent = deliveryInfo.isFreeDelivery 
                ? 'FREE' 
                : `₹${deliveryInfo.charge}`;
        }

        // Update delivery info box
        const deliveryInfoEl = document.getElementById('delivery-info-box');
        if (deliveryInfoEl) {
            deliveryInfoEl.innerHTML = this.formatDeliveryInfo(deliveryInfo);
        }

        // Update total
        const total = this.calculateTotal(subtotal, deliveryInfo.charge);
        const totalEl = document.getElementById('order-total');
        if (totalEl) {
            totalEl.textContent = `₹${total.toFixed(2)}`;
        }

        return deliveryInfo;
    }
}

// Create global instance
window.deliveryCalculator = new DeliveryChargeCalculator();

// Auto-calculate on pincode change
document.addEventListener('DOMContentLoaded', function() {
    const pincodeInput = document.getElementById('pincode') || document.getElementById('checkout-pincode');
    
    if (pincodeInput) {
        pincodeInput.addEventListener('blur', async function() {
            const pincode = this.value.trim();
            if (pincode && pincode.length === 6) {
                const subtotal = parseFloat(document.getElementById('cart-subtotal')?.textContent?.replace('₹', '') || 0);
                await window.deliveryCalculator.updateCheckoutDelivery(pincode, subtotal);
            }
        });
    }
});
