document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmission);
  }
});

async function handleContactFormSubmission(event) {
  event.preventDefault();
  
  const submitBtn = event.target.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  
  // Show loading state
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  
  try {
    // Get form data
    const formData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      message: document.getElementById('message').value,
      formType: 'contact', // This helps identify the form in your Google Apps Script
      timestamp: new Date().toISOString()
    };
    
    // Submit form
    const result = await submitContactForm(formData);
    
    // Show success message
    showMessage('Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
    
    // Reset form
    event.target.reset();
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    showMessage('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
  } finally {
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

async function submitContactForm(formData) {
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Contact form submission error:', error);
    throw error;
  }
}

function showMessage(message, type) {
  // Remove any existing messages
  const existingMessage = document.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create new message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `form-message ${type}`;
  messageDiv.textContent = message;
  
  // Insert message before the form
  const form = document.querySelector('.contact-form');
  form.parentNode.insertBefore(messageDiv, form);
  
  // Auto-remove message after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}