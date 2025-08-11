// Vercel serverless function for sending verification emails
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, fullname, verificationCode, type } = req.body;

    if (!to || !fullname || !verificationCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const RESEND_API_KEY = 're_dNaFhCwn_DNdFPdBzoW3VsKpvJQg9zVEN';
    const FROM_EMAIL = 'info@webuyteststripsoklahoma.com';

    let subject, html;

    if (type === 'welcome') {
      subject = 'Welcome to We Buy Test Strips Oklahoma - Your Account is Ready!';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #27ae60; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to We Buy Test Strips Oklahoma!</h1>
              <p style="color: #a8e6cf; margin: 10px 0 0 0; font-size: 16px;">Your account is now active</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hi ${fullname},</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Congratulations! Your email has been successfully verified and your We Buy Test Strips Oklahoma account is now active.
              </p>
            </div>
          </div>
        </div>
      `;
    } else {
      subject = 'Verify Your Email - We Buy Test Strips Oklahoma';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #2c5aa0; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">We Buy Test Strips Oklahoma</h1>
              <p style="color: #e3f2fd; margin: 10px 0 0 0; font-size: 16px;">Verify Your Email Address</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hi ${fullname},</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Welcome to We Buy Test Strips Oklahoma! Please verify your email address with the code below.
              </p>
              <div style="background-color: #f8f9fa; border: 2px dashed #2c5aa0; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
                <p style="color: #333; font-size: 16px; margin: 0 0 10px 0; font-weight: bold;">Your Verification Code:</p>
                <div style="background-color: #2c5aa0; color: white; font-size: 32px; font-weight: bold; padding: 15px 25px; border-radius: 6px; letter-spacing: 3px; display: inline-block;">
                  ${verificationCode}
                </div>
                <p style="color: #666; font-size: 14px; margin: 15px 0 0 0;">
                  Enter this code on the verification page
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: to,
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      return res.status(response.status).json({ error: 'Failed to send email', details: errorData });
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    
    return res.status(200).json({ success: true, messageId: result.id });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
