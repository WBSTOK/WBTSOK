document.addEventListener('DOMContentLoaded', function() {
  // Get main sections
  const heroSection = document.querySelector('.hero');
  const fadeElements = document.querySelectorAll('.fade-scroll');
  
  // Fade in the hero section immediately after page load
  if (heroSection) {
    setTimeout(function() {
      heroSection.style.opacity = 1;
    }, 100);
  }
  
  // Handle scroll animations
  function handleScrollAnimations() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    
    // Handle hero section fade
    if (heroSection) {
      const heroHeight = heroSection.offsetHeight;
      const heroProgress = Math.min(1, Math.max(0, scrollTop / (heroHeight * 0.8)));
      const heroOpacity = 1 - (heroProgress * 0.8); // Fade to 20% opacity
      heroSection.style.opacity = heroOpacity;
    }
    
    // Handle fade-in elements
    fadeElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementVisible = 150;
      
      if (elementTop < viewportHeight - elementVisible) {
        element.classList.add('visible');
      }
    });
  }
  
  // Initial check
  handleScrollAnimations();
  
  // Add scroll event listener
  window.addEventListener('scroll', function() {
    handleScrollAnimations();
  });
});