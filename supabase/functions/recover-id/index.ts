import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    const { email } = await req.json()
    if (!email) throw new Error("Email is required")

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find applications for this email
    const { data: apps, error } = await supabase
      .from('rental_applications')
      .select('application_id, property_address')
      .eq('applicant_email', email)

    if (error) throw error

    if (!apps || apps.length === 0) {
      // We return success even if not found for security, but we don't send email
      return new Response(JSON.stringify({ success: true, message: "If an account exists, an email has been sent." }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Prepare email content
    const appList = apps.map(app => `<li><strong>ID:</strong> ${app.application_id} (${app.property_address || 'N/A'})</li>`).join('')
    
    const subject = "Your Application ID(s) / Sus IDs de Solicitud"
    const htmlContent = `
      <h3>Hello / Hola,</h3>
      <p>You requested a recovery of your Application ID(s) for Choice Properties.</p>
      <ul>${appList}</ul>
      <p>Use these IDs to check your status on the <a href="https://choicepropertiesapplication.netlify.app/dashboard">Applicant Dashboard</a>.</p>
      <hr>
      <p><em>Choice Properties Management</em></p>
    `

    // Send email via SendGrid
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: email }] }],
        from: { email: 'choicepropertygroup@hotmail.com', name: 'Choice Properties' },
        subject: subject,
        content: [{ type: 'text/html', value: htmlContent }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`SendGrid error: ${err}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
