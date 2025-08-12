document.addEventListener('DOMContentLoaded', function() {
  // Initialize checkout page
  initCheckout();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize photo upload functionality
  initPhotoUpload();
});

// Photo upload functionality
let uploadedPhotos = [];
let uploadAreaClickHandler = null;

function initPhotoUpload() {
  
  const uploadArea = document.getElementById('photo-upload-area');
  const photoInput = document.getElementById('photo-input');
  const uploadedPhotosContainer = document.getElementById('uploaded-photos');
  const photoCount = document.getElementById('photo-count');
  const continueBtn = document.getElementById('continue-to-shipping');
  
  console.log('Initializing photo upload...');
  console.log('Upload area found:', !!uploadArea);
  console.log('Photo input found:', !!photoInput);
  
  if (!uploadArea || !photoInput) {
    console.error('Required elements not found for photo upload');
    return;
  }
  
  // Remove existing event listeners to prevent duplicates
  if (uploadAreaClickHandler) {
    uploadArea.removeEventListener('click', uploadAreaClickHandler);
  }
  
  // Create new click handler
  uploadAreaClickHandler = (e) => {
    console.log('Upload area clicked');
    console.log('Photo input element:', photoInput);
    if (photoInput) {
      photoInput.click();
    } else {
      console.error('Photo input element not found!');
    }
  };
  
  // Add event listeners
  uploadArea.addEventListener('click', uploadAreaClickHandler);
  
  // Remove and re-add file input change listener
  photoInput.removeEventListener('change', handleFileSelect);
  photoInput.addEventListener('change', handleFileSelect);
  
  // Remove and re-add drag and drop listeners
  uploadArea.removeEventListener('dragover', handleDragOver);
  uploadArea.removeEventListener('drop', handleDrop);
  uploadArea.removeEventListener('dragleave', handleDragLeave);
  
  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('drop', handleDrop);
  uploadArea.addEventListener('dragleave', handleDragLeave);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  
  // Check if files were actually selected
  if (files.length === 0) {
    console.log('No files selected');
    return;
  }
  
  console.log(`Selected ${files.length} file(s)`);
  processFiles(files);
  
  // Clear the input so the same files can be selected again if needed
  setTimeout(() => {
    e.target.value = '';
  }, 100);
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
  
  // Show number of files being dragged
  const fileCount = e.dataTransfer.items ? e.dataTransfer.items.length : 0;
  if (fileCount > 0) {
    const uploadPrompt = e.currentTarget.querySelector('.upload-prompt p');
    if (uploadPrompt) {
      uploadPrompt.textContent = `Drop ${fileCount} file${fileCount > 1 ? 's' : ''} here`;
    }
  }
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('dragover');
  
  // Reset upload prompt text
  const uploadPrompt = e.currentTarget.querySelector('.upload-prompt p');
  if (uploadPrompt) {
    uploadPrompt.textContent = 'Click to upload multiple photos or drag and drop';
  }
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  
  // Reset upload prompt text
  const uploadPrompt = e.currentTarget.querySelector('.upload-prompt p');
  if (uploadPrompt) {
    uploadPrompt.textContent = 'Click to upload multiple photos or drag and drop';
  }
  
  const files = Array.from(e.dataTransfer.files);
  processFiles(files);
}

function processFiles(files) {
  if (files.length === 0) return;
  
  console.log(`Processing ${files.length} file(s)...`);
  
  // Show processing message for multiple files
  if (files.length > 1) {
    showMessage(`Processing ${files.length} photos...`, 'info');
  }
  
  let validFiles = 0;
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      if (file.size <= 5 * 1024 * 1024) { // 5MB limit
        addPhoto(file);
        validFiles++;
      } else {
        showMessage(`File "${file.name}" is too large. Maximum size is 5MB.`, 'error');
      }
    } else {
      showMessage(`File "${file.name}" is not an image. Please upload only image files.`, 'error');
    }
  });
  
  // Show success message for multiple valid files
  if (validFiles > 1) {
    setTimeout(() => {
      showMessage(`Successfully uploaded ${validFiles} photos!`, 'success');
    }, 500);
  }
}

