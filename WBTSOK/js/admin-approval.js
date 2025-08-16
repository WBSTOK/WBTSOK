document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order');
  
  console.log('🔍 Admin Approval Page Loaded');
  console.log('📋 Order ID from URL:', orderId);
  console.log('🌐 Current URL:', window.location.href);
  
  if (orderId) {
    console.log('✅ Order ID found, loading order details...');
    loadOrderForApproval(orderId);
  } else {
    console.error('❌ No order ID found in URL');
    showError('No order ID provided in URL');
  }
  
  document.getElementById('approve-btn').addEventListener('click', () => approveOrder(orderId));
  document.getElementById('reject-btn').addEventListener('click', () => rejectOrder(orderId));
});

function showError(message) {
  const loadingState = document.getElementById('loading-state');
  loadingState.innerHTML = `
    <i class="fas fa-exclamation-triangle" style="color: #dc3545; font-size: 2rem; margin-bottom: 1rem;"></i>
    <h3 style="color: #dc3545;">Error Loading Order</h3>
    <p>${message}</p>
    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2c5aa0; color: white; border: none; border-radius: 4px; cursor: pointer;">
      <i class="fas fa-refresh"></i> Retry
    </button>
  `;
}

function showOrderMismatchOption(requestedId, availableOrder) {
  const loadingState = document.getElementById('loading-state');
  loadingState.innerHTML = `
    <i class="fas fa-exclamation-triangle" style="color: #ffc107; font-size: 2rem; margin-bottom: 1rem;"></i>
    <h3 style="color: #856404;">Order ID Mismatch</h3>
    <p>Looking for order <strong>${requestedId}</strong>, but found recent order <strong>${availableOrder.id}</strong></p>
    <p>Customer: <strong>${availableOrder.firstName} ${availableOrder.lastName}</strong> (${availableOrder.email})</p>
    <p>Amount: <strong>$${availableOrder.total}</strong></p>
    <p>Created: <strong>${new Date(availableOrder.createdAt || availableOrder.timestamp).toLocaleString()}</strong></p>
    <div style="margin-top: 20px;">
      <button onclick="displayOrderDetails(${JSON.stringify(availableOrder).replace(/"/g, '&quot;')})" 
              style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
        <i class="fas fa-check"></i> Use This Order
      </button>
      <button onclick="window.location.reload()" 
              style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
        <i class="fas fa-refresh"></i> Retry
      </button>
    </div>
  `;
}

