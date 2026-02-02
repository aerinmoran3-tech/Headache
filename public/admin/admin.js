/**
 * admin.js
 * Admin panel logic for authentication and application management.
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { STATUS } from '../js/status-map.js';

// Use runtime config from window.ENV
const supabaseUrl = window.ENV?.SUPABASE_URL || '__SUPABASE_URL__';
const supabaseKey = window.ENV?.SUPABASE_ANON_KEY || '__SUPABASE_ANON_KEY__';

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.error('Supabase URL not found in window.ENV. Ensure Vercel environment variables are set.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-message');
        errorMsg.textContent = '';

        try {
            // 1. Authenticate with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw authError;

            // 2. Verify user exists in 'admins' table
            const { data: adminData, error: adminError } = await supabase
                .from('admins')
                .select('email')
                .eq('email', email)
                .single();

            if (adminError || !adminData) {
                // If not in admins table, sign them out immediately
                await supabase.auth.signOut();
                throw new Error("Access denied: User is not an authorized administrator.");
            }

            // 3. Success -> Redirect
            window.location.href = 'application.html';
        } catch (error) {
            errorMsg.textContent = error.message;
            console.error("Login error:", error);
        }
    });
}

// Logic for application.html (Application List)
const appList = document.getElementById('applications-list');
if (appList) {
    async function updateApplicationStatus(applicationId, newStatus) {
        try {
            const notesArea = document.getElementById(`notes-${applicationId}`);
            const adminNotes = notesArea ? notesArea.value.trim() : '';

            // 1. Update status via Edge Function (No direct DB write)
            const { data, error: updateError } = await supabase.functions.invoke('update-status', {
                body: { 
                    application_id: applicationId, 
                    new_status: newStatus,
                    admin_notes: adminNotes || undefined // Send only if not empty
                }
            });

            if (updateError) throw updateError;

            // 2. Refresh list
            loadApplications();
            alert(`Status updated to ${newStatus.replace('_', ' ')}`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`Error: ${error.message}`);
        }
    }

    // Expose to window for inline onclick handlers
    window.updateStatus = updateApplicationStatus;

    async function loadApplications() {
        try {
            appList.innerHTML = '<div class="state-container"><div class="loading-spinner"></div><p>Loading applications...</p></div>';
            const { data, error } = await supabase
                .from('rental_applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                appList.innerHTML = '<p>No applications found.</p>';
                return;
            }

            appList.innerHTML = data.map(app => `
                <div class="application-card" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h3 style="margin-top: 0;">${app.applicant_name}</h3>
                            <p><strong>Status:</strong> <span class="status-badge">${app.application_status.replace('_', ' ')}</span></p>
                            <p><strong>Property:</strong> ${app.property_address}</p>
                            <p><strong>Submitted:</strong> ${new Date(app.created_at).toLocaleDateString()}</p>
                            <div style="margin-top: 10px;">
                                <label for="notes-${app.application_id}" style="display: block; font-size: 0.8rem; color: #666; margin-bottom: 4px;">Admin Notes (internal):</label>
                                <textarea id="notes-${app.application_id}" style="width: 100%; height: 60px; padding: 5px; border-radius: 4px; border: 1px solid #ccc; font-size: 0.9rem;">${app.admin_notes || ''}</textarea>
                            </div>
                        </div>
                        <div class="actions" style="display: flex; flex-direction: column; gap: 5px;">
                            <button onclick="updateStatus('${app.application_id}', '${STATUS.APPROVED}')" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Approve</button>
                            <button onclick="updateStatus('${app.application_id}', '${STATUS.DENIED}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Deny</button>
                            <button onclick="updateStatus('${app.application_id}', '${STATUS.MORE_INFO_REQUESTED}')" style="background: #ffc107; color: black; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Request Info</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching applications:', error);
            appList.innerHTML = `<p class="error">Error loading applications: ${error.message}</p>`;
        }
    }
    loadApplications();
}
