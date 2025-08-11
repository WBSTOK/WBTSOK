document.addEventListener('DOMContentLoaded', function() {
  // Initialize navigation first
  if (typeof setActiveNavLink === 'function') {
    setActiveNavLink();
  }
  
  // Initialize EmailJS
  emailjs.init("YOUR_PUBLIC_KEY"); // Get from emailjs.com
  
  // Get form elements
  const signupForm = document.getElementById('signup-form');
  const fullnameInput = document.getElementById('fullname');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const termsCheckbox = document.getElementById('terms');
  const signupBtn = document.getElementById('signup-btn');
  
  // Get password requirement elements
  const reqLength = document.getElementById('req-length');
  const reqUppercase = document.getElementById('req-uppercase');
  const reqLowercase = document.getElementById('req-lowercase');
  const reqNumber = document.getElementById('req-number');
  
  // Get password toggle elements
  const togglePasswordBtns = document.querySelectorAll('.toggle-password');
  
  // Password validation patterns
  const patterns = {
    length: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/
  };
  
  // Form validation state
  const validationState = {
    fullname: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    terms: false
  };
  
  // Toggle password visibility
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const passwordField = this.previousElementSibling;
      const icon = this.querySelector('i');
      
      // Toggle password visibility
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
  
  // Validate password in real-time
  passwordInput.addEventListener('input', function() {
    const password = this.value;
    
    // Check each requirement
    const lengthValid = patterns.length.test(password);
    const uppercaseValid = patterns.uppercase.test(password);
    const lowercaseValid = patterns.lowercase.test(password);
    const numberValid = patterns.number.test(password);
    
    // Update requirement indicators
    updateRequirement(reqLength, lengthValid);
    updateRequirement(reqUppercase, uppercaseValid);
    updateRequirement(reqLowercase, lowercaseValid);
    updateRequirement(reqNumber, numberValid);
    
    // Update validation state
    validationState.password = lengthValid && uppercaseValid && lowercaseValid && numberValid;
    
    // Check if passwords match
    if (confirmPasswordInput.value) {
      validationState.confirmPassword = confirmPasswordInput.value === password && validationState.password;
    }
    
    // Update signup button state
    updateSignupButtonState();
  });
  
  // Validate confirm password
  confirmPasswordInput.addEventListener('input', function() {
    validationState.confirmPassword = this.value === passwordInput.value && validationState.password;
    updateSignupButtonState();
  });
  
  // Validate other fields
  fullnameInput.addEventListener('input', function() {
    validationState.fullname = this.value.trim().length > 0;
    updateSignupButtonState();
  });
  
  emailInput.addEventListener('input', function() {
    validationState.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
    updateSignupButtonState();
  });
  
  phoneInput.addEventListener('input', function() {
    validationState.phone = /^\d{10,}$/.test(this.value.replace(/\D/g, ''));
    updateSignupButtonState();
  });
  
  termsCheckbox.addEventListener('change', function() {
    validationState.terms = this.checked;
    updateSignupButtonState();
  });
  
  // Handle form submission
  signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const userData = {
      fullname: formData.get('fullname'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zipcode: formData.get('zipcode')
    };
    
    // Validate form data
    if (!validateSignupData(userData)) {
      return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    try {
      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Create pending user object
      const pendingUser = {
        fullname: userData.fullname,
        email: userData.email,
        phone: userData.phone,
        password: userData.password, // Make sure to hash this in production
        verificationCode: verificationCode,
        verificationExpires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isActive: false,
        isVerified: false
      };
      
      // Send verification email using Resend
      await emailService.sendVerificationEmail(pendingUser, verificationCode);
      
      // Store pending user data
      localStorage.setItem('pendingUser', JSON.stringify(pendingUser));
      
      // Redirect to verification page
      window.location.href = `verify-email.html?email=${encodeURIComponent(userData.email)}`;
      
    } catch (error) {
      console.error('Failed to send verification email:', error);
      showErrorMessage('Failed to send verification email. Please try again.');
    } finally {
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
  
  // ✅ Generate 6-digit verification code
  function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // ✅ Send verification email using EmailJS
  async function sendVerificationEmail(userData, code) {
    const templateParams = {
      to_name: userData.fullname,
      to_email: userData.email,
      verification_code: code,
      company_name: 'We Buy Test Strips Oklahoma'
    };
    
    return emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
  }
  
  // ✅ Show verification message
  function showVerificationMessage(email) {
    showSuccessMessage(`Account created! Please check ${email} for your verification code.`);
  }
  
  // Helper function to update requirement indicators
  function updateRequirement(element, isValid) {
    if (isValid) {
      element.classList.remove('unmet');
      element.classList.add('met');
    } else {
      element.classList.remove('met');
      element.classList.add('unmet');
    }
  }
  
  // Helper function to check if all form fields are valid
  function isFormValid() {
    return Object.values(validationState).every(value => value === true);
  }
  
  // Helper function to update signup button state
  function updateSignupButtonState() {
    signupBtn.disabled = !isFormValid();
  }
  
  // Format phone number as user types
  phoneInput.addEventListener('input', function(e) {
    // Get only digits from the input
    let digits = this.value.replace(/\D/g, '');
    
    // Format the phone number
    if (digits.length > 0) {
      if (digits.length <= 3) {
        this.value = digits;
      } else if (digits.length <= 6) {
        this.value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        this.value = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
    }
  });
  
  function validateSignupData(data) {
    // Add your validation logic here
    if (!data.email || !data.fullname) {
      showErrorMessage('Please fill in all required fields.');
      return false;
    }
    
    if (!isValidEmail(data.email)) {
      showErrorMessage('Please enter a valid email address.');
      return false;
    }
    
    return true;
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Success/Error message functions
  function showSuccessMessage(message) {
    removeExistingMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message success';
    messageDiv.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;
    
    signupForm.insertBefore(messageDiv, signupForm.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
  
  function showErrorMessage(message) {
    removeExistingMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message error';
    messageDiv.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;
    
    signupForm.insertBefore(messageDiv, signupForm.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
  
  function removeExistingMessages() {
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
  }
});
