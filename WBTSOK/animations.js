document.addEventListener('DOMContentLoaded', function() {
  // Get main sections
  const heroSection = document.querySelector('.hero');
  const brandsSection = document.querySelector('.brand-grid');
  const howItWorksSection = document.querySelector('.how-it-works');
  
  // Get all fade-scroll elements
  const fadeElements = document.querySelectorAll('.fade-scroll');
  
  // Fade in the hero section immediately after page load
  setTimeout(function() {
    heroSection.style.opacity = 1;
  }, 100);
  
  // Use requestAnimationFrame for smoother animations
  let ticking = false;
  
  function updateAnimations() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    
    // Handle hero section fade
    const heroHeight = heroSection.offsetHeight;
    const heroProgress = Math.min(1, Math.max(0, scrollTop / (heroHeight * 0.8)));
    const heroOpacity = 1 - (heroProgress * 0.8); // Fade to 20% opacity
    heroSection.style.opacity = heroOpacity;
    
    // Handle brands section fade
    if (brandsSection) {
      const brandsRect = brandsSection.getBoundingClientRect();
      const brandsPosition = brandsRect.top / viewportHeight;
      
      // Calculate opacity based on position in viewport
      let brandsOpacity;
      
      // When entering viewport (position goes from 1.0 to 0.0)
      if (brandsPosition <= 1 && brandsPosition >= 0) {
        brandsOpacity = 1 - brandsPosition; // Fade in as it enters
      } 
      // When in middle of viewport (position goes from 0.0 to -1.0)
      else if (brandsPosition < 0 && brandsPosition >= -0.8) {
        brandsOpacity = 1; // Fully visible
      } 
      // When leaving viewport (position goes from -0.8 to -2.0)
      else if (brandsPosition < -0.8 && brandsPosition >= -2) {
        brandsOpacity = Math.max(0.2, 1 - Math.abs(brandsPosition + 0.8)); // Fade to 20%
      } 
      // When completely out of viewport
      else {
        brandsOpacity = 0.2; // Minimum opacity
      }
      
      brandsSection.style.opacity = brandsOpacity;
    }
    
    // Handle how it works section with similar logic
    if (howItWorksSection) {
      const howItWorksRect = howItWorksSection.getBoundingClientRect();
      const howItWorksPosition = howItWorksRect.top / viewportHeight;
      
      let howItWorksOpacity;
      
      if (howItWorksPosition <= 1 && howItWorksPosition >= 0) {
        howItWorksOpacity = 1 - howItWorksPosition; // Fade in
      } else if (howItWorksPosition < 0 && howItWorksPosition >= -0.8) {
        howItWorksOpacity = 1; // Fully visible
      } else if (howItWorksPosition < -0.8 && howItWorksPosition >= -2) {
        howItWorksOpacity = Math.max(0.2, 1 - Math.abs(howItWorksPosition + 0.8)); // Fade to 20%
      } else {
        howItWorksOpacity = 0.2; // Minimum opacity
      }
      
      howItWorksSection.style.opacity = howItWorksOpacity;
    }
    
    // Handle individual fade elements within sections
    fadeElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const elementPosition = rect.top / viewportHeight;
      
      // Similar logic for individual elements, but fade completely out
      let elementOpacity;
      
      if (elementPosition <= 1 && elementPosition >= 0) {
        elementOpacity = 1 - elementPosition; // Fade in
      } else if (elementPosition < 0 && elementPosition >= -1) {
        elementOpacity = 1; // Fully visible
      } else if (elementPosition < -1 && elementPosition >= -1.5) {
        elementOpacity = Math.max(0, 1 - Math.abs(elementPosition + 1) * 2); // Fade out completely
      } else {
        elementOpacity = 0; // Completely invisible
      }
      
      element.style.opacity = elementOpacity;
    });
    
    ticking = false;
  }
  
  // Handle scroll events with requestAnimationFrame for smoother performance
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateAnimations);
      ticking = true;
    }
  });
  
  // Initial update
  updateAnimations();
});
