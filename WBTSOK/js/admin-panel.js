document.addEventListener('DOMContentLoaded', function() {
  loadAdminStats();
  loadPendingOrders();
  
  // Refresh data every 30 seconds
  setInterval(loadPendingOrders, 30000);
});

async function loadAdminStats() {
  try {
    const orders = await window.ordersAPI.getOrders();
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'confirmed' || order.status === 'pending_approval').length;
    const approvedOrders = orders.filter(order => order.status === 'approved').length;
    const completedOrders = orders.filter(order => order.status === 'delivered' || order.status === 'completed').length;
    
    // Update stats
    document.getElementById('total-orders-stat').textContent = totalOrders;
    document.getElementById('pending-orders-stat').textContent = pendingOrders;
    document.getElementById('approved-orders-stat').textContent = approvedOrders;
    document.getElementById('completed-orders-stat').textContent = completedOrders;
  } catch (error) {
    console.error('Failed to load admin stats:', error);
  }
}

async function loadPendingOrders() {
  try {
    const orders = await window.ordersAPI.getOrders();
    console.log('All orders loaded:', orders);
    console.log('Order statuses:', orders.map(o => ({id: o.id, status: o.status})));
    
    const pendingOrders = orders.filter(order => 
      order.status === 'confirmed' || order.status === 'pending_approval'
    );
    console.log('Pending orders:', pendingOrders);
  
    const pendingOrdersList = document.getElementById('pending-orders-list');
    
    if (pendingOrders.length === 0) {
      pendingOrdersList.innerHTML = `
        <tr>
          <td colspan="7" class="no-orders">
            <i class="fas fa-check-circle" style="font-size: 2rem; color: #28a745; margin-bottom: 1rem;"></i>
            <div>No orders pending approval</div>
            <div style="font-size: 0.9rem; margin-top: 0.5rem;">All caught up! 🎉</div>
          </td>
        </tr>
      `;
      return;
    }
  
  pendingOrdersList.innerHTML = pendingOrders.map(order => `
    <tr>
      <td><strong>${order.id}</strong></td>
      <td>${order.firstName} ${order.lastName}</td>
      <td>${order.email}</td>
      <td>$${order.total}</td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      <td><span class="status-badge status-${order.status}">${getStatusDisplay(order.status)}</span></td>
      <td>
        <a href="admin-approval.html?order=${order.id}" class="action-btn approve" target="_blank">
          <i class="fas fa-eye"></i> Review
        </a>
      </td>
    </tr>
  `).join('');
  
    // Update stats after loading orders
    loadAdminStats();
  } catch (error) {
    console.error('Failed to load pending orders:', error);
    const pendingOrdersList = document.getElementById('pending-orders-list');
    pendingOrdersList.innerHTML = `
      <tr>
        <td colspan="7" class="no-orders">
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 1rem;"></i>
          <div>Error loading orders</div>
          <div style="font-size: 0.9rem; margin-top: 0.5rem;">Please refresh the page</div>
        </td>
      </tr>
    `;
  }
}

function getStatusDisplay(status) {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'pending_approval':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'completed':
      return 'Completed';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
      return 'Cancelled';
    case 'denied':
      return 'Denied';
    default:
      return 'Unknown';
  }
}

// Listen for storage changes to update the panel in real-time
window.addEventListener('storage', function(e) {
  if (e.key === 'orders') {
    loadAdminStats();
    loadPendingOrders();
  }
});
