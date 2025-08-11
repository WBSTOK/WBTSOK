// Enhanced showMessage function with animation
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

// Main cart rendering function
function renderCart() {
  console.log("renderCart function called");
  
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyCartMessage = document.querySelector('.empty-cart');
  const cartSummary = document.getElementById('cart-summary');
  
  if (!cartItemsContainer) {
    console.error("Cart items container not found");
    return;
  }
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  console.log("Current cart contents:", cart);
  
  // Clear current items
  cartItemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    // Show empty cart message
    if (emptyCartMessage) emptyCartMessage.style.display = 'block';
    if (cartSummary) cartSummary.style.display = 'none';
    
    // Update total to zero
    const totalElement = document.getElementById('cart-total');
    if (totalElement) {
      totalElement.textContent = '$0.00';
    }
    
    // Change button text for empty cart
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.textContent = 'Browse Products';
      checkoutBtn.addEventListener('click', function() {
        window.location.href = 'sell.html';
      });
    }
    
    return;
  }
  
  // Hide empty cart message and show cart items/summary
  if (emptyCartMessage) emptyCartMessage.style.display = 'none';
  if (cartSummary) cartSummary.style.display = 'block';
  
  // Clear the cart items container to add new items
  cartItemsContainer.innerHTML = '';
  
  // Reset checkout button text
  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.textContent = 'Proceed to Checkout';
    
    // Clear previous event listeners (this is a simplified approach)
    const newCheckoutBtn = checkoutBtn.cloneNode(true);
    checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);
    
    newCheckoutBtn.addEventListener('click', function() {
      // Handle checkout process
      window.location.href = 'checkout.html';
    });
  }
  
  // Calculate total
  let total = 0;
  
  // Render each cart item
  cart.forEach(item => {
    // Calculate item subtotal
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    // Get image path (use stored path or default to placeholder)
    let imagePath = item.imagePath || 'assets/Shopping_Cart_Icon_PNG_Clipart.png';
    console.log("Using image path:", imagePath);
    
    // Create cart item element
    const cartItemElement = document.createElement('div');
    cartItemElement.className = 'cart-item';
    cartItemElement.dataset.id = item.id; // Important: Add the item ID as a data attribute
    
    // UPDATED HTML TEMPLATE - removed category/model display
    cartItemElement.innerHTML = `
      <img src="${imagePath}" 
           alt="${item.name}"
           class="cart-item-image"
           onerror="this.src='assets/Shopping_Cart_Icon_PNG_Clipart.png'">
      <div class="cart-item-details">
        <h3 class="cart-item-title">${item.name}</h3>
        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        <div class="cart-item-quantity">
          <button class="quantity-btn decrease" data-id="${item.id}">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
          <button class="quantity-btn increase" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}">
        Remove
      </button>
    `;
    
    cartItemsContainer.appendChild(cartItemElement);
  });
  
  // Update total display
  const totalElement = document.getElementById('cart-total');
  if (totalElement) {
    totalElement.textContent = '$' + total.toFixed(2);
  }
  
  // Set up event listeners for the newly added cart items
  setupCartItemRemoval();
  setupCartQuantityControls();
}

// Direct add to cart function
function addProductToCart(productId) {
  console.log(`Direct add to cart for product ${productId}`);
  
  // Get product details
  const select = document.querySelector(`.model-select[data-product="${productId}"]`);
  const quantityInput = document.querySelector(`.quantity-input[data-product="${productId}"]`);
  
  if (select && quantityInput) {
    const selectedOption = select.options[select.selectedIndex];
    const modelId = select.value;
    
    // Extract just the model name without category
    // This assumes the format might be "Category - Model Name"
    let modelName = selectedOption.text;
    if (modelName.includes(' - ')) {
      // If there's a category separator, take only what's after it
      modelName = modelName.split(' - ')[1];
    }
    
    const price = parseFloat(selectedOption.dataset.price) || 0;
    const quantity = parseInt(quantityInput.value) || 1;
    
    // Create cart item
    const item = {
      id: modelId,
      productId: productId,
      name: modelName, // Now contains only the model name
      price: price,
      quantity: quantity
    };
    
    // Add to cart using our addToCart function
    addToCart(item);
    
    // Reset quantity
    quantityInput.value = 0;
    updateSubtotal(productId);
    updateAddToCartButton(productId);
    
    // Force update cart count immediately
    updateCartCount();
  }
}

