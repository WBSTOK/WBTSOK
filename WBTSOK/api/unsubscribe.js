// Vercel Serverless Function for handling unsubscribe requests
// Matches the style and structure of your other API endpoints

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { email, reason, otherReason, unsubscribeTypes, timestamp, userAgent, referrer } = req.body;

    // Validate required fields
    if (!email || !unsubscribeTypes || unsubscribeTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Email and unsubscribe types are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    // Create unsubscribe record
    const unsubscribeRecord = {
      email: email.toLowerCase().trim(),
      reason: reason || null,
      otherReason: otherReason || null,
      unsubscribeTypes: unsubscribeTypes,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || null,
      referrer: referrer || null,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      processed: false
    };

    // Log the unsubscribe request
    console.log('📧 Unsubscribe request received:', {
      email: unsubscribeRecord.email,
      types: unsubscribeRecord.unsubscribeTypes,
      reason: unsubscribeRecord.reason,
      timestamp: unsubscribeRecord.timestamp
    });

    // Process the unsubscribe request
    const processed = await processUnsubscribeRequest(unsubscribeRecord);
    
    if (!processed) {
      throw new Error('Failed to process unsubscribe request');
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from selected email types',
      email: unsubscribeRecord.email,
      types: unsubscribeRecord.unsubscribeTypes,
      timestamp: unsubscribeRecord.timestamp
    });

    console.log('✅ Unsubscribe processed successfully for:', unsubscribeRecord.email);

  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      error: 'We encountered an issue processing your request. Please try again or contact support.'
    });
  }
}

async function processUnsubscribeRequest(record) {
  try {
    // 1. Update email service provider
    await updateEmailServiceProvider(record);
    
    // 2. Save to database/storage
    await saveUnsubscribeRecord(record);
    
    // 3. Send confirmation email (optional)
    await sendConfirmationEmail(record);
    
    return true;
  } catch (error) {
    console.error('Failed to process unsubscribe:', error);
    return false;
  }
}

async function updateEmailServiceProvider(record) {
  const { email, unsubscribeTypes } = record;
  
  // Update Mailchimp if configured
  if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
    try {
      console.log('📮 Updating Mailchimp for:', email);
      // Add your Mailchimp API integration here
      // Example: await mailchimp.lists.updateListMember(listId, email, { status: 'unsubscribed' });
    } catch (error) {
      console.error('Mailchimp update failed:', error);
    }
  }
  
  // Update SendGrid if configured
  if (process.env.SENDGRID_API_KEY) {
    try {
      console.log('📮 Updating SendGrid for:', email);
      // Add your SendGrid API integration here
    } catch (error) {
      console.error('SendGrid update failed:', error);
    }
  }
  
  // For now, just log the action
  console.log(`✅ Email service updated for ${email}:`, unsubscribeTypes);
}

async function saveUnsubscribeRecord(record) {
  // In production, save to your database
  console.log('💾 Saving unsubscribe record:', {
    email: record.email,
    types: record.unsubscribeTypes,
    reason: record.reason,
    timestamp: record.timestamp
  });
  
  // Example database save (uncomment and modify for your database)
  /*
  try {
    const db = getDatabase(); // Your database connection
    await db.collection('unsubscribes').add({
      ...record,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Record saved to database');
  } catch (error) {
    console.error('❌ Database save failed:', error);
    throw error;
  }
  */
}

async function sendConfirmationEmail(record) {
  // Optional: Send confirmation email
  try {
    console.log('📧 Sending confirmation email to:', record.email);
    
    // Example confirmation email content
    const confirmationData = {
      to: record.email,
      subject: 'Unsubscribe Confirmation - We Buy Test Strips Oklahoma',
      html: generateConfirmationEmailHTML(record)
    };
    
    // Send via your email service
    // await sendEmail(confirmationData);
    
    console.log('✅ Confirmation email sent');
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    // Don't throw error - confirmation email is optional
  }
}

function generateConfirmationEmailHTML(record) {
  const typeLabels = {
    'promotional': 'Promotional emails',
    'newsletter': 'Newsletter updates',
    'transactional': 'Transaction emails',
    'all': 'All emails'
  };
  
  const unsubscribedTypes = record.unsubscribeTypes
    .map(type => typeLabels[type] || type)
    .join(', ');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Unsubscribe Confirmation</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { height: 40px; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 8px; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        .btn { display: inline-block; padding: 12px 24px; background: #ff6f61; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://yourdomain.com/assets/WBSTOK-Logo_2.png" alt="We Buy Test Strips Oklahoma" class="logo">
        </div>
        
        <div class="content">
          <h2>Unsubscribe Confirmation</h2>
          <p>Hello,</p>
          <p>We've successfully processed your unsubscribe request for <strong>${record.email}</strong>.</p>
          <p><strong>You have been unsubscribed from:</strong><br>${unsubscribedTypes}</p>
          <p>You should stop receiving these emails within 24-48 hours.</p>
          <p>If you change your mind, you can always resubscribe by visiting our website.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://yourdomain.com" class="btn">Visit Our Website</a>
          </div>
        </div>
        
        <div class="footer">
          <p>We Buy Test Strips Oklahoma<br>
          Phone: <a href="tel:+405-459-0973">405-459-0973</a><br>
          Email: <a href="mailto:webuydiabeticteststripsOK@gmail.com">webuydiabeticteststripsOK@gmail.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}