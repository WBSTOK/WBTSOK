const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Set CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://wbstok.com',
    'https://www.wbstok.com'
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // During development, you might want to keep this fallback
    // Remove in production if you want strict domain control
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get the Google Apps Script URL from environment variable
    const targetUrl = process.env.APPS_SCRIPT_URL;
    
    if (!targetUrl) {
      return res.status(500).json({ error: 'Target URL not configured' });
    }
    
    // Forward the request to Google Apps Script
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    // Get the response from Google Apps Script
    const data = await response.json();
    
    // Return the response to the client
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Proxy request failed' });
  }
};
