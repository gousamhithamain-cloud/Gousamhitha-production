const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { createdResponse, successResponse } = require('../utils/response');

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
    const { email, password, full_name, phone } = req.body;

    // Check if user already exists
    const { data: existingAuth } = await supabase.auth.admin.listUsers();
    const userExists = existingAuth?.users?.some(u => u.email === email);

    if (userExists) {
        throw new AppError('This email is already registered', 409);
    }

    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, phone }
    });

    if (error) {
        if (error.message && error.message.includes('already registered')) {
            throw new AppError('Email already registered', 409);
        }
        throw new AppError(error.message || 'Signup failed', 500);
    }

    // Create user profile
    const [firstName, ...rest] = full_name.trim().split(' ');
    const lastName = rest.join(' ') || '';

    const { error: profileError } = await supabase
        .from('users')
        .upsert({
            id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            phone: phone || '',
            role: 'customer'
        }, { onConflict: 'id' });

    if (profileError) {
        console.error('Warning: Failed to create user profile:', profileError.message);
    }

    return createdResponse(res, {
        userId: data.user.id,
        email: data.user.email,
        message: 'Signup successful'
    }, 'User registered successfully');
});

// POST /api/auth/signin
const signin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw new AppError('Invalid email or password', 401);
    }

    if (!data.session) {
        throw new AppError('Failed to create session', 500);
    }

    // Fetch user role from database
    const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

    const userRole = userProfile?.role || 'customer';

    return successResponse(res, 200, {
        user: {
            id: data.user.id,
            email: data.user.email,
            role: userRole
        },
        session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at
        }
    }, 'Login successful');
});

// POST /api/auth/signout
const signout = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        throw new AppError('No token provided', 401);
    }

    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
        console.error('Warning: Signout error:', error.message);
    }

    return successResponse(res, 200, null, 'Logout successful');
});

// GET /api/auth/me  — verify token and return user
const getMe = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        throw new AppError('No authentication token provided', 401);
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        throw new AppError('Invalid or expired token', 401);
    }

    // Get full user profile
    const { data: profile } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, phone, role, created_at')
        .eq('id', data.user.id)
        .single();

    return successResponse(res, 200, {
        user: profile || {
            id: data.user.id,
            email: data.user.email,
            role: data.user.user_metadata?.role || 'customer'
        }
    }, 'Token verified');
});

// POST /api/auth/refresh
const refreshToken = asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        throw new AppError('Refresh token is required', 400);
    }

    const { data, error } = await supabase.auth.refreshSession({
        refresh_token
    });

    if (error || !data.session) {
        throw new AppError('Failed to refresh token', 401);
    }

    return successResponse(res, 200, {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
    }, 'Token refreshed successfully');
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password'
    });

    if (error) {
        throw new AppError('Failed to send password reset email', 500);
    }

    return successResponse(res, 200, null, 'Password reset email sent');
});

module.exports = {
    signup,
    signin,
    signout,
    getMe,
    refreshToken,
    forgotPassword
};


// POST /api/auth/assign-admin (admin only - will be protected by middleware)
const assignAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        throw new AppError('User ID is required', 400);
    }

    // Update user role in database
    const { data, error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            throw new AppError('User not found', 404);
        }
        throw new AppError('Failed to assign admin role', 500);
    }

    return successResponse(res, 200, {
        userId: data.id,
        email: data.email,
        role: data.role
    }, 'Admin role assigned successfully');
});

module.exports = {
    signup,
    signin,
    signout,
    getMe,
    refreshToken,
    forgotPassword,
    assignAdmin
};
