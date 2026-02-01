import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const ALLOWED_STATUSES = [
  'awaiting_payment',
  'under_review',
  'approved',
  'denied',
  'more_info_requested'
]

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { application_id, new_status, admin_notes } = await req.json()

    // 1. Validation
    if (!application_id) throw new Error("Missing application_id")
    if (!ALLOWED_STATUSES.includes(new_status)) {
      throw new Error(`Invalid status: ${new_status}. Allowed: ${ALLOWED_STATUSES.join(', ')}`)
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing in Edge Function secrets")
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 2. Update Application Status
    const updatePayload: any = { application_status: new_status }
    if (admin_notes !== undefined) {
      updatePayload.admin_notes = admin_notes
    }

    const { data: appData, error: updateError } = await supabase
      .from('rental_applications')
      .update(updatePayload)
      .eq('application_id', application_id)
      .select('applicant_email, applicant_name')
      .single()

    if (updateError) throw updateError
    if (!appData) throw new Error("Application not found")

    // 3. Trigger Email Notification
    try {
      const emailResponse = await supabase.functions.invoke('send-email', {
        body: {
          application_id,
          applicant_email: appData.applicant_email,
          applicant_name: appData.applicant_name,
          status: new_status,
          optional_message: admin_notes
        }
      })
      
      if (emailResponse.error) {
        console.error("Email trigger failed:", emailResponse.error)
      }
    } catch (emailErr) {
      console.error("Email invocation error:", emailErr)
    }

    return new Response(JSON.stringify({ success: true, message: "Status updated and email triggered" }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })

  } catch (error) {
    console.error("Update Status Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
