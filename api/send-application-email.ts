/**
 * Serverless API Route: /api/send-application-email
 *
 * Dispatches an email notification to divineheritagechildcare@gmail.com when a new
 * childcare application is submitted, with the completed 5-page application PDF attached
 * and a direct download link if uploaded to cloud storage.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const {
    applicationId,
    childName,
    childDob,
    parentName,
    parentEmail,
    parentPhone,
    submittedAt,
    startDate,
    contractedHours,
    weeklyCost,
    pdfBase64,
    pdfFilename,
    pdfStorageUrl,
  } = req.body || {}

  if (!applicationId || !childName) {
    return res.status(400).json({ ok: false, error: 'Missing required application payload' })
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'divineheritagechildcare@gmail.com'
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || 'Divine Heritage Childcare <onboarding@resend.dev>'
  const attachmentFilename =
    pdfFilename || `Divine-Heritage-Application-${applicationId}.pdf`

  // 1. Try Resend if configured
  if (resendApiKey) {
    try {
      const base64Data = pdfBase64?.includes('base64,')
        ? pdfBase64.split('base64,')[1]
        : pdfBase64

      const formattedCost =
        typeof weeklyCost === 'string' && weeklyCost.startsWith('£')
          ? weeklyCost
          : `£${Number(weeklyCost || 0).toFixed(2)}`

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [adminEmail],
          reply_to: parentEmail || undefined,
          subject: `New Childcare Application: ${childName} (Ref: ${applicationId})`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
              <div style="background: #1e3a8a; padding: 24px; border-radius: 12px 12px 0 0; color: white;">
                <h1 style="margin: 0; font-size: 20px; font-weight: 700;">New Childcare Application Received</h1>
                <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Application Reference: <strong>${applicationId}</strong></p>
              </div>
              <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; background: #ffffff; border-radius: 0 0 12px 12px;">
                <p style="margin-top: 0; font-size: 15px;">A new childcare application has been submitted online and the signed 5-page PDF form is attached to this email.</p>
                ${
                  pdfStorageUrl
                    ? `<div style="margin: 18px 0;">
                        <a href="${pdfStorageUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #1e3a8a; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px;">
                          Download Official Signed PDF Form
                        </a>
                      </div>`
                    : ''
                }
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em;">Key Application Details</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr><td style="padding: 6px 0; color: #64748b; width: 150px;">Child Name:</td><td><strong>${childName}</strong></td></tr>
                    ${childDob ? `<tr><td style="padding: 6px 0; color: #64748b;">Date of Birth:</td><td>${childDob}</td></tr>` : ''}
                    <tr><td style="padding: 6px 0; color: #64748b;">Parent / Guardian:</td><td><strong>${parentName}</strong></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Phone:</td><td><a href="tel:${parentPhone}" style="color: #1e3a8a; text-decoration: none;">${parentPhone}</a></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td><a href="mailto:${parentEmail}" style="color: #1e3a8a; text-decoration: none;">${parentEmail}</a></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Target Start Date:</td><td>${startDate}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Contracted Hours:</td><td><strong>${contractedHours} hrs / week</strong></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Estimated Weekly Fee:</td><td><strong>${formattedCost} / week</strong></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;">Submitted At:</td><td>${new Date(submittedAt).toLocaleString('en-GB')}</td></tr>
                  </table>
                </div>
                <p style="font-size: 13px; color: #475569;">
                  The completed 5-page application PDF (<strong>${attachmentFilename}</strong>) is attached directly to this email and is also logged in the Divine Heritage Admin Dashboard for general oversight.
                </p>
              </div>
            </div>
          `,
          attachments: base64Data
            ? [
                {
                  filename: attachmentFilename,
                  content: base64Data,
                },
              ]
            : undefined,
        }),
      })

      if (response.ok) {
        return res.status(200).json({ ok: true, provider: 'resend' })
      } else {
        const errText = await response.text()
        return res.status(502).json({ ok: false, error: 'Resend API error', details: errText })
      }
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err.message })
    }
  }

  return res.status(503).json({
    ok: false,
    message: 'Server email key not configured; falling back to direct email dispatch.',
  })
}
