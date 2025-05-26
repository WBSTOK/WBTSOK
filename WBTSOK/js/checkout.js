document.addEventListener('DOMContentLoaded', function() {
  // Initialize checkout page
  initCheckout();
  
  // Set up event listeners
  setupEventListeners();
});

function initCheckout() {
  // Load cart items
  loadCartItems();
  
  // Calculate and display totals
  updateOrderSummary();
  
  // Generate a random order number for the confirmation page
  document.getElementById('confirmation-order-number').textContent = generateOrderNumber();
}

function setupEventListeners() {
  // Next step buttons
  const nextButtons = document.querySelectorAll('.next-step');
  nextButtons.forEach(button => {
    button.addEventListener('click', function() {
      const nextStep = this.getAttribute('data-next');
      goToStep(nextStep);
    });
  });
  
  // Previous step buttons
  const prevButtons = document.querySelectorAll('.prev-step');
  prevButtons.forEach(button => {
    button.addEventListener('click', function() {
      const prevStep = this.getAttribute('data-prev');
      goToStep(prevStep);
    });
  });
  
  // Payment method selection
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  paymentMethods.forEach(method => {
    method.addEventListener('change', function() {
      updatePaymentDetails(this.value);
    });
  });
  
  // Complete order button
  const completeOrderBtn = document.getElementById('complete-order-btn');
  if (completeOrderBtn) {
    completeOrderBtn.addEventListener('click', function(e) {
      // Check if terms are agreed
      const termsCheckbox = document.getElementById('termsAgree');
      if (!termsCheckbox.checked) {
        e.preventDefault();
        showMessage('Please agree to the Terms of Service and Privacy Policy', 'error');
        return;
      }
      
      // Validate payment details
      const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;
      if (selectedPayment === 'paypal') {
        const paypalEmail = document.getElementById('paypalEmail').value;
        if (!paypalEmail) {
          e.preventDefault();
          showMessage('Please enter your PayPal email address', 'error');
          return;
        }
      } else if (selectedPayment === 'venmo') {
        const venmoUsername = document.getElementById('venmoUsername').value;
        if (!venmoUsername) {
          e.preventDefault();
          showMessage('Please enter your Venmo username', 'error');
          return;
        }
      } else if (selectedPayment === 'zelle') {
        const zelleEmail = document.getElementById('zelleEmail').value;
        if (!zelleEmail) {
          e.preventDefault();
          showMessage('Please enter your Zelle email or phone number', 'error');
          return;
        }
      }
      
      // Set confirmation email
      const emailInput = document.getElementById('email');
      if (emailInput) {
        document.getElementById('confirmation-email').textContent = emailInput.value;
      }
      
      // Process the order
      processOrder();
    });
  }
}

function goToStep(stepNumber) {
  // Hide all steps
  const allSteps = document.querySelectorAll('.checkout-step');
  allSteps.forEach(step => {
    step.classList.remove('active');
  });
  
  // Show the target step
  const targetStep = document.getElementById(`step-${stepNumber}`);
  if (targetStep) {
    targetStep.classList.add('active');
  }
  
  // Update progress indicators
  updateProgressIndicators(stepNumber);
  
  // Scroll to top of the form
  window.scrollTo({
    top: document.querySelector('.checkout-progress').offsetTop - 100,
    behavior: 'smooth'
  });
}

function updateProgressIndicators(currentStep) {
  const steps = document.querySelectorAll('.progress-step');
  const connectors = document.querySelectorAll('.progress-connector');
  
  steps.forEach((step, index) => {
    // Convert to 1-based index to match step numbers
    const stepNum = index + 1;
    
    if (stepNum < currentStep) {
      // Previous steps are completed
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (stepNum == currentStep) {
      // Current step is active
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      // Future steps are neither active nor completed
      step.classList.remove('active');
      step.classList.remove('completed');
    }
  });
  
  // Update connectors
  connectors.forEach((connector, index) => {
    if (index < currentStep - 1) {
      connector.classList.add('active');
    } else {
      connector.classList.remove('active');
    }
  });
}

function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const orderItemsContainer = document.querySelector('.order-items');
  
  if (!orderItemsContainer) return;
  
  // Clear container
  orderItemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    // Show empty cart message
    orderItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty. <a href="sell.html">Add items to sell</a>.</p>';
    return;
  }
  
  // Add each item to the order summary
  cart.forEach(item => {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    
    // Get image path (use stored path or default to placeholder)
    let imagePath = item.imagePath || 'assets/Shopping_Cart_Icon_PNG_Clipart.png';
    
    orderItem.innerHTML = `
      <img src="${imagePath}" 
           alt="${item.name}"
           class="order-item-image"
           onerror="this.src='assets/Shopping_Cart_Icon_PNG_Clipart.png'">
      <div class="order-item-details">
        <div class="order-item-title">${item.name}</div>
        <div class="order-item-price">$${item.price.toFixed(2)}</div>
        <div class="order-item-quantity">Quantity: ${item.quantity}</div>
      </div>
    `;
    
    orderItemsContainer.appendChild(orderItem);
  });
}

