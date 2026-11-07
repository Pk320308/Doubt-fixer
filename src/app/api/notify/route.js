import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Default fallback admin details if not set in environment
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'doubtfixxer9918@gmail.com'
const RESEND_API_KEY = process.env.RESEND_API_KEY

// Admin Recipients for WhatsApp Notifications
const recipients = [
  {
    phone: process.env.CALLMEBOT_PHONE || '918604971873',
    apiKey: process.env.CALLMEBOT_API_KEY
  },
  {
    phone: process.env.CALLMEBOT_PHONE_2 || '916205669598',
    apiKey: process.env.CALLMEBOT_API_KEY_2 || process.env.CALLMEBOT_API_KEY
  }
]

/**
 * Send WhatsApp Message via CallMeBot to all configured recipients (100% Free)
 */
async function sendWhatsApp(messageText) {
  const activeRecipients = recipients.filter(r => r.phone && r.apiKey)

  if (activeRecipients.length === 0) {
    console.log('[WhatsApp Notification Skipped]: No valid phone + API key configured.')
    return { success: false, reason: 'missing_keys' }
  }

  const results = await Promise.allSettled(
    activeRecipients.map(async (recipient) => {
      try {
        const cleanPhone = recipient.phone.replace(/[^0-9+]/g, '')
        const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(messageText)}&apikey=${encodeURIComponent(recipient.apiKey)}`

        const res = await fetch(url, { method: 'GET' })
        const text = await res.text()
        return { phone: cleanPhone, success: res.ok, response: text }
      } catch (err) {
        console.error(`[WhatsApp Error for ${recipient.phone}]:`, err.message)
        return { phone: recipient.phone, success: false, error: err.message }
      }
    })
  )

  return { success: true, results }
}

/**
 * Send Email Notification via Resend (Free 3,000 emails/month)
 */
async function sendEmail({ subject, htmlContent }) {
  const apiKey = process.env.RESEND_API_KEY || RESEND_API_KEY
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || ADMIN_EMAIL

  if (!apiKey) {
    console.log('[Email Notification Skipped]: RESEND_API_KEY not set.')
    return { success: false, reason: 'missing_resend_key' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Doubt Fixer Alerts <onboarding@resend.dev>',
        to: [adminEmail],
        subject: subject,
        html: htmlContent
      })
    })

    const data = await res.json()
    console.log('[Resend Response]:', data)
    return { success: res.ok, data }
  } catch (err) {
    console.error('[Email Notification Error]:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Diagnostic GET endpoint to test Resend API key & Email from browser directly
 */
export async function GET() {
  const apiKey = process.env.RESEND_API_KEY || RESEND_API_KEY
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || ADMIN_EMAIL

  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'RESEND_API_KEY is missing in environment variables on Vercel!',
      config: {
        hasApiKey: false,
        adminEmail: adminEmail || 'not set'
      }
    }, { status: 500 })
  }

  const testEmailResult = await sendEmail({
    subject: '🧪 Doubt Fixer Diagnostic Test Email',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #16a34a;">✅ Resend Email Integration is Working!</h2>
        <p>This is a live test email sent directly from your Doubt Fixer website on Vercel.</p>
        <p><strong>Configured Recipient:</strong> ${adminEmail}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
      </div>
    `
  })

  return NextResponse.json({
    status: 'diagnostics',
    config: {
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 7) + '...' : null,
      adminEmail: adminEmail || 'not set'
    },
    resendResult: testEmailResult
  })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 })
    }

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

    let waMessage = ''
    let emailSubject = ''
    let emailHtml = ''

    // 1. TEACHER APPLICATION NOTIFICATION
    if (type === 'teacher') {
      emailSubject = `👨‍🏫 New Teacher Application: ${data.full_name || 'Applicant'}`
      
      waMessage = `🔔 *NEW TEACHER APPLICATION - DOUBT FIXER*\n\n` +
        `👤 *Name:* ${data.full_name || 'N/A'}\n` +
        `📞 *Phone:* ${data.phone || 'N/A'}\n` +
        `📧 *Email:* ${data.email || 'N/A'}\n` +
        (data.qualification ? `🎓 *Qualification:* ${data.qualification}\n` : '') +
        `💼 *Experience:* ${data.experience || 'N/A'}\n` +
        (data.area_location ? `📍 *Location:* ${data.area_location}\n` : '') +
        `📚 *Subjects:* ${data.subjects || 'N/A'}\n` +
        (data.resume_link ? `📄 *Resume:* ${data.resume_link}\n` : '') +
        `⏰ *Time:* ${timestamp}`

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #2563eb; margin-top: 0;">👨‍🏫 New Teacher Application Received!</h2>
          <p style="color: #64748b;">A teacher has submitted their application on Doubt Fixer:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 8px; font-weight: bold; color: #334155; width: 35%;">Full Name:</td><td style="padding: 8px; color: #0f172a;">${data.full_name || 'N/A'}</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">Phone:</td><td style="padding: 8px; color: #0f172a;"><a href="tel:${data.phone}">${data.phone || 'N/A'}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #334155;">Email:</td><td style="padding: 8px; color: #0f172a;"><a href="mailto:${data.email}">${data.email || 'N/A'}</a></td></tr>
            ${data.qualification ? `<tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">Qualification:</td><td style="padding: 8px; color: #0f172a;">${data.qualification}</td></tr>` : ''}
            <tr><td style="padding: 8px; font-weight: bold; color: #334155;">Experience:</td><td style="padding: 8px; color: #0f172a;">${data.experience || 'N/A'}</td></tr>
            ${data.area_location ? `<tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">Location:</td><td style="padding: 8px; color: #0f172a;">${data.area_location}</td></tr>` : ''}
            <tr><td style="padding: 8px; font-weight: bold; color: #334155;">Subjects:</td><td style="padding: 8px; color: #0f172a;">${data.subjects || 'N/A'}</td></tr>
            ${data.resume_link ? `<tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">Resume:</td><td style="padding: 8px;"><a href="${data.resume_link}" target="_blank" style="color: #2563eb; font-weight: bold;">View Resume</a></td></tr>` : ''}
          </table>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 10px;">Submitted at ${timestamp} • Doubt Fixer Admin Alerts</p>
        </div>
      `
    }

    // 2. DEMO BOOKING NOTIFICATION
    else if (type === 'demo') {
      emailSubject = `🎓 New Demo Booking: ${data.student_name || 'Student'} (${data.class_name || 'Class'})`

      waMessage = `🎓 *NEW DEMO BOOKING - DOUBT FIXER*\n\n` +
        `👤 *Student:* ${data.student_name || 'N/A'}\n` +
        `👨‍👩‍👦 *Parent:* ${data.parent_name || 'N/A'}\n` +
        `📞 *Phone:* ${data.phone || 'N/A'}\n` +
        (data.whatsapp_number ? `💬 *WhatsApp:* ${data.whatsapp_number}\n` : '') +
        `🏫 *Class:* ${data.class_name || 'N/A'}\n` +
        (data.school_name ? `🏫 *School:* ${data.school_name}\n` : '') +
        `📚 *Subject:* ${data.subject || 'N/A'}\n` +
        (data.preferred_timing ? `⏰ *Timing:* ${data.preferred_timing}\n` : '') +
        (data.area_location ? `📍 *Area:* ${data.area_location}\n` : '') +
        `⏰ *Time:* ${timestamp}`

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #16a34a; margin-top: 0;">🎓 New Demo Class Booked!</h2>
          <p style="color: #64748b;">A student/parent has requested a free demo class:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 8px; font-weight: bold; color: #334155; width: 35%;">Student Name:</td><td style="padding: 8px; color: #0f172a;">${data.student_name || 'N/A'}</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">Parent Name:</td><td style="padding: 8px; color: #0f172a;">${data.parent_name || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #334155;">Phone:</td><td style="padding: 8px; color: #0f172a;"><a href="tel:${data.phone}">${data.phone || 'N/A'}</a></td></tr>
            ${data.whatsapp_number ? `<tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">WhatsApp:</td><td style="padding: 8px; color: #0f172a;">${data.whatsapp_number}</td></tr>` : ''}
            <tr><td style="padding: 8px; font-weight: bold; color: #334155;">Class Level:</td><td style="padding: 8px; color: #0f172a;">${data.class_name || 'N/A'}</td></tr>
            ${data.school_name ? `<tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">School:</td><td style="padding: 8px; color: #0f172a;">${data.school_name}</td></tr>` : ''}
            <tr><td style="padding: 8px; font-weight: bold; color: #334155;">Subject:</td><td style="padding: 8px; color: #0f172a;">${data.subject || 'N/A'}</td></tr>
            ${data.preferred_timing ? `<tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">Preferred Timing:</td><td style="padding: 8px; color: #0f172a;">${data.preferred_timing}</td></tr>` : ''}
            ${data.area_location ? `<tr><td style="padding: 8px; font-weight: bold; color: #334155;">Area / Location:</td><td style="padding: 8px; color: #0f172a;">${data.area_location}</td></tr>` : ''}
          </table>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 10px;">Submitted at ${timestamp} • Doubt Fixer Admin Alerts</p>
        </div>
      `
    }

    // 3. CONTACT FORM NOTIFICATION
    else if (type === 'contact') {
      emailSubject = `💬 New Contact Inquiry: ${data.name || 'Visitor'}`

      waMessage = `💬 *NEW CONTACT INQUIRY - DOUBT FIXER*\n\n` +
        `👤 *Name:* ${data.name || 'N/A'}\n` +
        `📞 *Phone:* ${data.phone || 'N/A'}\n` +
        `📧 *Email:* ${data.email || 'N/A'}\n` +
        `📝 *Message:* ${data.message || 'N/A'}\n` +
        `⏰ *Time:* ${timestamp}`

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #7c3aed; margin-top: 0;">💬 New Contact Inquiry!</h2>
          <p style="color: #64748b;">Someone sent a message from the Doubt Fixer contact form:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 8px; font-weight: bold; color: #334155; width: 35%;">Name:</td><td style="padding: 8px; color: #0f172a;">${data.name || 'N/A'}</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">Phone:</td><td style="padding: 8px; color: #0f172a;"><a href="tel:${data.phone}">${data.phone || 'N/A'}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #334155;">Email:</td><td style="padding: 8px; color: #0f172a;"><a href="mailto:${data.email}">${data.email || 'N/A'}</a></td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">Message:</td><td style="padding: 8px; color: #0f172a;">${data.message || 'N/A'}</td></tr>
          </table>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 10px;">Submitted at ${timestamp} • Doubt Fixer Admin Alerts</p>
        </div>
      `
    }

    // 4. NEW WEBSITE VISITOR NOTIFICATION
    else if (type === 'visit') {
      const location = [data.city, data.region, data.country].filter(Boolean).join(', ') || 'Unknown Location'
      
      emailSubject = `🌐 New Website Visitor from ${location}`

      waMessage = `👀 *NEW VISITOR ON DOUBT FIXER!*\n\n` +
        `📍 *Location:* ${location}\n` +
        `📱 *Device:* ${data.device || 'Desktop / Mobile'} (${data.browser || 'Browser'})\n` +
        `🔗 *Source:* ${data.referrer || 'Direct Visit'}\n` +
        `📄 *Page:* ${data.page || '/'}\n` +
        `⏰ *Time:* ${timestamp}`

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0284c7; margin-top: 0;">🌐 New Website Visitor!</h2>
          <p style="color: #64748b;">Someone just visited your Doubt Fixer website:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 8px; font-weight: bold; color: #334155; width: 35%;">Location:</td><td style="padding: 8px; color: #0f172a;">${location}</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">Device:</td><td style="padding: 8px; color: #0f172a;">${data.device || 'N/A'} (${data.browser || 'N/A'})</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #334155;">Referrer/Source:</td><td style="padding: 8px; color: #0f172a;">${data.referrer || 'Direct Visit'}</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; font-weight: bold; color: #334155;">Page:</td><td style="padding: 8px; color: #0f172a;">${data.page || '/'}</td></tr>
          </table>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 10px;">Visited at ${timestamp} • Doubt Fixer Visitor Analytics</p>
        </div>
      `
    }

    // Trigger both in parallel (non-blocking)
    const [waRes, emailRes] = await Promise.allSettled([
      sendWhatsApp(waMessage),
      sendEmail({ subject: emailSubject, htmlContent: emailHtml })
    ])

    return NextResponse.json({
      success: true,
      whatsapp: waRes.status === 'fulfilled' ? waRes.value : { success: false },
      email: emailRes.status === 'fulfilled' ? emailRes.value : { success: false }
    })
  } catch (err) {
    console.error('[Notification Route Error]:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