// Function to remove cart item
function removeCartItem(itemId) {
  console.log(`Removing item ${itemId} from cart`);
  
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Find the item to get its name for the message
  const itemToRemove = cart.find(item => item.id === itemId);
  const itemName = itemToRemove ? itemToRemove.name : 'Item';
  
  const updatedCart = cart.filter(item => item.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  
  renderCart();
  updateCartCount();
  updateSellPageTotal(); // Add this line
  
  // Show removal message
  showMessage(`${itemName} removed from cart`, 'info');
}

// Add this to your script.js
function traceCartEvents() {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    console.log(`localStorage.setItem('${key}', ${value})`);
    originalSetItem.apply(this, arguments);
    
    // Force UI update when cart is modified
    if (key === 'cart') {
      console.log("Cart updated, refreshing UI");
      updateCartCount();
      updateSellPageTotal(); // Update the sell page total
    }
  };
}

// Call this at the start of your script
traceCartEvents();

// Add this to your code to debug localStorage
function debugCart() {
  console.log("Current cart contents:", JSON.parse(localStorage.getItem('cart')));
}

// Call this function where appropriate
debugCart();

document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart functionality
  renderCart();
  updateCartCount();
  updateSellPageTotal(); // Update the sell page total
  // Other initialization code
});

// Function to update the cart total on the sell page - with more specific targeting
function updateSellPageTotal() {
  // Only run on sell page to prevent console spam
  if (!window.location.pathname.includes('sell.html')) {
    return;
  }
  
  console.log("updateSellPageTotal called");
  
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  console.log("Calculated total:", total);
  
  // Target the specific element with ID sell-page-cart-total
  const sellPageTotalElement = document.getElementById('sell-page-cart-total');
  if (sellPageTotalElement) {
    console.log("Found sell-page-cart-total element, updating to:", total.toFixed(2));
    sellPageTotalElement.textContent = `$${total.toFixed(2)}`;
  } else {
    console.warn("Could not find element with ID 'sell-page-cart-total'");
    
    // Try alternative selector as fallback
    const cartTotalSpan = document.querySelector('.cart-total span:last-child');
    if (cartTotalSpan) {
      console.log("Found cart total span via alternative selector");
      cartTotalSpan.textContent = `$${total.toFixed(2)}`;
    } else {
      console.error("Could not find any cart total element");
    }
  }
  
  // Update checkout button state
  const checkoutBtn = document.getElementById('sell-page-checkout-btn');
  if (checkoutBtn) {
    if (total > 0) {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = 'Proceed to Checkout';
    } else {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Cart Empty';
    }
  }
}

// Make sure addToCart calls updateSellPageTotal
function addToCart(item) {
  console.log(`Adding to cart: ${item.name}, quantity: ${item.quantity}, price: ${item.price}`);
  
  // Check if user is signed in
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isSignedIn = userData && userData.email;
  
  // Add item to cart first
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
  
  if (existingItemIndex >= 0) {
    cart[existingItemIndex].quantity += item.quantity;
    console.log(`Updated existing item quantity to ${cart[existingItemIndex].quantity}`);
  } else {
    cart.push(item);
    console.log("Added new item to cart");
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Show different prompts based on sign-in status
  if (!isSignedIn) {
    // Show guest checkout prompt for non-signed-in users
    showGuestCheckoutPrompt(item.name);
  } else {
    // Show regular success message for signed-in users
    showMessage(`${item.name} added to cart`, 'success');
  }
  
  // Update UI
  console.log("Updating UI after adding to cart");
  updateCartCount();
  
  // Call updateSellPageTotal directly
  console.log("About to call updateSellPageTotal");
  updateSellPageTotal();
  console.log("Finished calling updateSellPageTotal");
  
  // Also try with a slight delay in case there's a timing issue
  setTimeout(updateSellPageTotal, 100);
}

// Show guest checkout prompt for non-signed-in users
function showGuestCheckoutPrompt(itemName) {
  // Remove any existing prompts
  const existingPrompt = document.getElementById('guest-checkout-prompt');
  if (existingPrompt) {
    existingPrompt.remove();
  }
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'guest-checkout-prompt';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;
  
  // Create modal content
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 10px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    ">
      <div style="color: #4CAF50; font-size: 48px; margin-bottom: 15px;">
        ✓
      </div>
      <h3 style="margin: 0 0 15px 0; color: #333;">
        ${itemName} added to cart!
      </h3>
      <p style="margin: 0 0 25px 0; color: #666; line-height: 1.5;">
        Would you like to create an account for faster checkout and order tracking?
      </p>
      <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <button onclick="continueAsGuest()" style="
          background: #6c757d;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        ">
          Continue as Guest
        </button>
        <button onclick="redirectToSignup()" style="
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        ">
          Create Account
        </button>
        <button onclick="redirectToLogin()" style="
          background: #2196F3;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        ">
          Sign In
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on outside click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      continueAsGuest();
    }
  });
}

