// Production-ready Vercel serverless function for creating shipping labels
import shippo from 'shippo';

export default async function handler(req, res) {
  // Enable CORS with proper headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-CSRF-Token, X-Requested-With, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const orderData = req.body;
    
    console.log('📦 Creating shipping label for order:', orderData.orderId);
    
    // Force production mode for live shipping labels
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔐 SHIPPO_API_KEY exists:', !!process.env.SHIPPO_API_KEY);
    console.log('🔐 SHIPPO_TEST_API_KEY exists:', !!process.env.SHIPPO_TEST_API_KEY);
    
    // Always use live API key for real labels
    const apiKey = process.env.SHIPPO_API_KEY;
    console.log('🔑 Using LIVE API key for production labels');
    
    if (!apiKey) {
      console.warn('⚠️ No live Shippo API key found, using mock response');
      return res.status(200).json(getMockResponse(orderData));
    }
    
    // Initialize Shippo with live API key
    const shippoClient = shippo(apiKey);
    
    // Create shipping label with Shippo
    const shippoResponse = await createShippoLabel(shippoClient, orderData);
    
    console.log('✅ Real shipping label created:', shippoResponse.trackingNumber);
    
    res.status(200).json(shippoResponse);
    
  } catch (error) {
    console.error('❌ Shipping label creation failed:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Return error instead of fallback to mock
    res.status(500).json({
      success: false,
      error: 'Shippo API failed',
      details: error.message,
      message: 'Real shipping label creation failed - check server logs'
    });
  }
}

// Real Shippo integration
async function createShippoLabel(shippoClient, orderData) {
  try {
    // Create shipment (prepaid return label)
    const shipment = await shippoClient.shipment.create({
      address_from: {
        name: 'WBTSOK',
        company: 'We Buy Test Strips Oklahoma',
        street1: process.env.RETURN_ADDRESS_STREET || '1316 NW Sheridan Rd PMB 293',
        city: process.env.RETURN_ADDRESS_CITY || 'Lawton',
        state: process.env.RETURN_ADDRESS_STATE || 'OK',
        zip: process.env.RETURN_ADDRESS_ZIP || '73505',
        country: 'US',
        phone: '4054590973'
      },
      address_to: {
        name: orderData.customerName,
        street1: orderData.shippingAddress.street1,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        zip: orderData.shippingAddress.zip,
        country: 'US',
        phone: orderData.phone || '0000000000'
      },
      parcels: [{
        length: '12',
        width: '9',
        height: '4',
        distance_unit: 'in',
        weight: '1',
        mass_unit: 'lb'
      }],
      async: false
    });
    
    // Create transaction (purchase label)
    const transaction = await shippoClient.transaction.create({
      shipment: shipment.object_id,
      carrier_account: process.env.SHIPPO_CARRIER_ACCOUNT,
      servicelevel_token: 'usps_priority'
    });
    
    if (transaction.status === 'SUCCESS') {
      return {
        success: true,
        message: 'Shipping label created successfully',
        orderId: orderData.orderId,
        labelUrl: transaction.label_url,
        trackingNumber: transaction.tracking_number,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
      };
    } else {
      throw new Error(`Shippo transaction failed: ${transaction.messages}`);
    }
    
  } catch (error) {
    console.error('Shippo integration error:', error);
    throw error;
  }
}

// Mock response for development/fallback
function getMockResponse(orderData) {
  return {
    success: true,
    message: 'Shipping label created successfully (DEMO MODE)',
    orderId: orderData.orderId,
    labelUrl: `https://demo.shippo.com/labels/${orderData.orderId}.pdf`,
    trackingNumber: `DEMO${Date.now().toString().slice(-10)}`,
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}
