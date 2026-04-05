// Nhost Authentication Handler (CDN Version)
// Works without ES6 modules - uses global window.nhost

console.log('🔧 Loading Nhost auth handler (CDN version)...');

// Wait for Nhost to be ready
window.addEventListener('nhostReady', function() {
    console.log('✅ Nhost ready, initializing auth handler...');
    initAuthHandler();
});

// If Nhost is already loaded
if (window.nhost) {
    initAuthHandler();
}

function initAuthHandler() {
    
    // ============================================
    // SIGN UP
    // ============================================
    window.handleSignUp = async function(event) {
        event.preventDefault();
        
        const messageEl = document.getElementById('signup-message');
        
        // Get form values
        const fullName = document.getElementById('signup-name')?.value.trim() || '';
        const email = document.getElementById('signup-email')?.value.trim() || '';
        const mobile = document.getElementById('signup-mobile')?.value.trim() || '';
        const password = document.getElementById('signup-password')?.value || '';
        const confirmPassword = document.getElementById('signup-confirm')?.value || '';
        
        console.log('📝 Signup attempt:', { fullName, email, mobile });
        
        // Validate
        if (!fullName || !email || !password) {
            showAuthMessage(messageEl, 'Please fill all required fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showAuthMessage(messageEl, 'Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAuthMessage(messageEl, 'Password must be at least 6 characters', 'error');
            return;
        }
        
        try {
            showAuthMessage(messageEl, 'Creating account...', 'success');
            console.log('🚀 Calling Nhost signup...');
            
            // Split name
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            // Sign up with Nhost
            const { session, error } = await window.nhost.auth.signUp({
                email: email,
                password: password,
                options: {
                    displayName: fullName,
                    metadata: {
                        phone: mobile,
                        firstName: firstName,
                        lastName: lastName
                    }
                }
            });
            
            if (error) {
                console.error('❌ Signup error:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                throw new Error(error.message || error.error || 'Signup failed');
            }
            
            console.log('✅ Nhost signup successful!');
            
            // Get the newly created user
            const user = window.nhost.auth.getUser();
            console.log('👤 User created:', user);
            
            if (user) {
                // Create user record in custom users table
                try {
                    console.log('📊 Creating user record in database...');
                    console.log('User ID:', user.id);
                    
                    // Use fetch instead of graphql.request for better error handling
                    const response = await fetch('https://mplmzjcwaxqmtyngivxf.ap-south-1.nhost.run/v1/graphql', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${window.nhost.auth.getAccessToken()}`
                        },
                        body: JSON.stringify({
                            query: `
                                mutation InsertUser($id: uuid!, $email: String!, $firstName: String!, $lastName: String, $phone: String) {
                                    insert_users_one(object: {
                                        id: $id,
                                        email: $email,
                                        first_name: $firstName,
                                        last_name: $lastName,
                                        phone: $phone,
                                        role: "customer"
                                    }) {
                                        id
                                        email
                                        first_name
                                        last_name
                                        phone
                                        role
                                    }
                                }
                            `,
                            variables: {
                                id: user.id,
                                email: email,
                                firstName: firstName,
                                lastName: lastName || '',
                                phone: mobile
                            }
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.errors) {
                        console.error('⚠️ GraphQL errors:', result.errors);
                        // Don't fail signup if database insert fails
                    } else {
                        console.log('✅ User record created in database!', result.data);
                    }
                } catch (dbError) {
                    console.error('❌ Database error:', dbError);
                    // Don't fail signup if database insert fails
                }
            }
            
            showAuthMessage(messageEl, 'Account created! Logging you in...', 'success');
            
            // Wait a moment to show the success message
            setTimeout(() => {
                // Close the modal
                if (typeof closeAuthModal === 'function') {
                    closeAuthModal();
                }
                
                // Update profile UI to show logged in state
                if (typeof updateProfileUI === 'function') {
                    updateProfileUI();
                }
                
                // Optionally show a welcome message
                if (typeof showToast === 'function') {
                    showToast('Welcome! Your account has been created successfully.', 'success');
                }
                
                console.log('🎉 Signup complete!');
            }, 1500);
            
        } catch (error) {
            console.error('❌ Signup error:', error);
            showAuthMessage(messageEl, error.message || 'Signup failed', 'error');
        }
    };

    // ============================================
    // SIGN IN
    // ============================================
    window.handleSignIn = async function(event) {
        event.preventDefault();
        
        const messageEl = document.getElementById('signin-message');
        
        // Get form values
        const email = document.getElementById('signin-email')?.value.trim() || '';
        const password = document.getElementById('signin-password')?.value || '';
        
        console.log('🔐 Login attempt:', email);
        
        // Validate
        if (!email || !password) {
            showAuthMessage(messageEl, 'Please enter email and password', 'error');
            return;
        }
        
        try {
            showAuthMessage(messageEl, 'Signing in...', 'success');
            
            // Sign in with Nhost
            const { session, error } = await window.nhost.auth.signIn({
                email: email,
                password: password
            });
            
            if (error) {
                throw new Error(error.message || 'Login failed');
            }
            
            console.log('✅ Login successful!');
            showAuthMessage(messageEl, 'Login successful!', 'success');
            
            // Close modal and show profile
            setTimeout(() => {
                if (typeof updateProfileUI === 'function') {
                    updateProfileUI();
                }
                if (typeof closeAuthModal === 'function') {
                    closeAuthModal();
                }
                if (typeof showProfileModal === 'function') {
                    showProfileModal();
                }
            }, 500);
            
        } catch (error) {
            console.error('❌ Login error:', error);
            showAuthMessage(messageEl, error.message || 'Login failed', 'error');
        }
    };

    // ============================================
    // LOGOUT
    // ============================================
    window.logoutUser = async function() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await window.nhost.auth.signOut();
                if (typeof closeProfileModal === 'function') {
                    closeProfileModal();
                }
                if (typeof updateProfileUI === 'function') {
                    updateProfileUI();
                }
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                window.location.href = 'index.html';
            }
        }
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    function showAuthMessage(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = `auth-message ${type}`;
        element.style.display = 'block';
    }

    console.log('✅ Nhost auth handler initialized (CDN version)');
    console.log('✅ handleSignUp available:', typeof window.handleSignUp === 'function');
    console.log('✅ handleSignIn available:', typeof window.handleSignIn === 'function');
}
