const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { successResponse, createdResponse } = require('../utils/response');

// GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, phone, role, created_at, updated_at')
        .eq('id', id)
        .single();

    if (error || !data) {
        throw new AppError('User not found', 404);
    }

    return successResponse(res, 200, data, 'User retrieved successfully');
});

// POST /api/users  — create user profile after signup
const createUser = asyncHandler(async (req, res) => {
    const { id, email, first_name, last_name, phone } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .single();

    if (existingUser) {
        throw new AppError('User already exists', 409);
    }

    const { data, error } = await supabase
        .from('users')
        .insert({
            id,
            email,
            first_name,
            last_name,
            phone,
            role: 'customer'
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new AppError('User with this email already exists', 409);
        }
        throw new AppError('Failed to create user', 500);
    }

    return createdResponse(res, data, 'User created successfully');
});

// PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone } = req.body;

    // Verify user exists
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .single();

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const { data, error } = await supabase
        .from('users')
        .update({
            first_name,
            last_name,
            phone,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new AppError('Failed to update user', 500);
    }

    return successResponse(res, 200, data, 'User updated successfully');
});

// DELETE /api/users/:id (admin only)
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify user exists
    const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .single();

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Delete user data (cascade will handle related records)
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
        throw new AppError('Failed to delete user', 500);
    }

    return successResponse(res, 200, null, 'User deleted successfully');
});

module.exports = { getUserById, createUser, updateUser, deleteUser };