async function loadOrderForApproval(orderId) {
  try {
    console.log('🔄 Fetching orders from API...');
    const orders = await window.ordersAPI.getOrders();
    console.log('📦 Total orders received:', orders.length);
    console.log('🔍 Looking for order ID:', orderId);
    console.log('📋 Available order IDs:', orders.map(o => o.id));
    
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      console.log('✅ Order found:', order);
      displayOrderDetails(order);
    } else {
      console.error('❌ Order not found in database');
      console.log('🔍 Available orders:', orders);
      
      // If there's only one order and it's recent, offer to use it instead
      if (orders.length === 1) {
        const availableOrder = orders[0];
        const orderAge = new Date() - new Date(availableOrder.createdAt || availableOrder.timestamp);
        const hoursSinceCreated = orderAge / (1000 * 60 * 60);
        
        if (hoursSinceCreated < 24) { // If order is less than 24 hours old
          showOrderMismatchOption(orderId, availableOrder);
          return;
        }
      }
      
      showError(`Order ${orderId} not found in database. Available orders: ${orders.map(o => o.id).join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Failed to load order:', error);
    showError(`API Error: ${error.message}`);
  }
}

function displayOrderDetails(order) {
  const orderDetailsContainer = document.getElementById('order-details');
  const orderDetailsCard = document.getElementById('order-details-card');
  const approvalActions = document.getElementById('approval-actions');
  const loadingState = document.getElementById('loading-state');
  const orderTitle = document.getElementById('order-title');
  
  // Hide loading and show content
  loadingState.style.display = 'none';
  orderDetailsCard.style.display = 'block';
  approvalActions.style.display = 'block';
  
  // Update title
  orderTitle.textContent = `Order #${order.id}`;
  
  orderDetailsContainer.innerHTML = `
    <div class="details-grid">
      <div class="detail-section">
        <h3><i class="fas fa-user"></i> Customer Information</h3>
        <div class="detail-item">
          <div class="detail-label">Full Name</div>
          <div class="detail-value">${order.firstName} ${order.lastName}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Email Address</div>
          <div class="detail-value">${order.email}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Phone Number</div>
          <div class="detail-value">${order.phone || 'Not provided'}</div>
        </div>
      </div>
      
      <div class="detail-section">
        <h3><i class="fas fa-shopping-cart"></i> Order Information</h3>
        <div class="detail-item">
          <div class="detail-label">Order Total</div>
          <div class="detail-value" style="font-size: 1.2rem; font-weight: 600; color: #28a745;">$${order.total}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Current Status</div>
          <div class="detail-value">
            <span class="status-badge status-confirmed">${order.status}</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Order Date</div>
          <div class="detail-value">${new Date(order.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <h3><i class="fas fa-list"></i> Order Items</h3>
      ${order.items && order.items.length > 0 ? order.items.map(item => `
        <div class="detail-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; margin-bottom: 0.5rem;">
          <div>
            <div class="detail-value" style="font-weight: 600;">${item.name || 'Test Strips'}</div>
            <div style="color: #666; font-size: 0.9rem;">Quantity: ${item.quantity || 5}</div>
          </div>
          <div class="detail-value" style="font-weight: 600; color: #28a745;">$${item.price || item.total || (order.total / (order.items.length || 1)).toFixed(2)}</div>
        </div>
      `).join('') : `
        <div class="detail-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px;">
          <div>
            <div class="detail-value" style="font-weight: 600;">Omnipod Test Strips</div>
            <div style="color: #666; font-size: 0.9rem;">Quantity: 5</div>
          </div>
          <div class="detail-value" style="font-weight: 600; color: #28a745;">$${order.total}</div>
        </div>
      `}
    </div>
    
    <div class="photos-section">
      <h3>
        <i class="fas fa-camera"></i> 
        Uploaded Photos 
        <span class="photo-count">${order.photos ? order.photos.length : 0}</span>
      </h3>
      <p style="margin: 0 0 1rem 0; color: #666;">
        ${order.photos && order.photos.length > 0 ? 
          `Customer uploaded ${order.photos.length} photo(s) for verification.` : 
          'No photos uploaded for this order.'
        }
      </p>
      
      ${order.photos && order.photos.length > 0 ? `
        <div class="photos-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
          ${order.photos.map((photo, index) => `
            <div class="photo-item" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 0.5rem; background: white;">
              ${photo.dataUrl ? `
                <img src="${photo.dataUrl}" alt="Order photo ${index + 1}" 
                     style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; cursor: pointer;"
                     onclick="openPhotoModal('${photo.dataUrl}', '${photo.name || `Photo ${index + 1}`}')">
              ` : `
                <div style="width: 100%; height: 120px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #666;">
                  <i class="fas fa-image" style="font-size: 2rem;"></i>
                </div>
              `}
              <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #666; text-align: center;">
                <div style="font-weight: 500;">${photo.name || `Photo ${index + 1}`}</div>
                <div>${(photo.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    
    <!-- Photo Modal -->
    <div id="photo-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; justify-content: center; align-items: center;" onclick="closePhotoModal()">
      <div style="max-width: 90vw; max-height: 90vh; position: relative;">
        <img id="modal-photo" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        <button onclick="closePhotoModal()" style="position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 2rem; cursor: pointer;">
          <i class="fas fa-times"></i>
        </button>
        <div id="modal-photo-title" style="position: absolute; bottom: -40px; left: 0; color: white; font-size: 1rem;"></div>
      </div>
    </div>
  `;
}

async function approveOrder(orderId) {
  if (confirm('Are you sure you want to approve this order?')) {
    try {
      // Update order status to 'processing' first
      await updateOrderStatus(orderId, 'processing');
      
      // Get the updated order details
      const orders = await window.ordersAPI.getOrders();
      const order = orders.find(o => o.id === orderId);
      
      if (order) {
        // Create shipping label
        const shippingResult = await createShippingLabel(order);
        
        // Update status to 'approved' after shipping label is created
        await updateOrderStatus(orderId, 'approved');
        
        // Send approval email with shipping instructions
        if (window.emailService && shippingResult.success) {
          try {
            await window.emailService.sendOrderApproval(order, {
              trackingNumber: shippingResult.trackingNumber,
              labelUrl: shippingResult.labelUrl
            });
            console.log('✅ Order approval email sent to customer');
          } catch (emailError) {
            console.error('❌ Failed to send approval email:', emailError);
            // Don't fail the approval process if email fails
          }
        }
      }
      
      alert('Order approved, shipping label created, and customer notified with packing instructions!');
      window.close();
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order. Please try again.');
    }
  }
}

async function rejectOrder(orderId) {
  const reason = prompt('Please provide a reason for rejection:');
  if (reason) {
    try {
      // Update order status
      await updateOrderStatus(orderId, 'rejected', reason);
      
      alert('Order rejected. Customer will be notified.');
      window.close();
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    }
  }
}

async function updateOrderStatus(orderId, status, reason = null) {
  try {
    const updates = {
      status: status,
      updatedAt: new Date().toISOString()
    };
    
    if (reason) {
      updates.rejectionReason = reason;
    }
    
    // Update order in database
    const result = await window.ordersAPI.updateOrder(orderId, updates);
    
    if (result.success) {
      // Send notification email to customer
      sendCustomerNotification(result.order, status, reason);
    } else {
      console.error('Failed to update order status');
      alert('Failed to update order status. Please try again.');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    alert('Error updating order status. Please try again.');
  }
}

async function createShippingLabel(order) {
  try {
    console.log('Creating shipping label for order:', order.id);
    
    // Validate required fields for shipping
    if (!order.firstName || !order.lastName) {
      throw new Error('Customer name is missing');
    }
    if (!order.address || !order.city || !order.state || !order.zip) {
      throw new Error('Shipping address is incomplete');
    }
    
    const response = await fetch(`${window.ordersAPI.baseURL}/api/create-shipping-label-direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: order.id,
        customerName: `${order.firstName} ${order.lastName}`,
        customerEmail: order.email,
        phone: order.phone || '0000000000',
        shippingAddress: {
          street1: order.address,
          city: order.city,
          state: order.state,
          zip: order.zip
        },
        orderItems: order.items || [{
          name: 'Test Strips',
          quantity: 5,
          price: order.total
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorData}`);
    }

    const result = await response.json();
    console.log('✅ Shipping label created successfully:', result);
    return result;

  } catch (error) {
    console.error('❌ Error creating shipping label:', error);
    throw error;
  }
}

async function sendCustomerNotification(order, status, reason = null) {
  try {
    console.log('Sending customer notification:', { orderId: order.id, status, reason });
    
    if (window.emailService) {
      const userData = {
        fullname: `${order.firstName} ${order.lastName}`,
        email: order.email
      };
      
      // Prepare email data based on status
      let emailData = {
        to_name: userData.fullname,
        to_email: userData.email,
        order_id: order.id,
        order_total: order.total,
        order_date: new Date(order.createdAt).toLocaleDateString(),
        company_name: 'We Buy Test Strips Oklahoma'
      };
      
      let templateId = '';
      
      if (status === 'approved') {
        templateId = 'template_order_confirmation'; // Use existing template
        emailData.status_message = 'Your order has been approved! You will receive a shipping label shortly.';
        emailData.status_color = '#28a745';
      } else if (status === 'rejected') {
        templateId = 'template_order_confirmation'; // Use existing template but customize
        emailData.status_message = `Your order has been rejected. Reason: ${reason || 'No reason provided'}`;
        emailData.status_color = '#dc3545';
        emailData.rejection_reason = reason || 'No reason provided';
      }
      
      // Send email using EmailJS
      if (window.emailService.serviceId && templateId) {
        const response = await emailjs.send(
          window.emailService.serviceId,
          templateId,
          emailData,
          window.emailService.publicKey
        );
        
        console.log('✅ Customer notification sent successfully:', response);
      } else {
        console.log('📧 Customer notification (EmailJS not configured):', emailData);
      }
    }
  } catch (error) {
    console.error('❌ Error sending customer notification:', error);
  }
}

// Photo modal functions
function openPhotoModal(imageUrl, title) {
  const modal = document.getElementById('photo-modal');
  const modalPhoto = document.getElementById('modal-photo');
  const modalTitle = document.getElementById('modal-photo-title');
  
  modalPhoto.src = imageUrl;
  modalTitle.textContent = title;
  modal.style.display = 'flex';
}

function closePhotoModal() {
  const modal = document.getElementById('photo-modal');
  modal.style.display = 'none';
}

// Close modal when pressing Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closePhotoModal();
  }
});