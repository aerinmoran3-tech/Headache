# Choice Properties Rental Application

## Overview

Choice Properties is a property management rental application system. It provides a multi-step rental application form for prospective tenants, an applicant dashboard for tracking application status, and an admin panel for property managers to review and process applications. The system supports bilingual content (English/Spanish) and integrates with Supabase for backend services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static HTML/CSS/JavaScript**: Pure vanilla JavaScript with no frontend framework
- **Multi-page application structure**:
  - `index.html`: Main rental application form with multi-step wizard
  - `dashboard/`: Applicant-facing dashboard to track application status
  - `admin/`: Admin panel for property managers
- **Styling**: Custom CSS with CSS variables for theming, Font Awesome for icons
- **Client-side Supabase SDK**: Loaded via CDN for database operations and authentication

### Application Flow
1. Applicants fill out a multi-section rental application form
2. Applications are submitted to Supabase with generated application IDs (format: `CP-YYYYMMDD-RANDOM`)
3. Applicants can track status via the dashboard using magic link authentication
4. Admins review applications and update statuses through the admin panel

### Authentication & Authorization
- **Applicant Authentication**: Magic link email authentication via Supabase Auth
- **Admin Authentication**: Email/password authentication with additional verification against an `admins` table in Supabase
- **Auth Guard Pattern**: Protected admin routes check both session validity and admin table membership

### Application Status Workflow
Centralized status definitions in `js/status-map.js`:
- `awaiting_payment`: Initial state after submission
- `under_review`: After payment confirmed
- `approved`: Application accepted
- `denied`: Application rejected
- `more_info_requested`: Additional documentation needed

### Supabase Edge Functions
Located in `supabase/functions/`:
- **send-email**: Sends status notification emails via SendGrid
- **update-status**: Admin endpoint to change application status
- **recover-id**: Allows applicants to recover their application IDs via email

### Data Storage
- **Supabase PostgreSQL**: Primary database for `rental_applications` table
- **localStorage**: Draft form data auto-save for applicant convenience
- **File uploads**: Handled via Supabase Storage (10MB max file size)

## External Dependencies

### Supabase Services
- **Supabase Auth**: User authentication (magic links for applicants, email/password for admins)
- **Supabase Database (PostgreSQL)**: Stores applications in `rental_applications` table, admin users in `admins` table
- **Supabase Edge Functions**: Serverless functions for email notifications and status updates
- **Supabase Storage**: Document and file uploads

### Third-Party APIs
- **SendGrid**: Email delivery service for application notifications (configured via `SENDGRID_API_KEY` environment variable)

### CDN Libraries
- **Supabase JS Client**: `@supabase/supabase-js@2` via jsDelivr
- **Font Awesome 6.4.0**: Icons
- **QRCode.js**: QR code generation

### Environment Configuration
- Development: Supabase credentials stored in localStorage
- Production: Credentials injected via placeholder replacement (`__SUPABASE_URL__`, `__SUPABASE_ANON_KEY__`)
- Edge Functions require: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SENDGRID_API_KEY`

### Static File Server
- Uses `serve` npm package (v14.2.5) for local development