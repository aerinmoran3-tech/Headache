import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const FROM_EMAIL = 'choicepropertygroup@hotmail.com'
const FROM_NAME = 'Choice Properties'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { 
      application_id, 
      applicant_email, 
      applicant_name, 
      status, 
      optional_message 
    } = await req.json()

    if (!applicant_email) {
      throw new Error("Missing applicant_email")
    }

    let subject = ""
    let htmlContent = ""

    const footer = `
      <hr>
      <p style="color: #666; font-size: 12px;"><em>Choice Properties Management</em></p>
    `

    const templates = {
      'awaiting_payment': {
        subject: "Application Received – Payment Required to Proceed / Solicitud Recibida – Pago Requerido",
        html: `
          <h3>Hello ${applicant_name},</h3>
          <p>We have received your application <strong>${application_id}</strong>. To begin the review process, a non-refundable $50 application fee is required.</p>
          <p><strong>Zelle:</strong> choicepropertygroup@hotmail.com<br><strong>Venmo:</strong> @ChoiceProperties</p>
          <p>Please include your Application ID in the payment memo.</p>
          <br>
          <h3>Hola ${applicant_name},</h3>
          <p>Hemos recibido su solicitud <strong>${application_id}</strong>. Para comenzar el proceso de revisión, se requiere una tarifa de solicitud no reembolsable de $50.</p>
          <p><strong>Zelle:</strong> choicepropertygroup@hotmail.com<br><strong>Venmo:</strong> @ChoiceProperties</p>
          <p>Por favor, incluya su ID de Solicitud en la nota de pago.</p>
        `
      },
      'under_review': {
        subject: "Payment Confirmed – Application Now Under Review / Pago Confirmado – Solicitud en Revisión",
        html: `
          <h3>Hello ${applicant_name},</h3>
          <p>We have confirmed your payment for application <strong>${application_id}</strong>. Our team is now reviewing your information.</p>
          <br>
          <h3>Hola ${applicant_name},</h3>
          <p>Hemos confirmado su pago para la solicitud <strong>${application_id}</strong>. Nuestro equipo está revisando su información.</p>
        `
      },
      'approved': {
        subject: "Application Approved! / ¡Solicitud Aprobada!",
        html: `
          <h3>Congratulations ${applicant_name}!</h3>
          <p>Your application <strong>${application_id}</strong> has been approved. A representative will contact you shortly with next steps.</p>
          <br>
          <h3>¡Felicidades ${applicant_name}!</h3>
          <p>Su solicitud <strong>${application_id}</strong> ha sido aprobada. Un representante se pondrá en contacto con usted pronto.</p>
        `
      },
      'denied': {
        subject: "Update regarding your application / Actualización sobre su solicitud",
        html: `
          <h3>Hello ${applicant_name},</h3>
          <p>Thank you for your interest in Choice Properties. Regarding application <strong>${application_id}</strong>, we are unable to move forward at this time.</p>
          <br>
          <h3>Hola ${applicant_name},</h3>
          <p>Gracias por su interés en Choice Properties. Con respecto a la solicitud <strong>${application_id}</strong>, no podemos proceder en este momento.</p>
        `
      },
      'more_info_requested': {
        subject: "Information Requested – Action Required / Información Solicitada – Acción Requerida",
        html: `
          <h3>Hello ${applicant_name},</h3>
          <p>Our team needs more information regarding your application <strong>${application_id}</strong>.</p>
          ${optional_message ? `<p><strong>Message from Admin:</strong> ${optional_message}</p>` : ''}
          <p>Please check your dashboard or reply to this email.</p>
          <br>
          <h3>Hola ${applicant_name},</h3>
          <p>Nuestro equipo necesita más información con respecto a su solicitud <strong>${application_id}</strong>.</p>
          ${optional_message ? `<p><strong>Mensaje del Administrador:</strong> ${optional_message}</p>` : ''}
          <p>Por favor, consulte su panel de control o responda a este correo electrónico.</p>
        `
      }
    }

    const template = templates[status] || {
      subject: "Update on your Application / Actualización de su Solicitud",
      html: `
        <h3>Hello ${applicant_name},</h3>
        <p>There has been an update to your application <strong>${application_id}</strong>.</p>
        ${optional_message ? `<p><strong>Message:</strong> ${optional_message}</p>` : ''}
        <br>
        <h3>Hola ${applicant_name},</h3>
        <p>Ha habido una actualización en su solicitud <strong>${application_id}</strong>.</p>
        ${optional_message ? `<p><strong>Mensaje:</strong> ${optional_message}</p>` : ''}
      `
    }

    subject = template.subject
    htmlContent = template.html + footer

    if (!SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY is not set in Supabase Secrets")
      throw new Error("Email service misconfigured")
    }

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: applicant_email }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: subject,
        content: [{ type: 'text/html', value: htmlContent }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`SendGrid API Error: ${res.status}`, err)
      throw new Error(`Failed to send email via SendGrid`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error) {
    console.error("Edge Function Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
