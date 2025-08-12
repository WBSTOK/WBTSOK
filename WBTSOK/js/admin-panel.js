let currentView = 'pending'; // 'pending' or 'all'

document.addEventListener('DOMContentLoaded', function() {
  loadAdminStats();
  loadPendingOrders();
  
  // Set up event listeners
  setupEventListeners();
  
  // Refresh data every 30 seconds
  setInterval(() => {
    if (currentView === 'pending') {
      loadPendingOrders();
    } else {
      loadAllOrders();
    }
  }, 30000);
});

function setupEventListeners() {
  // View all orders button
  document.getElementById('view-all-orders-btn').addEventListener('click', function() {
    currentView = 'all';
    loadAllOrders();
    updateViewButtons();
  });

  // Show pending only button
  document.getElementById('show-pending-btn').addEventListener('click', function() {
    currentView = 'pending';
    loadPendingOrders();
    updateViewButtons();
  });

  // Clear history button
  document.getElementById('clear-history-btn').addEventListener('click', function() {
    showClearHistoryConfirmation();
  });
}

function updateViewButtons() {
  const viewAllBtn = document.getElementById('view-all-orders-btn');
  const showPendingBtn = document.getElementById('show-pending-btn');
  const sectionTitle = document.getElementById('orders-section-title');

  if (currentView === 'all') {
    viewAllBtn.style.display = 'none';
    showPendingBtn.style.display = 'inline-flex';
    sectionTitle.textContent = 'All Orders';
  } else {
    viewAllBtn.style.display = 'inline-flex';
    showPendingBtn.style.display = 'none';
    sectionTitle.textContent = 'Orders Requiring Approval';
  }
}

async function loadAdminStats() {
  try {
    const orders = await window.ordersAPI.getOrders();
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'confirmed' || order.status === 'pending_approval' || order.status === 'processing').length;
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
      order.status === 'confirmed' || 
      order.status === 'pending_approval' || 
      order.status === 'processing'
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

async function loadAllOrders() {
  try {
    const orders = await window.ordersAPI.getOrders();
    console.log('All orders loaded:', orders);
    
    const pendingOrdersList = document.getElementById('pending-orders-list');
    
    if (orders.length === 0) {
      pendingOrdersList.innerHTML = `
        <tr>
          <td colspan="7" class="no-orders">
            <i class="fas fa-inbox" style="font-size: 2rem; color: #666; margin-bottom: 1rem;"></i>
            <div>No orders found</div>
            <div style="font-size: 0.9rem; margin-top: 0.5rem;">Order history is empty</div>
          </td>
        </tr>
      `;
      return;
    }
    
    pendingOrdersList.innerHTML = orders.map(order => `
      <tr>
        <td><strong>${order.id}</strong></td>
        <td>${order.firstName} ${order.lastName}</td>
        <td>${order.email}</td>
        <td>$${order.total}</td>
        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
        <td><span class="status-badge status-${order.status}">${getStatusDisplay(order.status)}</span></td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            <a href="admin-approval.html?order=${order.id}" class="action-btn approve" target="_blank">
              <i class="fas fa-eye"></i> View
            </a>
            <button onclick="deleteOrder('${order.id}')" class="action-btn" style="background: #dc3545; color: white;">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    // Update stats after loading orders
    loadAdminStats();
  } catch (error) {
    console.error('Failed to load all orders:', error);
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

async function deleteOrder(orderId) {
  if (confirm(`Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
    try {
      await window.ordersAPI.deleteOrder(orderId);
      
      // Refresh the current view
      if (currentView === 'pending') {
        loadPendingOrders();
      } else {
        loadAllOrders();
      }
      
      // Show success message
      showMessage(`Order ${orderId} deleted successfully`, 'success');
      
    } catch (error) {
      console.error('Failed to delete order:', error);
      showMessage('Failed to delete order. Please try again.', 'error');
    }
  }
}

function showClearHistoryConfirmation() {
  const confirmation = confirm(
    '⚠️ WARNING: This will permanently delete ALL order history from the database.\n\n' +
    'This action cannot be undone and will remove:\n' +
    '• All customer orders\n' +
    '• All order data and photos\n' +
    '• All shipping information\n\n' +
    'Are you absolutely sure you want to continue?'
  );
  
  if (confirmation) {
    const doubleConfirmation = confirm(
      'This is your final warning!\n\n' +
      'Type "DELETE ALL" in the next dialog to confirm you want to delete all order history.'
    );
    
    if (doubleConfirmation) {
      const finalConfirmation = prompt(
        'Type "DELETE ALL" (exactly as shown) to confirm deletion of all order history:'
      );
      
      if (finalConfirmation === 'DELETE ALL') {
        clearAllOrderHistory();
      } else {
        showMessage('Deletion cancelled - incorrect confirmation text', 'info');
      }
    }
  }
}

async function clearAllOrderHistory() {
  try {
    showMessage('Clearing all order history...', 'info');
    
    const result = await window.ordersAPI.clearAllOrders();
    
    // Refresh the current view
    if (currentView === 'pending') {
      loadPendingOrders();
    } else {
      loadAllOrders();
    }
    
    showMessage(`Successfully cleared ${result.deletedCount} orders from history`, 'success');
    
  } catch (error) {
    console.error('Failed to clear order history:', error);
    showMessage('Failed to clear order history. Please try again.', 'error');
  }
}

function showMessage(message, type) {
  // Create a toast message
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transform: translateX(400px);
    transition: transform 0.3s ease;
  `;
  
  switch (type) {
    case 'success':
      toast.style.background = '#28a745';
      break;
    case 'error':
      toast.style.background = '#dc3545';
      break;
    case 'info':
      toast.style.background = '#17a2b8';
      break;
    default:
      toast.style.background = '#6c757d';
  }
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Listen for storage changes to update the panel in real-time
window.addEventListener('storage', function(e) {
  if (e.key === 'orders') {
    loadAdminStats();
    if (currentView === 'pending') {
      loadPendingOrders();
    } else {
      loadAllOrders();
    }
  }
});
