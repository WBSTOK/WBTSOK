import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  // Enable CORS with proper headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const orderData = req.body;
    
    // Add timestamp if not present
    if (!orderData.timestamp) {
      orderData.timestamp = new Date().toISOString();
    }

    // Initialize Redis client
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });

    // Store order in KV with order ID as key
    await redis.set(`order:${orderData.id}`, orderData);
    
    // Also add to orders list for easy retrieval
    await redis.lpush('orders:list', orderData.id);

    console.log('Order saved to KV:', orderData.id);
    
    res.status(200).json({ 
      success: true, 
      orderId: orderData.id,
      message: 'Order saved successfully' 
    });

  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ 
      error: 'Failed to save order',
      details: error.message 
    });
  }
}
