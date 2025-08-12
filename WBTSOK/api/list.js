import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  // Enable CORS with proper headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Redis client
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });

    // Get list of order IDs
    const orderIds = await redis.lrange('orders:list', 0, -1);
    
    // Get all orders
    const orders = [];
    for (const orderId of orderIds) {
      const order = await redis.get(`order:${orderId}`);
      if (order) {
        orders.push(order);
      }
    }

    // Sort by timestamp (newest first)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({ success: true, orders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      details: error.message 
    });
  }
}
