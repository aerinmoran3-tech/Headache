/**
 * config.js
 * Runtime configuration for Supabase.
 * These values should be set as environment variables in Vercel or locally.
 */
window.ENV = {
    SUPABASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? localStorage.getItem('SUPABASE_URL') : "__SUPABASE_URL__",
    SUPABASE_ANON_KEY: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? localStorage.getItem('SUPABASE_ANON_KEY') : "__SUPABASE_ANON_KEY__"
};