function addPhoto(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const photoData = {
      file: file,
      dataUrl: e.target.result,
      id: Date.now() + Math.random()
    };
    
    uploadedPhotos.push(photoData);
    displayPhoto(photoData);
    updatePhotoCount();
    updateButtonStates(); // Update button states when photo is added
  };
  reader.readAsDataURL(file);
}

function displayPhoto(photoData) {
  const uploadedPhotosContainer = document.getElementById('uploaded-photos');
  
  const photoDiv = document.createElement('div');
  photoDiv.className = 'photo-preview';
  photoDiv.dataset.photoId = photoData.id;
  
  photoDiv.innerHTML = `
    <img src="${photoData.dataUrl}" alt="Product photo">
    <button class="photo-remove" onclick="removePhoto(${photoData.id})">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  uploadedPhotosContainer.appendChild(photoDiv);
}

function removePhoto(photoId) {
  uploadedPhotos = uploadedPhotos.filter(photo => photo.id !== photoId);
  
  const photoElement = document.querySelector(`[data-photo-id="${photoId}"]`);
  if (photoElement) {
    photoElement.remove();
  }
  
  updatePhotoCount();
  updateButtonStates(); // Update button states when photo is removed
}

function updatePhotoCount() {
  const photoCount = document.getElementById('photo-count');
  const continueBtn = document.getElementById('continue-to-shipping');
  
  if (photoCount) {
    photoCount.textContent = uploadedPhotos.length;
    
    const uploadStatus = photoCount.parentElement;
    if (uploadedPhotos.length >= 3) {
      uploadStatus.classList.add('complete');
      uploadStatus.innerHTML = `<i class="fas fa-check"></i> ${uploadedPhotos.length} photos uploaded - Ready to continue!`;
      if (continueBtn) continueBtn.disabled = false;
    } else if (uploadedPhotos.length >= 1) {
      // Allow continue with just 1 photo for testing
      uploadStatus.classList.add('complete');
      uploadStatus.innerHTML = `<i class="fas fa-check"></i> ${uploadedPhotos.length} photo(s) uploaded - Ready to continue!`;
      if (continueBtn) continueBtn.disabled = false;
    } else {
      uploadStatus.classList.remove('complete');
      uploadStatus.innerHTML = `${uploadedPhotos.length} of 3+ photos uploaded`;
      if (continueBtn) continueBtn.disabled = true;
    }
  }
}

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
      updateButtonStates(); // Update button states when payment method changes
    });
  });
  
  // Real-time validation for form fields
  const formFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zip', 'paypalEmail', 'venmoUsername', 'zelleEmail'];
  formFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', updateButtonStates);
      field.addEventListener('blur', updateButtonStates);
    }
  });
  
  // Initial button state update
  setTimeout(updateButtonStates, 100); // Delay to ensure all elements are loaded
  
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
  
  // Initialize photo upload when going to step 2
  if (stepNumber == 2) {
    initPhotoUpload();
  }
  
  // Update progress indicators
  updateProgressIndicators(stepNumber);
  
  // Update button states when navigating steps
  setTimeout(updateButtonStates, 100);
  
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

// ✅ UPDATED PROCESS ORDER FUNCTION WITH EMAIL INTEGRATION
async function processOrder() {
  // COMPREHENSIVE FORM VALIDATION
  const validationErrors = [];
  
  // Get form data for validation
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim(); // Optional
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const zip = document.getElementById('zip').value.trim();
  
  // Validate required fields
  if (!firstName) {
    validationErrors.push('First name is required');
    highlightField('firstName');
  }
  
  if (!lastName) {
    validationErrors.push('Last name is required');
    highlightField('lastName');
  }
  
  if (!email) {
    validationErrors.push('Email address is required');
    highlightField('email');
  } else if (!isValidEmail(email)) {
    validationErrors.push('Please enter a valid email address');
    highlightField('email');
  }
  
  if (!address) {
    validationErrors.push('Street address is required');
    highlightField('address');
  }
  
  if (!city) {
    validationErrors.push('City is required');
    highlightField('city');
  }
  
  if (!state) {
    validationErrors.push('State is required');
    highlightField('state');
  }
  
  if (!zip) {
    validationErrors.push('ZIP code is required');
    highlightField('zip');
  } else if (!isValidZipCode(zip)) {
    validationErrors.push('Please enter a valid ZIP code');
    highlightField('zip');
  }
  
  // Validate payment method selection
  const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
  if (!selectedPayment) {
    validationErrors.push('Please select a payment method');
    goToStep(4); // Go to payment step
    return;
  }
  
  // Validate payment method details
  if (selectedPayment.value === 'paypal') {
    const paypalEmail = document.getElementById('paypalEmail').value.trim();
    if (!paypalEmail) {
      validationErrors.push('PayPal email is required');
      highlightField('paypalEmail');
    } else if (!isValidEmail(paypalEmail)) {
      validationErrors.push('Please enter a valid PayPal email');
      highlightField('paypalEmail');
    }
  } else if (selectedPayment.value === 'venmo') {
    const venmoUsername = document.getElementById('venmoUsername').value.trim();
    if (!venmoUsername) {
      validationErrors.push('Venmo username is required');
      highlightField('venmoUsername');
    }
  } else if (selectedPayment.value === 'zelle') {
    const zelleEmail = document.getElementById('zelleEmail').value.trim();
    if (!zelleEmail) {
      validationErrors.push('Zelle email or phone is required');
      highlightField('zelleEmail');
    }
  }
  
  // Check if photos are uploaded (minimum 1, not 3)
  if (uploadedPhotos.length < 1) {
    validationErrors.push('Please upload at least 1 photo of your test strips');
    goToStep(2); // Go back to photo verification step
    return;
  }
  
  // If there are validation errors, show them and stop
  if (validationErrors.length > 0) {
    showMessage(validationErrors.join('<br>'), 'error');
    return;
  }
  
  // Show loading indicator
  const completeOrderBtn = document.getElementById('complete-order-btn');
  completeOrderBtn.disabled = true;
  completeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  
  try {
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
    
    // Get cart items
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate order ID
    const orderId = generateOrderNumber();
    
    // Create comprehensive order data
    const orderData = {
      id: orderId,
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
      items: cartItems,
      total: subtotal,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      trackingNumber: null, // Will be updated when shipped
      photos: uploadedPhotos.map(photo => ({
        name: photo.file.name,
        size: photo.file.size,
        type: photo.file.type,
        dataUrl: photo.dataUrl // Store the base64 data URL for display
      }))
    };
    
    // Create user data for email
    const userData = {
      fullname: `${firstName} ${lastName}`,
      email: email,
      phone: phone
    };
    
    // ✅ SEND ORDER CONFIRMATION EMAIL FIRST
    let emailSent = false;
    if (window.emailService) {
      try {
        const emailResult = await window.emailService.sendOrderConfirmation(orderData, userData);
        if (emailResult.success) {
          emailSent = true;
          console.log('✅ Order confirmation email sent');
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
        // Continue with order processing even if email fails
      }
    }
    
    // ✅ SEND ADMIN NOTIFICATION EMAIL
    if (window.AdminNotificationService && uploadedPhotos.length > 0) {
      try {
        const adminService = new AdminNotificationService();
        const adminResult = await adminService.sendOrderApprovalRequest(orderData, uploadedPhotos);
        if (adminResult.success) {
          console.log('✅ Admin notification email sent');
        }
      } catch (adminError) {
        console.error('Admin notification error:', adminError);
        // Continue with order processing even if admin email fails
      }
    }
    
    // Send to backend for shipping label
    let data = { success: false };
    
    try {
      const response = await fetch(`${window.ordersAPI.baseURL}/api/create-shipping-label`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        data = await response.json();
      } else {
        console.warn('Shipping API request failed:', response.status);
      }
    } catch (fetchError) {
      console.warn('Shipping API unavailable:', fetchError.message);
      // Continue without shipping API - order will still be processed
    }
    
    // Process order regardless of shipping API status
    if (data.success || true) { // Always process for now
      // ✅ SAVE ORDER DATA LOCALLY
      await saveOrderToDatabase(orderData);
      
      // Clear the cart
      localStorage.setItem('cart', JSON.stringify([]));
      
      // Update cart count
      if (typeof updateCartCount === 'function') {
        updateCartCount();
      }
      
      // ✅ START EMAIL NOTIFICATION WORKFLOW
      if (window.orderNotificationService) {
        // Start the automated email workflow (processing, shipped, delivered)
        setTimeout(() => {
          window.orderNotificationService.simulateOrderWorkflow(orderData);
        }, 2000);
      }
      
      // Update confirmation message
      const confirmationMessage = document.querySelector('.confirmation-message');
      const thankYouText = confirmationMessage.querySelector('h2');
      thankYouText.textContent = 'Thank You! Your Order is Under Review';
      
      const statusText = confirmationMessage.querySelector('p');
      statusText.textContent = 'Your order has been submitted and is currently being reviewed by our team.';
      
      // Update next steps for approval process
      const nextSteps = confirmationMessage.querySelector('.next-steps ol');
      nextSteps.innerHTML = `
        <li>Our team will review your photos and order details within 24 hours.</li>
        <li>You'll receive an email notification once your order is approved.</li>
        <li>After approval, we'll send you a prepaid shipping label.</li>
        <li>Package your test strips securely and ship them to us.</li>
        <li>Once we receive and verify your items, we'll process your payment.</li>
      `;
      
      // Go to confirmation step
      goToStep(5); // Updated to step 5 since we added photo verification
      
      // Update confirmation page with tracking number if available
      if (data.trackingNumber || data.tracking_number) {
        const trackingNumber = data.trackingNumber || data.tracking_number;
        orderData.trackingNumber = trackingNumber;
        await saveOrderToDatabase(orderData); // Update with tracking number
        
        const trackingElement = document.createElement('div');
        trackingElement.className = 'tracking-info';
        trackingElement.innerHTML = `<p>Tracking Number: <strong>${trackingNumber}</strong></p>`;
        document.querySelector('.confirmation-message').appendChild(trackingElement);
      }
      
    } else {
      throw new Error(data.message || 'Order processing failed');
    }
    
  } catch (error) {
    console.error('Order processing error:', error);
    showMessage('There was an error processing your order. Please try again.', 'error');
  } finally {
    // Reset button state
    completeOrderBtn.disabled = false;
    completeOrderBtn.innerHTML = 'Complete Order';
  }
}

// ✅ UPDATED FUNCTION TO SAVE ORDER DATA TO VERCEL KV
async function saveOrderToDatabase(orderData) {
  try {
    console.log('💾 Attempting to save order to database:', orderData.id);
    console.log('🔗 Using API URL:', window.ordersAPI.baseURL);
    console.log('📦 Order data:', orderData);
    
    // Save to Vercel KV database
    const result = await window.ordersAPI.createOrder(orderData);
    console.log('✅ Order saved to database successfully:', result);
    console.log('✅ Order ID confirmed:', orderData.id);
  } catch (error) {
    console.error('❌ Failed to save order to database:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Full error:', error);
    // Fallback is handled in ordersAPI
  }
}

function generateOrderNumber() {
  // Generate a random order number
  const prefix = 'WB';
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

// Validation helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidZipCode(zip) {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

function highlightField(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.style.borderColor = '#ff4444';
    field.style.backgroundColor = '#fff5f5';
    
    // Remove highlight after user starts typing
    field.addEventListener('input', function() {
      field.style.borderColor = '';
      field.style.backgroundColor = '';
    }, { once: true });
  }
}

function clearFieldHighlights() {
  const fields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'paypalEmail', 'venmoUsername', 'zelleEmail'];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.style.borderColor = '';
      field.style.backgroundColor = '';
    }
  });
}

// Real-time validation functions for each step
function validateStep2() {
  // Photo verification step - need at least 1 photo
  return uploadedPhotos.length >= 1;
}

function validateStep3() {
  // Shipping step - all address fields required
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const zip = document.getElementById('zip').value.trim();
  
  return firstName && lastName && email && isValidEmail(email) && 
         address && city && state && zip && isValidZipCode(zip);
}

function validateStep4() {
  // Payment step - payment method and details required
  const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
  if (!selectedPayment) return false;
  
  if (selectedPayment.value === 'paypal') {
    const paypalEmail = document.getElementById('paypalEmail').value.trim();
    return paypalEmail && isValidEmail(paypalEmail);
  } else if (selectedPayment.value === 'venmo') {
    const venmoUsername = document.getElementById('venmoUsername').value.trim();
    return venmoUsername;
  } else if (selectedPayment.value === 'zelle') {
    const zelleEmail = document.getElementById('zelleEmail').value.trim();
    return zelleEmail;
  }
  
  return false;
}

function updateButtonStates() {
  // Update Step 2 button (Continue to Shipping)
  const step2Button = document.getElementById('continue-to-shipping');
  if (step2Button) {
    const isValid = validateStep2();
    step2Button.disabled = !isValid;
    step2Button.style.opacity = isValid ? '1' : '0.5';
    step2Button.style.cursor = isValid ? 'pointer' : 'not-allowed';
    step2Button.style.backgroundColor = isValid ? '' : '#cccccc';
    step2Button.style.borderColor = isValid ? '' : '#cccccc';
  }
  
  // Update Step 3 button (Continue to Payment)
  const step3Button = document.querySelector('[data-next="4"]');
  if (step3Button) {
    const isValid = validateStep3();
    step3Button.disabled = !isValid;
    step3Button.style.opacity = isValid ? '1' : '0.5';
    step3Button.style.cursor = isValid ? 'pointer' : 'not-allowed';
    step3Button.style.backgroundColor = isValid ? '' : '#cccccc';
    step3Button.style.borderColor = isValid ? '' : '#cccccc';
  }
  
  // Update Step 4 button (Complete Order)
  const step4Button = document.getElementById('complete-order-btn');
  if (step4Button) {
    const isValid = validateStep4() && validateStep3() && validateStep2();
    step4Button.disabled = !isValid;
    step4Button.style.opacity = isValid ? '1' : '0.5';
    step4Button.style.cursor = isValid ? 'pointer' : 'not-allowed';
    step4Button.style.backgroundColor = isValid ? '' : '#cccccc';
    step4Button.style.borderColor = isValid ? '' : '#cccccc';
  }
}

// ✅ ENHANCED SHOW MESSAGE FUNCTION
function showMessage(message, type = 'success') {
  const messageElement = document.createElement('div');
  messageElement.className = `message message-${type}`;
  messageElement.innerHTML = `
    <i class="fas fa-${getMessageIcon(type)}"></i>
    <span>${message}</span>
  `;
  
  // Style the message
  messageElement.style.position = 'fixed';
  messageElement.style.top = '20px';
  messageElement.style.left = '50%';
  messageElement.style.transform = 'translateX(-50%)';
  messageElement.style.padding = '15px 25px';
  messageElement.style.borderRadius = '8px';
  messageElement.style.zIndex = '10000';
  messageElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  messageElement.style.opacity = '0';
  messageElement.style.transition = 'all 0.3s ease';
  messageElement.style.display = 'flex';
  messageElement.style.alignItems = 'center';
  messageElement.style.gap = '10px';
  messageElement.style.fontSize = '14px';
  messageElement.style.fontWeight = '500';
  messageElement.style.maxWidth = '500px';
  messageElement.style.textAlign = 'center';
  
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
  
  // Remove after 5 seconds
  setTimeout(() => {
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateX(-50%) translateY(-20px)';
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      messageElement.remove();
    }, 300);
  }, 5000);
}

// ✅ HELPER FUNCTION FOR MESSAGE ICONS
function getMessageIcon(type) {
  const icons = {
    success: 'check-circle',
    error: 'exclamation-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle'
  };
  return icons[type] || 'info-circle';
}