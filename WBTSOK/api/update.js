import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  // Enable CORS with proper headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS, POST, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, updates } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Initialize Redis client
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });

    // Get existing order
    const existingOrder = await redis.get(`order:${orderId}`);
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order
    const updatedOrder = {
      ...existingOrder,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Save updated order
    await redis.set(`order:${orderId}`, updatedOrder);

    res.status(200).json({ 
      success: true, 
      order: updatedOrder,
      message: 'Order updated successfully' 
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      error: 'Failed to update order',
      details: error.message 
    });
  }
}
