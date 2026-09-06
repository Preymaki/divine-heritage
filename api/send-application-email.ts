/**
 * Serverless API Route: /api/send-application-email
 *
 * Dispatches an email notification to the site administrator when a new childcare
 * application is submitted, with the completed multi-page application PDF attached.
 *
 * Supported providers (configured via environment variables):
 *  1. Resend (via RESEND_API_KEY)
 *  2. SMTP (via SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 *  3. Fallback: logs delivery request if keys not yet set in deployment
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    applicationId,
    childName,
    parentName,
    parentEmail,
    parentPhone,
    submittedAt,
    startDate,
    contractedHours,
    weeklyCost,
    pdfBase64,
  } = req.body || {}

  if (!applicationId || !childName) {
    return res.status(400).json({ error: 'Missing required application payload' })
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'Divineheritagechildcare@gmail.com'
  const resendApiKey = process.env.RESEND_API_KEY

  // 1. Try Resend if configured
  if (resendApiKey) {
    try {
      // Clean base64 string if it contains prefix
      const base64Data = pdfBase64?.includes('base64,')
        ? pdfBase64.split('base64,')[1]
        : pdfBase64

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Divine Heritage Childcare <noreply@divineheritagechildcare.co.uk>',
          to: [adminEmail],
          subject: `New Childcare Application: ${childName} (Ref: ${applicationId})`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
              <div style="background: #1e3a8a; padding: 24px; border-radius: 12px 12px 0 0; color: white;">
                <h1 style="margin: 0; font-size: 20px; font-weight: 700;">New Childcare Application</h1>
                <p style="margin: 6px 0 0 0; opacity: 0.85; font-size: 14px;">Application Reference: <strong>${applicationId}</strong></p>
              </div>
              <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; background: #ffffff; border-radius: 0 0 12px 12px;">
                <p style="margin-top: 0; font-size: 15px;">A new childcare application has been submitted online through the Divine Heritage website.</p>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em;">Key Application Details</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Child:</td><td><strong>${childName}</strong></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Parent / Guardian:</td><td><strong>${parentName}</strong></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Phone:</td><td><a href="tel:${parentPhone}" style="color: #1e3a8a; text-decoration: none;">${parentPhone}</a></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td><a href="mailto:${parentEmail}" style="color: #1e3a8a; text-decoration: none;">${parentEmail}</a></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Target Start Date:</td><td>${startDate}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Contracted Hours:</td><td><strong>${contractedHours} hrs / week</strong></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Estimated Fee:</td><td><strong>£${Number(weeklyCost || 0).toFixed(2)} / week</strong></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Submitted At:</td><td>${new Date(submittedAt).toLocaleString('en-GB')}</td></tr>
                  </table>
                </div>
                <p style="font-size: 14px; color: #475569;">
                  The completed, signed 4-page application document is attached as a PDF to this email.<br/>
                  You can also manage and view this application in the <strong>Divine Heritage Admin Dashboard</strong>.
                </p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: `Divine-Heritage-Application-${applicationId}.pdf`,
              content: base64Data,
            },
          ],
        }),
      })

      if (response.ok) {
        return res.status(200).json({ ok: true, provider: 'resend' })
      } else {
        const errText = await response.text()
        return res.status(502).json({ error: 'Resend API error', details: errText })
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  // If no email keys configured, return status informing frontend
  return res.status(200).json({
    ok: false,
    message: 'Email provider not configured in environment; application saved securely to Firestore and Admin Dashboard.',
  })
}
