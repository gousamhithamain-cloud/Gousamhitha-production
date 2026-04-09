const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { successResponse, createdResponse, batchResponse } = require('../utils/response');

const VALID_STATUSES = ['Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

// GET /api/orders  (admin — all orders)
const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, sortBy = 'created_at' } = req.query;

    let query = supabase
        .from('orders')
        .select('*, order_items(*)');

    if (status && VALID_STATUSES.includes(status)) {
        query = query.eq('order_status', status);
    }

    // Get total count
    const { count } = await query.select('id', { count: 'exact', head: true });

    // Apply pagination and sorting
    const offset = (page - 1) * limit;
    query = query.order(sortBy, { ascending: sortBy === 'customer_name' });
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
        throw new AppError('Failed to fetch orders', 500);
    }

    return batchResponse(res, 200, data || [], count || 0, 'Orders retrieved successfully');
});

// GET /api/orders/user/:userId
const getUserOrders = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    let query = supabase
        .from('orders')
        .select('*, order_items(*)');

    query = query.eq('user_id', userId);

    // Get total count
    const { count } = await query.select('id', { count: 'exact', head: true });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
        throw new AppError('Failed to fetch user orders', 500);
    }

    return batchResponse(res, 200, data || [], count || 0, 'User orders retrieved successfully');
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

    if (error || !data) {
        throw new AppError('Order not found', 404);
    }

    return successResponse(res, 200, data, 'Order retrieved successfully');
});

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
    const {
        user_id, customer_name, email, phone,
        address, delivery_address, city, pincode, notes,
        subtotal, delivery_charge = 0, total,
        payment_method = 'COD', items
    } = req.body;

    console.log('📦 Creating order for user:', user_id);
    console.log('📦 Items count:', items ? items.length : 0);

    // Verify all products exist and stock is available
    for (const item of items) {
        const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

        if (!product) {
            throw new AppError(`Product ${item.product_id} not found`, 404);
        }

        if (item.quantity > product.stock) {
            throw new AppError(`Insufficient stock for product ${item.product_name}`, 422);
        }
    }

    const orderTotal = total || ((subtotal || 0) + (delivery_charge || 0));
    const finalAddress = address || delivery_address || '';

    // Build insert object - try both column name variants
    const orderInsert = {
        user_id,
        customer_name,
        email,
        phone,
        address: finalAddress,
        delivery_address: delivery_address || address || finalAddress,
        city,
        pincode,
        notes: notes || null,
        total: orderTotal,
        payment_method,
        order_status: 'Pending',
        payment_status: 'pending'
    };

    console.log('📦 Order insert payload:', JSON.stringify(orderInsert, null, 2));

    const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert(orderInsert)
        .select()
        .single();

    if (orderErr) {
        console.error('❌ Order insert error:', JSON.stringify(orderErr, null, 2));
        throw new AppError('Failed to create order: ' + orderErr.message, 500);
    }

    return await finishOrder(res, order, items, user_id);
});

async function finishOrder(res, order, items, user_id) {
    const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) {
        console.error('❌ Order items insert error:', JSON.stringify(itemsErr, null, 2));
        await supabase.from('orders').delete().eq('id', order.id);
        throw new AppError('Failed to create order items: ' + itemsErr.message, 500);
    }

    // Clear user's cart
    try {
        await supabase.from('cart').delete().eq('user_id', user_id);
    } catch (err) {
        console.error('Warning: Failed to clear cart:', err.message);
    }

    console.log('✅ Order created successfully:', order.id);
    return createdResponse(res, order, 'Order created successfully');
}

// PUT /api/orders/:id/status  (admin only)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Verify order exists
    const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('id', id)
        .single();

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    const { data, error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new AppError('Failed to update order status', 500);
    }

    return successResponse(res, 200, data, 'Order status updated successfully');
});

// PUT /api/orders/:id/payment-status (admin only)
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { payment_status } = req.body;

    const { data, error } = await supabase
        .from('orders')
        .update({ payment_status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new AppError('Failed to update payment status', 500);
    }

    return successResponse(res, 200, data, 'Payment status updated successfully');
});

// DELETE /api/orders/:id  (admin only)
const deleteOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify order exists
    const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('id', id)
        .single();

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    // Delete order items first
    const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', id);
    if (itemsErr) {
        throw new AppError('Failed to delete order items', 500);
    }

    // Delete order
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
        throw new AppError('Failed to delete order', 500);
    }

    return successResponse(res, 200, null, 'Order deleted successfully');
});

module.exports = {
    getAllOrders,
    getUserOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder
};
