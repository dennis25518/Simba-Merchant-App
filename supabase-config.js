// Supabase Configuration
const SUPABASE_URL = 'https://cmsqvcqddnefquxzchxy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-gvIarUYmwzVVMv2jQiotQ_IM2PVtKg';

// Get the base URL for redirects (works for both local and production)
function getBaseURL() {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}`;
}

// Wait for Supabase library to load, then initialize
function initializeSupabase() {
    if (window.supabase && window.supabase.createClient) {
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                redirectTo: getBaseURL() + '/merchant-reset-password.html'
            }
        });
        window.supabaseClient = supabase;
        console.log('Supabase client initialized successfully');
        console.log('Redirect URL:', getBaseURL() + '/merchant-reset-password.html');
    } else {
        console.warn('Supabase library not loaded yet, retrying...');
        setTimeout(initializeSupabase, 100);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupabase);
} else {
    initializeSupabase();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_URL, SUPABASE_KEY };
}
