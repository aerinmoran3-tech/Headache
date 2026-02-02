import { STATUS, STATUS_LABELS } from '../js/status-map.js';

document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new ApplicantDashboard();
    dashboard.init();
});

class ApplicantDashboard {
    constructor() {
        this.supabaseClient = null;
        this.elements = {
            login: document.getElementById('loginState'),
            authForm: document.getElementById('authForm'),
            authEmail: document.getElementById('authEmail'),
            signInBtn: document.getElementById('signInBtn'),
            loginError: document.getElementById('loginError'),
            loading: document.getElementById('loadingState'),
            error: document.getElementById('errorState'),
            view: document.getElementById('dashboardView'),
            logoutBtn: document.getElementById('logoutBtn'),
            appsContainer: document.getElementById('applicationsContainer'),
            appTemplate: document.getElementById('applicationCardTemplate')
        };
        
        this.initSupabase();
        this.setupAuth();
    }

    initSupabase() {
        // These placeholders will be replaced by Netlify environment variables during build
        const URL = "__SUPABASE_URL__";
        const KEY = "__SUPABASE_ANON_KEY__";

        this.supabaseClient = supabase.createClient(URL, KEY);
    }

    setupAuth() {
        if (this.elements.authForm) {
            this.elements.authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = this.elements.authEmail.value.trim();
                if (!email) return;

                this.elements.signInBtn.disabled = true;
                this.elements.signInBtn.textContent = 'Sending Magic Link...';

                const { error } = await this.supabaseClient.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: window.location.origin + '/dashboard/index.html'
                    }
                });

                if (error) {
                    this.elements.loginError.textContent = error.message;
                    this.elements.loginError.classList.remove('hidden');
                    this.elements.signInBtn.disabled = false;
                    this.elements.signInBtn.textContent = 'Sign In / Sign Up';
                } else {
                    this.elements.loginError.textContent = 'Check your email for the login link!';
                    this.elements.loginError.classList.remove('hidden');
                    this.elements.loginError.style.color = 'var(--success)';
                }
            });
        }

        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', async () => {
                await this.supabaseClient.auth.signOut();
                window.location.reload();
            });
        }
    }

    async init() {
        const { data: { session } } = await this.supabaseClient.auth.getSession();
        
        if (!session) {
            this.showLogin();
            return;
        }

        this.elements.logoutBtn.classList.remove('hidden');
        this.fetchApplications(session.user.id);
    }

    async fetchApplications(userId) {
        try {
            this.elements.login.classList.add('hidden');
            this.elements.loading.classList.remove('hidden');
            this.elements.loading.style.opacity = '0';
            setTimeout(() => this.elements.loading.style.opacity = '1', 10);
            
            const { data: apps, error } = await this.supabaseClient
                .from('rental_applications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (apps && apps.length > 0) {
                this.renderApplications(apps);
                this.setupRealtime(userId);
            } else {
                this.elements.loading.classList.add('hidden');
                this.showError('No applications found for your account.');
            }
        } catch (err) {
            console.error(err);
            this.elements.loading.classList.add('hidden');
            this.showError('An error occurred while fetching your applications.');
        }
    }

    setupRealtime(userId) {
        this.supabaseClient
            .channel(`user-apps-${userId}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'rental_applications',
                filter: `user_id=eq.${userId}`
            }, () => {
                this.fetchApplications(userId);
            })
            .subscribe();
    }

    showLogin() {
        this.elements.loading.classList.add('hidden');
        this.elements.login.classList.remove('hidden');
        this.elements.view.classList.add('hidden');
    }

    showError(msg) {
        this.elements.loading.classList.add('hidden');
        this.elements.error.classList.remove('hidden');
        document.getElementById('errorMessage').textContent = msg;
    }

    renderApplications(apps) {
        this.elements.loading.classList.add('hidden');
        this.elements.view.classList.remove('hidden');
        this.elements.appsContainer.innerHTML = '';

        apps.forEach(app => {
            const clone = this.elements.appTemplate.content.cloneNode(true);
            const card = clone.querySelector('.application-card');
            
            card.querySelector('.displayAppId').textContent = app.application_id;
            card.querySelector('.displayProperty').textContent = app.property_address || 'TBD';
            card.querySelector('.displayDate').textContent = new Date(app.created_at).toLocaleDateString();
            
            const statusLabel = STATUS_LABELS[app.application_status] || app.application_status;
            card.querySelector('.displayStatus').innerHTML = `<span class="badge status-${app.application_status}">${statusLabel}</span>`;
            
            this.updateTimeline(card, app);
            this.updatePaymentCard(card, app);
            this.renderDocuments(card, app);
            this.setupCardUpload(card, app.application_id);

            this.elements.appsContainer.appendChild(clone);
        });
    }

    updateTimeline(card, app) {
        const timeline = card.querySelector('.timeline');
        const status = app.application_status;
        const payment = app.payment_status;

        if (status === STATUS.DENIED || status === STATUS.AWAITING_PAYMENT) {
            timeline.classList.add('hidden');
            return;
        }

        timeline.classList.remove('hidden');
        const steps = {
            payment: card.querySelector('.payment-step'),
            review: card.querySelector('.review-step'),
            final: card.querySelector('.final-step')
        };

        if (payment === 'paid') {
            steps.payment.classList.add('completed');
            steps.payment.querySelector('.step-icon').innerHTML = '<i class="fas fa-check"></i>';
            steps.review.classList.add('active');
        }

        if (status === STATUS.APPROVED) {
            Object.values(steps).forEach(step => {
                step.classList.add('completed');
                step.querySelector('.step-icon').innerHTML = '<i class="fas fa-check"></i>';
            });
        }
    }

    updatePaymentCard(card, app) {
        const paymentCard = card.querySelector('.payment-card');
        if (app.payment_status === 'pending') {
            paymentCard.classList.remove('hidden');
        } else {
            paymentCard.classList.add('hidden');
        }
    }

    async renderDocuments(card, app) {
        const container = card.querySelector('.doc-list-container');
        const docCard = card.querySelector('.document-card');
        docCard.classList.remove('hidden');

        const docs = app.form_data?.documents || [];
        if (docs.length === 0) return;

        container.innerHTML = '<ul class="doc-list" style="list-style:none; padding:0;"></ul>';
        const list = container.querySelector('.doc-list');

        for (const doc of docs) {
            const li = document.createElement('li');
            li.style.cssText = 'margin-bottom:8px; font-size:0.9rem; display:flex; align-items:center; gap:8px;';
            const { data } = await this.supabaseClient.storage.from('application-documents').createSignedUrl(doc.path, 3600);
            
            li.innerHTML = `
                <i class="fas fa-file-alt"></i>
                <span style="flex:1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${doc.name}</span>
                ${data ? `<a href="${data.signedUrl}" target="_blank" style="color:var(--primary);"><i class="fas fa-download"></i></a>` : ''}
            `;
            list.appendChild(li);
        }
    }

    setupCardUpload(card, appId) {
        const btn = card.querySelector('.uploadBtn');
        const input = card.querySelector('.additionalDocInput');
        const status = card.querySelector('.uploadStatus');

        btn.addEventListener('click', () => input.click());
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                status.textContent = 'Uploading...';
                status.classList.remove('hidden');
                btn.disabled = true;

                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${file.name.split('.').pop()}`;
                const filePath = `applications/${appId}/additional/${fileName}`;

                const { error: uploadError } = await this.supabaseClient.storage
                    .from('application-documents')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: currentApp } = await this.supabaseClient
                    .from('rental_applications')
                    .select('form_data')
                    .eq('application_id', appId)
                    .single();

                const formData = currentApp.form_data || {};
                const documents = formData.documents || [];
                documents.push({ name: file.name, path: filePath, uploaded_at: new Date().toISOString() });
                
                await this.supabaseClient
                    .from('rental_applications')
                    .update({ form_data: { ...formData, documents } })
                    .eq('application_id', appId);

                status.textContent = 'Success!';
                status.style.color = 'var(--success)';
            } catch (err) {
                status.textContent = 'Failed.';
                status.style.color = 'var(--danger)';
            } finally {
                btn.disabled = false;
                setTimeout(() => status.classList.add('hidden'), 3000);
            }
        });
    }
}
