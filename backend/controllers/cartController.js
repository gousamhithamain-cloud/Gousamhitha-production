const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { successResponse, createdResponse, batchResponse } = require('../utils/response');

// GET /api/cart/:userId
const getCart = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const { data, error } = await supabase
        .from('cart')
        .select('id, product_id, quantity, products(id, name, price, image_url, stock, display_unit, unit, unit_quantity)')
        .eq('user_id', userId);

    if (error) {
        throw new AppError('Failed to fetch cart', 500);
    }

    return batchResponse(res, 200, data || [], (data || []).length, 'Cart retrieved successfully');
});

// POST /api/cart  — add or update item
const addToCart = asyncHandler(async (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    // Check product stock
    const { data: product, error: pErr } = await supabase
        .from('products')
        .select('stock')
        .eq('id', product_id)
        .single();

    if (pErr || !product) {
        throw new AppError('Product not found', 404);
    }

    if (quantity > product.stock) {
        throw new AppError(`Only ${product.stock} units available in stock`, 422);
    }

    // Check existing cart item
    const { data: existing } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', user_id)
        .eq('product_id', product_id)
        .maybeSingle();

    if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
            throw new AppError(`Only ${product.stock} units available. Currently have ${existing.quantity} in cart.`, 422);
        }

        const { data, error } = await supabase
            .from('cart')
            .update({ quantity: newQty })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) {
            throw new AppError('Failed to update cart item', 500);
        }

        return successResponse(res, 200, data, 'Item quantity updated');
    }

    // Add new item to cart
    const { data, error } = await supabase
        .from('cart')
        .insert({ user_id, product_id, quantity })
        .select()
        .single();

    if (error) {
        throw new AppError('Failed to add item to cart', 500);
    }

    return createdResponse(res, data, 'Item added to cart successfully');
});

// PUT /api/cart/:itemId
const updateCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Get cart item and product info
    const { data: cartItem, error: cartError } = await supabase
        .from('cart')
        .select('product_id')
        .eq('id', itemId)
        .single();

    if (cartError || !cartItem) {
        throw new AppError('Cart item not found', 404);
    }

    // Check product stock
    const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', cartItem.product_id)
        .single();

    if (quantity > product.stock) {
        throw new AppError(`Only ${product.stock} units available`, 422);
    }

    const { data, error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single();

    if (error) {
        throw new AppError('Failed to update cart item', 500);
    }

    return successResponse(res, 200, data, 'Cart item updated successfully');
});

// DELETE /api/cart/:itemId
const removeCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    // Verify item exists
    const { data: item } = await supabase
        .from('cart')
        .select('id')
        .eq('id', itemId)
        .single();

    if (!item) {
        throw new AppError('Cart item not found', 404);
    }

    const { error } = await supabase.from('cart').delete().eq('id', itemId);

    if (error) {
        throw new AppError('Failed to remove cart item', 500);
    }

    return successResponse(res, 200, null, 'Item removed from cart');
});

// DELETE /api/cart/user/:userId  — clear entire cart
const clearCart = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Verify user has items
    const { data: items } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', userId);

    if (!items || items.length === 0) {
        throw new AppError('Cart is already empty', 404);
    }

    const { error } = await supabase.from('cart').delete().eq('user_id', userId);

    if (error) {
        throw new AppError('Failed to clear cart', 500);
    }

    return successResponse(res, 200, null, 'Cart cleared successfully');
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
