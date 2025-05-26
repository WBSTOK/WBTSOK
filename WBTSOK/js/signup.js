document.addEventListener('DOMContentLoaded', function() {
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
    
    // Get form data
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    try {
      // Show loading state
      document.getElementById('signup-btn').disabled = true;
      document.getElementById('signup-btn').textContent = 'Creating Account...';
      
      // Send data to your Vercel proxy
      const response = await fetch('https://api.webuyteststripsoklahoma.com/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname,
          email,
          phone
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Show success message
        alert('Account created successfully!');
        // Redirect to login page
        window.location.href = 'login.html';
      } else {
        // Show error message
        alert(`Error: ${data.message}`);
        document.getElementById('signup-btn').disabled = false;
        document.getElementById('signup-btn').textContent = 'Create Account';
      }
    } catch (error) {
      console.error('Error details:', error);
      if (error.message) console.error('Error message:', error.message);
      if (error.stack) console.error('Error stack:', error.stack);
      alert('An error occurred. Please check the console for details.');
      document.getElementById('signup-btn').disabled = false;
      document.getElementById('signup-btn').textContent = 'Create Account';
    }
  });
  
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
});