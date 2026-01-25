// Supabase Configuration
const SUPABASE_URL = 'https://cmsqvcqddnefquxzchxy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-gvIarUYmwzVVMv2jQiotQ_IM2PVtKg';

// Wait for Supabase library to load, then initialize
function initializeSupabase() {
    if (window.supabase && window.supabase.createClient) {
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        window.supabaseClient = supabase;
        console.log('Supabase client initialized successfully');
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
