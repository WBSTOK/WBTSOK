// Orders API utility for Vercel KV integration

class OrdersAPI {
  constructor() {
    // Use environment-based URLs
    this.baseURL = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : window.location.origin;
  }

  async createOrder(orderData) {
    try {
      const response = await fetch(`${this.baseURL}/api/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Order saved to database:', result);
      return result;

    } catch (error) {
      console.error('❌ Failed to save order to database:', error);
      // Fall back to localStorage as backup
      this.saveToLocalStorage(orderData);
      throw error;
    }
  }

  async getOrders() {
    try {
      const response = await fetch(`${this.baseURL}/api/list`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.orders || [];

    } catch (error) {
      console.error('❌ Failed to fetch orders from database:', error);
      // Fall back to localStorage
      return this.getFromLocalStorage();
    }
  }

  async updateOrder(orderId, updates) {
    try {
      const response = await fetch(`${this.baseURL}/api/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, updates })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Order updated in database:', result);
      return result;

    } catch (error) {
      console.error('❌ Failed to update order in database:', error);
      throw error;
    }
  }

  // Fallback methods for localStorage
  saveToLocalStorage(orderData) {
    try {
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      console.log('📝 Order saved to localStorage as backup');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  getFromLocalStorage() {
    try {
      return JSON.parse(localStorage.getItem('orders') || '[]');
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return [];
    }
  }
}

// Create global instance
window.ordersAPI = new OrdersAPI();
