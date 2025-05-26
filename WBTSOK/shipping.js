// Shipping API Integration
const SHIPPING_API_URL = 'https://wbtsok-server.herokuapp.com/api';

/**
 * Creates a shipping label through the server API
 * @param {Object} customerData - Customer and order information
 * @returns {Promise<Object>} - API response
 */
async function createShippingLabel(customerData) {
  try {
    console.log('Sending shipping request:', customerData);
    
    const response = await fetch(`${SHIPPING_API_URL}/create-shipping-label`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Shipping API response:', result);
    
    return result;
  } catch (error) {
    console.error('Error creating shipping label:', error);
    return {
      success: false,
      message: 'Failed to create shipping label',
      error: error.message
    };
  }
}

/**
 * Handles the checkout form submission
 * @param {Event} event - Form submission event
 */
async function handleCheckoutSubmit(event) {
  event.preventDefault();
  
  // Show loading state
  const submitButton = document.getElementById('checkout-submit');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Processing...';
  
  // Get form data
  const form = event.target;
  const formData = new FormData(form);
  
  // Get cart items from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Validate cart
  if (cart.length === 0) {
    showMessage('Your cart is empty. Please add items before checkout.', 'error');
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    return;
  }
  
  // Get payment method
  const paymentMethod = formData.get('paymentMethod');
  
  // Validate payment details based on method
  let paymentDetails = {};
  let paymentValid = false;
  
  switch (paymentMethod) {
    case 'paypal':
      const paypalEmail = formData.get('paypalEmail');
      if (paypalEmail) {
        paymentDetails.paypalEmail = paypalEmail;
        paymentValid = true;
      }
      break;
    case 'venmo':
      const venmoUsername = formData.get('venmoUsername');
      if (venmoUsername) {
        paymentDetails.venmoUsername = venmoUsername;
        paymentValid = true;
      }
      break;
    case 'zelle':
      const zelleEmail = formData.get('zelleEmail');
      const zellePhone = formData.get('zellePhone');
      if (zelleEmail || zellePhone) {
        paymentDetails.zelleEmail = zelleEmail;
        paymentDetails.zellePhone = zellePhone;
        paymentValid = true;
      }
      break;
    case 'cashapp':
      const cashAppTag = formData.get('cashAppTag');
      if (cashAppTag) {
        paymentDetails.cashAppTag = cashAppTag;
        paymentValid = true;
      }
      break;
  }
  
  if (!paymentValid) {
    showMessage('Please provide valid payment details', 'error');
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    return;
  }
  
  // Create customer data object
  const customerData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    name: `${formData.get('firstName')} ${formData.get('lastName')}`,
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    zip: formData.get('zip'),
    paymentMethod: paymentMethod,
    paymentDetails: paymentDetails,
    items: cart
  };
  
  try {
    // Call the shipping API
    const result = await createShippingLabel(customerData);
    
    if (result.success) {
      // Show success message
      showMessage('Your order has been placed! Check your email for the shipping label.', 'success');
      
      // Clear cart
      localStorage.setItem('cart', JSON.stringify([]));
      
      // Update cart count
      updateCartCount();
      
      // Redirect to thank you page
      setTimeout(() => {
        window.location.href = 'thank-you.html';
      }, 2000);
    } else {
      // Show error message
      showMessage(`Error: ${result.message || 'Failed to process order'}`, 'error');
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showMessage('An unexpected error occurred. Please try again.', 'error');
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
}

// Initialize checkout form
document.addEventListener('DOMContentLoaded', function() {
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    
    // Populate cart summary
    populateCheckoutSummary();
  }
  
  // Show/hide payment method fields based on selection
  const paymentMethodSelect = document.getElementById('payment-method');
  if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener('change', function() {
      const selectedMethod = this.value;
      
      // Hide all payment detail sections
      document.querySelectorAll('.payment-details').forEach(section => {
        section.style.display = 'none';
      });
      
      // Show selected payment method section
      const selectedSection = document.getElementById(`${selectedMethod}-details`);
      if (selectedSection) {
        selectedSection.style.display = 'block';
      }
    });
    
    // Trigger change event to initialize display
    paymentMethodSelect.dispatchEvent(new Event('change'));
  }
});

/**
 * Populates the checkout summary with cart items
 */
function populateCheckoutSummary() {
  const summaryContainer = document.getElementById('checkout-cart-summary');
  const totalElement = document.getElementById('checkout-total-amount');
  
  if (!summaryContainer) return;
  
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    summaryContainer.innerHTML = '<p>Your cart is empty</p>';
    if (totalElement) totalElement.textContent = '$0.00';
    return;
  }
  
  let total = 0;
  let summaryHTML = '<div class="checkout-items">';
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    summaryHTML += `
      <div class="checkout-item">
        <div class="checkout-item-name">${item.name} × ${item.quantity}</div>
        <div class="checkout-item-price">$${itemTotal.toFixed(2)}</div>
      </div>
    `;
  });
  
  summaryHTML += '</div>';
  
  summaryContainer.innerHTML = summaryHTML;
  if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}