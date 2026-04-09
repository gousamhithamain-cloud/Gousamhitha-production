const { OAuth2Client } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');
const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/response');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Anon client for signInWithIdToken (needs anon key, not service key)
const supabaseAnon = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// POST /api/auth/google
const googleSignIn = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        throw new AppError('Google credential token is required', 400);
    }

    // 1. Verify Google ID token
    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (err) {
        console.error('Google token verification failed:', err.message);
        throw new AppError('Invalid Google token', 401);
    }

    const { email, name, sub: googleId, picture } = payload;
    console.log('✅ Google token verified for:', email);

    // 2. Sign in via Supabase using the Google ID token
    const { data, error } = await supabaseAnon.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
    });

    if (error) {
        console.error('Supabase signInWithIdToken error:', error.message);
        // Fallback: manually create/find user and generate session
        return await handleGoogleFallback(req, res, { email, name, googleId, picture });
    }

    const { session, user } = data;

    // 3. Ensure user profile exists
    const [firstName, ...rest] = (name || email).trim().split(' ');
    await supabase.from('users').upsert({
        id: user.id,
        email,
        first_name: firstName,
        last_name: rest.join(' ') || '',
        phone: '',
        role: 'customer'
    }, { onConflict: 'id', ignoreDuplicates: false });

    // 4. Get role
    const { data: profile } = await supabase
        .from('users').select('role').eq('id', user.id).single();

    return successResponse(res, 200, {
        user: { id: user.id, email, name, role: profile?.role || 'customer' },
        session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
        }
    }, 'Google sign-in successful');
});

// Fallback: create/find user manually and use admin createSession
async function handleGoogleFallback(req, res, { email, name, googleId, picture }) {
    // Find or create user
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let user = existingUsers?.users?.find(u => u.email === email);

    if (!user) {
        const { data: newUser, error } = await supabase.auth.admin.createUser({
            email,
            password: `google_${googleId}_${Date.now()}`,
            email_confirm: true,
            user_metadata: { full_name: name, avatar_url: picture, provider: 'google' }
        });
        if (error) throw new AppError('Failed to create account: ' + error.message, 500);
        user = newUser.user;

        const [firstName, ...rest] = (name || email).trim().split(' ');
        await supabase.from('users').upsert({
            id: user.id, email,
            first_name: firstName, last_name: rest.join(' ') || '',
            phone: '', role: 'customer'
        }, { onConflict: 'id' });
    }

    // Generate session
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
        user_id: user.id
    });

    if (sessionError || !sessionData?.session) {
        throw new AppError('Failed to create session after Google sign-in', 500);
    }

    const { data: profile } = await supabase
        .from('users').select('role').eq('id', user.id).single();

    return successResponse(res, 200, {
        user: { id: user.id, email, name, role: profile?.role || 'customer' },
        session: {
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
            expires_at: sessionData.session.expires_at
        }
    }, 'Google sign-in successful');
}

module.exports = { googleSignIn };
