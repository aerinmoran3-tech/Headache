/**
 * auth-guard.js
 * Protects admin routes by checking Supabase session and admin table existence.
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Use runtime config from window.ENV
const supabaseUrl = window.ENV?.SUPABASE_URL || '__SUPABASE_URL__';
const supabaseKey = window.ENV?.SUPABASE_ANON_KEY || '__SUPABASE_ANON_KEY__';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            console.log("No session found, redirecting to login...");
            window.location.href = 'login.html';
            return;
        }

        // Double check admin table for security
        const { data: adminData, error } = await supabase
            .from('admins')
            .select('email')
            .eq('id', session.user.id) // Use user ID for more reliable lookup
            .single();

        if (error || !adminData) {
            console.error("Unauthorized access attempt detected or error checking admin table:", error);
            // Optional: await supabase.auth.signOut(); 
            window.location.href = 'login.html';
        } else {
            console.log("Admin authorized:", adminData.email);
            // Allow page content to remain visible
            document.body.style.display = 'block';
        }
    } catch (err) {
        console.error("Auth guard error:", err);
        window.location.href = 'login.html';
    }
}

// Hide body initially to prevent flash of protected content
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.display = 'none';
    checkAuth();
});