function updateOrderSummary() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Update subtotal and total
  document.getElementById('subtotal-amount').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('total-amount').textContent = `$${subtotal.toFixed(2)}`;
}

function updatePaymentDetails(paymentMethod) {
  // Hide all payment details sections
  document.querySelectorAll('.payment-details').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show the selected payment method details
  const selectedDetails = document.getElementById(`${paymentMethod}-details`);
  if (selectedDetails) {
    selectedDetails.style.display = 'block';
  }
}

function processOrder() {
  // Show loading indicator
  const completeOrderBtn = document.getElementById('complete-order-btn');
  completeOrderBtn.disabled = true;
  completeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  
  // Get form data
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const zip = document.getElementById('zip').value;
  
  // Get payment method
  const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;
  let paymentDetails = {};
  
  if (selectedPayment === 'paypal') {
    paymentDetails.paypalEmail = document.getElementById('paypalEmail').value;
  } else if (selectedPayment === 'venmo') {
    paymentDetails.venmoUsername = document.getElementById('venmoUsername').value;
  } else if (selectedPayment === 'zelle') {
    paymentDetails.zelleEmail = document.getElementById('zelleEmail').value;
  }
  
  // Create order data
  const orderData = {
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    zip,
    paymentMethod: selectedPayment,
    paymentDetails,
    items: JSON.parse(localStorage.getItem('cart')) || []
  };
  
  // Send to backend
  fetch('http://localhost:3000/api/create-shipping-label', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
  .then(response => response.json())
  .then(data => {
    // Reset button state
    completeOrderBtn.disabled = false;
    completeOrderBtn.innerHTML = 'Complete Order';
    
    if (data.success) {
      // Clear the cart
      localStorage.setItem('cart', JSON.stringify([]));
      
      // Update cart count
      updateCartCount();
      
      // Show success message
      showMessage('Order placed successfully! Check your email for the shipping label.', 'success');
      
      // Update confirmation email display
      document.getElementById('confirmation-email').textContent = email;
      
      // Go to confirmation step
      goToStep(4);
      
      // Update confirmation page with tracking number if available
      if (data.tracking_number) {
        const trackingElement = document.createElement('div');
        trackingElement.className = 'tracking-info';
        trackingElement.innerHTML = `<p>Tracking Number: <strong>${data.tracking_number}</strong></p>`;
        document.querySelector('.confirmation-message').appendChild(trackingElement);
      }
    } else {
      showMessage('There was an error processing your order. Please try again.', 'error');
    }
  })
  .catch(error => {
    // Reset button state
    completeOrderBtn.disabled = false;
    completeOrderBtn.innerHTML = 'Complete Order';
    
    console.error('Error:', error);
    showMessage('There was an error processing your order. Please try again.', 'error');
  });
}

function generateOrderNumber() {
  // Generate a random order number
  const prefix = 'WB';
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

// This function assumes you have the showMessage function from your script.js
// If not, uncomment this implementation
/*
function showMessage(message, type = 'success') {
  const messageElement = document.createElement('div');
  messageElement.className = `message message-${type}`;
  messageElement.textContent = message;
  
  // Style the message
  messageElement.style.position = 'fixed';
  messageElement.style.top = '20px';
  messageElement.style.left = '50%';
  messageElement.style.transform = 'translateX(-50%)';
  messageElement.style.padding = '10px 20px';
  messageElement.style.borderRadius = '5px';
  messageElement.style.zIndex = '1000';
  messageElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  messageElement.style.opacity = '0';
  messageElement.style.transition = 'all 0.3s ease';
  
  // Set color based on message type
  switch(type) {
    case 'success':
      messageElement.style.backgroundColor = '#4CAF50';
      messageElement.style.color = 'white';
      break;
    case 'info':
      messageElement.style.backgroundColor = '#2196F3';
      messageElement.style.color = 'white';
      break;
    case 'warning':
      messageElement.style.backgroundColor = '#ff9800';
      messageElement.style.color = 'white';
      break;
    case 'error':
      messageElement.style.backgroundColor = '#f44336';
      messageElement.style.color = 'white';
      break;
  }
  
  document.body.appendChild(messageElement);
  
  // Animate in
  setTimeout(() => {
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateX(-50%) translateY(-20px)';
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      messageElement.remove();
    }, 300);
  }, 3000);
}
*/