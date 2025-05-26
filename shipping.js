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
  
  // Create customer data object
  const customerData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    zip: formData.get('zip'),
    paymentMethod: formData.get('paymentMethod'),
    paymentDetails: {
      // Get payment details based on selected method
      // For PayPal: email
      // For Venmo: username
      // For Zelle: email or phone
      // For Cash App: $cashtag
      paypalEmail: formData.get('paypalEmail') || '',
      venmoUsername: formData.get('venmoUsername') || '',
      zelleEmail: formData.get('zelleEmail') || '',
      zellePhone: formData.get('zellePhone') || '',
      cashAppTag: formData.get('cashAppTag') || ''
    },
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
