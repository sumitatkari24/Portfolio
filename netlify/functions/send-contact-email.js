// Accept multiple possible environment variable names (users may store keys under different names)
const SENDGRID_API = process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEYS || process.env.SENDGRID_API_KEY_0 || process.env.NETLIFY_EMAILS_PROVIDER_API_KEY || process.env.NETLIFY_EMAILS_SECRET || process.env.SENDGRID_API;
const TO_EMAIL = process.env.TO_EMAIL || process.env.TO_EMAIL_VALUE || process.env.TO_EMAILS || 'sumitatkari24@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.FROM_EMAIL_VALUE || process.env.FROM_EMAILS || 'no-reply@portfolio.example';

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!SENDGRID_API) {
    const tried = [
      'SENDGRID_API_KEY', 'SENDGRID_API_KEYS', 'SENDGRID_API_KEY_0', 'NETLIFY_EMAILS_PROVIDER_API_KEY', 'NETLIFY_EMAILS_SECRET', 'SENDGRID_API'
    ];
    console.error('SendGrid API key not found. Checked env:', tried.map(k=>({[k]: !!process.env[k]})));
    return { statusCode: 500, body: 'SendGrid API key not configured. Checked env vars: ' + tried.join(', ') };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const name = data.name || 'No name';
    const email = data.email || 'no-reply@example.com';
    const subject = data.subject || '(no subject)';
    const message = data.message || '';

    const sgBody = {
      personalizations: [{ to: [{ email: TO_EMAIL }] }],
      from: { email: FROM_EMAIL },
      reply_to: { email: email },
      subject: `Portfolio Contact: ${subject}`,
      content: [
        {
          type: 'text/plain',
          value: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
        }
      ]
    };

    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sgBody)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return { statusCode: 502, body: `SendGrid error: ${txt}` };
    }

    return { statusCode: 200, body: 'Email sent' };
  } catch (err) {
    return { statusCode: 500, body: String(err) };
  }
};
