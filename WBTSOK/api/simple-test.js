export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('🚀 Simple test function invoked');
    
    res.status(200).json({
      success: true,
      message: 'Simple test function works!',
      timestamp: new Date().toISOString(),
      method: req.method,
      hasShippoKey: !!process.env.SHIPPO_API_KEY
    });
    
  } catch (error) {
    console.error('❌ Simple test failed:', error);
    res.status(500).json({
      error: error.message
    });
  }
}