// Helper functions for guest checkout prompt
function continueAsGuest() {
  const prompt = document.getElementById('guest-checkout-prompt');
  if (prompt) {
    prompt.remove();
  }
}

function redirectToSignup() {
  window.location.href = 'signup.html';
}

function redirectToLogin() {
  window.location.href = 'login.html';
}

function setupCartItemRemoval() {
  const removeButtons = document.querySelectorAll('.cart-item-remove');
  removeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const itemId = this.dataset.id;
      removeCartItem(itemId);
    });
  });
}

function setupCartQuantityControls() {
  // Handle quantity increase/decrease
  const quantityBtns = document.querySelectorAll('.quantity-btn');
  quantityBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const itemId = this.dataset.id;
      const isIncrease = this.classList.contains('increase');
      updateCartItemQuantity(itemId, isIncrease);
    });
  });
  
  // Handle direct quantity input
  const quantityInputs = document.querySelectorAll('.cart-item .quantity-input');
  quantityInputs.forEach(input => {
    input.addEventListener('change', function() {
      const itemId = this.dataset.id;
      const newQuantity = parseInt(this.value) || 1;
      setCartItemQuantity(itemId, newQuantity);
    });
  });
}

function updateCartItemQuantity(itemId, isIncrease) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemIndex = cart.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    if (isIncrease) {
      cart[itemIndex].quantity += 1;
    } else {
      cart[itemIndex].quantity = Math.max(1, cart[itemIndex].quantity - 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
}

function setCartItemQuantity(itemId, quantity) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemIndex = cart.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    cart[itemIndex].quantity = Math.max(1, quantity);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

// Add a global event listener to update the sell page total whenever the page is interacted with
document.addEventListener('click', function() {
  // This is a fallback to ensure the total updates
  setTimeout(updateSellPageTotal, 100);
});

// Call updateSellPageTotal periodically to ensure it's always up to date
setInterval(updateSellPageTotal, 1000);

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle functionality
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const mobileUserActions = document.getElementById('mobile-user-actions');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      
      // Toggle hamburger animation
      this.classList.toggle('active');
      
      // Show/hide mobile user actions
      if (mobileUserActions) {
        if (navLinks.classList.contains('active')) {
          navLinks.appendChild(mobileUserActions);
          mobileUserActions.style.display = 'flex';
        } else {
          mobileUserActions.style.display = 'none';
        }
      }
    });
  }
  
  // Close mobile menu when clicking on a link
  const navLinksItems = document.querySelectorAll('.nav-links a');
  navLinksItems.forEach(link => {
    link.addEventListener('click', function() {
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
        if (mobileUserActions) {
          mobileUserActions.style.display = 'none';
        }
      }
    });
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (navLinks && navLinks.classList.contains('active')) {
      if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
        if (mobileUserActions) {
          mobileUserActions.style.display = 'none';
        }
      }
    }
  });
  
  // Set active navigation link based on current page
  setActiveNavLink();
});

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a, .user-actions a');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const linkPage = link.getAttribute('href');
    
    if (linkPage === currentPage || 
        (currentPage === '' && linkPage === 'index.html') ||
        (currentPage === 'index.html' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });
}
  
  // Testimonial data
  const testimonials = [
    {
      quote: "I just wanna say thank you for what you do.",
      name: "Katie Turley Beckman",
      location: "Waco, Texas"
    },
    {
      quote: "The team was professional and quick to respond. I received payment the same day they received my supplies. Highly recommend!",
      name: "Michael T.",
      location: "Tulsa, OK"
    },
    {
      quote: "As a caregiver, I had extra supplies after my mother passed. This service helped me ensure they didn't go to waste and provided some financial relief.",
      name: "Jennifer K.",
      location: "Norman, OK"
    }
  ];
  
  // Get testimonial elements
  const quoteElement = document.getElementById('testimonial-quote');
  const nameElement = document.getElementById('testimonial-name');
  const locationElement = document.getElementById('testimonial-location');
  const navItems = document.querySelectorAll('.testimonial-nav-item');
  
  // Function to update testimonial
  function showTestimonial(index) {
    // Update testimonial content
    if (!quoteElement || !nameElement || !locationElement) {
      console.log('Testimonial element not found - skipping');
      return;
    }
    
    quoteElement.textContent = testimonials[index].quote;
    nameElement.textContent = testimonials[index].name;
    locationElement.textContent = testimonials[index].location;
    
    // Update active nav item
    navItems.forEach(item => item.classList.remove('active'));
    navItems[index].classList.add('active');
  }
  
  // Add click event listeners to nav items
  navItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      showTestimonial(index);
    });
  });
  
  // Show first testimonial by default
  showTestimonial(0);
;
