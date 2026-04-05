// Profile Error Fix - Handle common profile page issues

class ProfileErrorFix {
    constructor() {
        this.init();
    }
    
    init() {
        // Monitor for network errors
        this.setupNetworkMonitoring();
        
        // Setup error recovery
        this.setupErrorRecovery();
        
        // Monitor Supabase loading
        this.monitorSupabaseLoading();
        
        console.log('✅ Profile error fix initialized');
    }
    
    setupNetworkMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            console.log('🌐 Network connection restored');
            this.showNetworkStatus('Connection restored', 'success');
            
            // Retry loading if we're on the loading screen
            if (document.getElementById('loading').style.display !== 'none') {
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('📵 Network connection lost');
            this.showNetworkStatus('No internet connection', 'error');
        });
    }
    
    setupErrorRecovery() {
        // Global error handler for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Unhandled promise rejection:', event.reason);
            
            if (event.reason?.message?.includes('supabase') || 
                event.reason?.message?.includes('fetch')) {
                this.handleSupabaseError(event.reason);
            }
        });
        
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('❌ Global error:', event.error);
            
            if (event.error?.message?.includes('supabase')) {
                this.handleSupabaseError(event.error);
            }
        });
    }
    
    monitorSupabaseLoading() {
        let checkCount = 0;
        const maxChecks = 30; // 3 seconds
        
        const checkSupabase = () => {
            checkCount++;
            
            if (window.supabase) {
                console.log('✅ Supabase loaded successfully');
                return;
            }
            
            if (checkCount >= maxChecks) {
                console.error('❌ Supabase failed to load after 3 seconds');
                this.handleSupabaseLoadFailure();
                return;
            }
            
            setTimeout(checkSupabase, 100);
        };
        
        setTimeout(checkSupabase, 100);
    }
    
    handleSupabaseError(error) {
        console.error('🔧 Handling Supabase error:', error);
        
        const loading = document.getElementById('loading');
        if (loading && loading.style.display !== 'none') {
            loading.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                    <h3>Connection Error</h3>
                    <p>Unable to connect to the server.</p>
                    <p style="font-size: 0.9rem; color: #666; margin: 1rem 0;">
                        Error: ${error.message || 'Unknown error'}
                    </p>
                    <button onclick="window.location.reload()" 
                            style="padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 0.5rem;">
                        Retry
                    </button>
                    <a href="index.html" 
                       style="display: inline-block; margin-left: 0.5rem; padding: 0.5rem 1rem; background: #666; color: white; text-decoration: none; border-radius: 5px;">
                        Go Home
                    </a>
                </div>
            `;
        }
    }
    
    handleSupabaseLoadFailure() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                    <h3>Loading Error</h3>
                    <p>The profile system failed to load.</p>
                    <div style="margin: 1rem 0; padding: 1rem; background: #f5f5f5; border-radius: 5px; text-align: left; display: inline-block;">
                        <strong>Possible causes:</strong>
                        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                            <li>Network connection issues</li>
                            <li>Server maintenance</li>
                            <li>Browser blocking scripts</li>
                        </ul>
                    </div>
                    <br>
                    <button onclick="window.location.reload()" 
                            style="padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 0.5rem;">
                        Refresh Page
                    </button>
                    <a href="index.html" 
                       style="display: inline-block; margin-left: 0.5rem; padding: 0.5rem 1rem; background: #666; color: white; text-decoration: none; border-radius: 5px;">
                        Go Home
                    </a>
                </div>
            `;
        }
    }
    
    showNetworkStatus(message, type) {
        // Create or update network status indicator
        let indicator = document.getElementById('network-status');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'network-status';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 14px;
                font-weight: 600;
                z-index: 10000;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = message;
        
        if (type === 'success') {
            indicator.style.background = '#4caf50';
            indicator.style.color = 'white';
        } else {
            indicator.style.background = '#f44336';
            indicator.style.color = 'white';
        }
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 3000);
    }
    
    // Utility method to check if user is online
    isOnline() {
        return navigator.onLine;
    }
    
    // Method to test Supabase connection
    async testSupabaseConnection() {
        if (!window.supabase) {
            throw new Error('Supabase not loaded');
        }
        
        try {
            // Simple test query
            const { error } = await window.supabase.auth.getUser();
            if (error && error.message !== 'Invalid JWT') {
                throw error;
            }
            return true;
        } catch (error) {
            console.error('Supabase connection test failed:', error);
            throw error;
        }
    }
}

// Initialize the profile error fix
const profileErrorFix = new ProfileErrorFix();

// Make it globally available for debugging
window.profileErrorFix = profileErrorFix;