const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { successResponse, createdResponse, batchResponse } = require('../utils/response');

// GET /api/vendors
const getVendors = asyncHandler(async (req, res) => {
    const { status, search, page = 1, limit = 50 } = req.query;

    let query = supabase
        .from('vendors')
        .select('*');

    // Apply filters
    if (status !== undefined && status !== '') {
        query = query.eq('status', status);
    }
    if (search !== undefined && search !== '') {
        query = query.or(`vendor_name.ilike.%${search}%,business_name.ilike.%${search}%`);
    }

    // Get total count
    let countQuery = supabase.from('vendors').select('id', { count: 'exact', head: true });
    if (status !== undefined && status !== '') {
        countQuery = countQuery.eq('status', status);
    }
    if (search !== undefined && search !== '') {
        countQuery = countQuery.or(`vendor_name.ilike.%${search}%,business_name.ilike.%${search}%`);
    }
    const { count } = await countQuery;

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
        console.error('Vendors query error:', error);
        throw new AppError('Failed to fetch vendors', 500);
    }

    console.log('Vendors fetched:', data ? data.length : 0);
    if (data && data.length > 0) {
        console.log('First vendor:', data[0]);
    }
    
    return batchResponse(res, 200, data || [], count || 0, 'Vendors fetched successfully');
});

// GET /api/vendors/:id
const getVendorById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        throw new AppError('Vendor not found', 404);
    }

    return successResponse(res, 200, data, 'Vendor retrieved successfully');
});

// POST /api/vendors (admin only)
const createVendor = asyncHandler(async (req, res) => {
    const { vendor_name, business_name, phone, address, status } = req.body;

    const { data, error } = await supabase
        .from('vendors')
        .insert({
            vendor_name,
            business_name,
            phone: phone || null,
            address: address || null,
            status: status || 'active'
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new AppError('A vendor with this name already exists', 409);
        }
        throw new AppError('Failed to create vendor', 500);
    }

    return createdResponse(res, data, 'Vendor created successfully');
});

// PUT /api/vendors/:id (admin only)
const updateVendor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Prevent overwriting id
    delete updates.id;

    const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            throw new AppError('Vendor not found', 404);
        }
        throw new AppError('Failed to update vendor', 500);
    }

    return successResponse(res, 200, data, 'Vendor updated successfully');
});

// DELETE /api/vendors/:id (admin only)
const deleteVendor = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if vendor exists
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('id', id)
        .single();

    if (!vendor) {
        throw new AppError('Vendor not found', 404);
    }

    const { error } = await supabase.from('vendors').delete().eq('id', id);

    if (error) {
        throw new AppError('Failed to delete vendor', 500);
    }

    return successResponse(res, 200, null, 'Vendor deleted successfully');
});

module.exports = { getVendors, getVendorById, createVendor, updateVendor, deleteVendor };
