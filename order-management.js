


function initializeOrders() {
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('orderItems')) {
        localStorage.setItem('orderItems', JSON.stringify([]));
    }
}

initializeOrders();


function createOrderFromCart(customerInfo) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return null;
    }
    const orderId = 'GS' + Date.now().toString().slice(-8);
    const orderDate = new Date().toISOString();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; 
    const shipping = 50; 
    const total = subtotal + tax + shipping;
    const order = {
        id: orderId,
        customerName: customerInfo.name || 'Guest Customer',
        customerEmail: customerInfo.email || '',
        customerPhone: customerInfo.phone || '',
        shippingAddress: customerInfo.address || '',
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        status: 'Pending',
        paymentStatus: 'Pending',
        date: new Date().toLocaleDateString(),
        createdAt: orderDate
    };
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    const orderItems = JSON.parse(localStorage.getItem('orderItems')) || [];
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        const vendorId = product ? product.vendor_id : null;
        const orderItem = {
            id: 'OI' + Date.now() + Math.random().toString(36).substr(2, 9),
            orderId: orderId,
            productId: cartItem.id,
            productName: cartItem.name,
            vendorId: vendorId,
            quantity: cartItem.quantity,
            unitPrice: cartItem.price,
            totalPrice: cartItem.price * cartItem.quantity,
            status: 'Pending',
            createdAt: orderDate
        };
        orderItems.push(orderItem);
    });
    localStorage.setItem('orderItems', JSON.stringify(orderItems));
    localStorage.setItem('cart', JSON.stringify([]));
    return order;
}


function getVendorOrders(vendorId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderItems = JSON.parse(localStorage.getItem('orderItems')) || [];
    const vendorOrderItems = orderItems.filter(item => item.vendorId === vendorId);
    const vendorOrders = [];
    vendorOrderItems.forEach(item => {
        const order = orders.find(o => o.id === item.orderId);
        if (order) {
            vendorOrders.push({
                ...item,
                orderDate: order.date,
                customerName: order.customerName,
                shippingAddress: order.shippingAddress,
                orderStatus: order.status
            });
        }
    });
    return vendorOrders;
}


function getAllOrdersWithItems() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderItems = JSON.parse(localStorage.getItem('orderItems')) || [];
    const vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    return orders.map(order => {
        const items = orderItems.filter(item => item.orderId === order.id);
        const itemsWithVendor = items.map(item => {
            const vendor = vendors.find(v => v.id === item.vendorId);
            return {
                ...item,
                vendorName: vendor ? vendor.vendorName : 'N/A',
                businessName: vendor ? vendor.businessName : 'N/A'
            };
        });
        return {
            ...order,
            items: itemsWithVendor
        };
    });
}


function updateOrderItemStatus(orderItemId, newStatus) {
    const orderItems = JSON.parse(localStorage.getItem('orderItems')) || [];
    const item = orderItems.find(i => i.id === orderItemId);
    if (item) {
        item.status = newStatus;
        item.updatedAt = new Date().toISOString();
        localStorage.setItem('orderItems', JSON.stringify(orderItems));
        updateOrderStatus(item.orderId);
        return true;
    }
    return false;
}


function updateOrderStatus(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderItems = JSON.parse(localStorage.getItem('orderItems')) || [];
    const order = orders.find(o => o.id === orderId);
    const items = orderItems.filter(i => i.orderId === orderId);
    if (!order || items.length === 0) return;
    const allStatuses = items.map(i => i.status);
    if (allStatuses.every(s => s === 'Delivered')) {
        order.status = 'Delivered';
    } else if (allStatuses.every(s => s === 'Cancelled')) {
        order.status = 'Cancelled';
    } else if (allStatuses.some(s => s === 'Shipped')) {
        order.status = 'Shipped';
    } else if (allStatuses.some(s => s === 'Packed')) {
        order.status = 'Packed';
    } else if (allStatuses.some(s => s === 'Confirmed')) {
        order.status = 'Confirmed';
    }
    localStorage.setItem('orders', JSON.stringify(orders));
}


function getCustomerOrders(customerEmail) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    return orders.filter(o => o.customerEmail === customerEmail);
}
