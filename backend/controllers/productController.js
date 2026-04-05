const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { successResponse, createdResponse, errorResponse, batchResponse } = require('../utils/response');

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
    const { category, search, page = 1, limit = 20, sort = 'created_at' } = req.query;

    let query = supabase
        .from('products')
        .select('id, name, category, price, stock, in_stock, image_url, unit, unit_quantity, display_unit, created_at');

    // Apply filters
    if (category !== undefined && category !== '') {
        query = query.eq('category', category);
    }
    if (search !== undefined && search !== '') {
        query = query.ilike('name', `%${search}%`);
    }

    // Get total count
    const { count } = await query.select('id', { count: 'exact', head: true });

    // Apply pagination and sorting
    const offset = (page - 1) * limit;
    query = query.order(sort, { ascending: sort === 'name' });
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
        throw new AppError('Failed to fetch products', 500);
    }

    return batchResponse(res, 200, data || [], count || 0, 'Products fetched successfully');
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        throw new AppError('Product not found', 404);
    }

    return successResponse(res, 200, data, 'Product retrieved successfully');
});

// POST /api/products  (admin only)
const createProduct = asyncHandler(async (req, res) => {
    const { name, category, price, stock, image_url, unit, unit_quantity, display_unit } = req.body;

    // Validate business logic
    if (price <= 0) {
        throw new AppError('Price must be greater than 0', 400);
    }
    if (stock < 0) {
        throw new AppError('Stock cannot be negative', 400);
    }

    const { data, error } = await supabase
        .from('products')
        .insert({
            name,
            category,
            price,
            stock,
            image_url,
            unit,
            unit_quantity,
            display_unit,
            in_stock: stock > 0
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new AppError('A product with this name already exists', 409);
        }
        throw new AppError('Failed to create product', 500);
    }

    return createdResponse(res, data, 'Product created successfully');
});

// PUT /api/products/:id  (admin only)
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Prevent overwriting id
    delete updates.id;

    // Validate business logic
    if (updates.price !== undefined && updates.price <= 0) {
        throw new AppError('Price must be greater than 0', 400);
    }
    if (updates.stock !== undefined && updates.stock < 0) {
        throw new AppError('Stock cannot be negative', 400);
    }

    // Auto-update in_stock based on stock
    if (updates.stock !== undefined) {
        updates.in_stock = updates.stock > 0;
    }

    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            throw new AppError('Product not found', 404);
        }
        throw new AppError('Failed to update product', 500);
    }

    return successResponse(res, 200, data, 'Product updated successfully');
});

// DELETE /api/products/:id  (admin only)
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if product exists
    const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .single();

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
        throw new AppError('Failed to delete product', 500);
    }

    return successResponse(res, 200, null, 'Product deleted successfully');
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
