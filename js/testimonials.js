document.addEventListener("DOMContentLoaded", function() {
  // Get testimonial elements
  const testimonialQuote = document.getElementById("testimonial-quote");
  const testimonialName = document.getElementById("testimonial-name");
  const testimonialLocation = document.getElementById("testimonial-location");
  const navItems = document.querySelectorAll(".testimonial-nav-item");
  
  console.log("Testimonials.js loaded");
  console.log("Elements found:", {
    quote: testimonialQuote,
    name: testimonialName,
    location: testimonialLocation,
    navItems: navItems.length
  });
  
  // Testimonial data
  const testimonials = [
    {
      quote: "I had boxes of test strips that were just going to expire. We Buy Test Strips Oklahoma gave me a fair price and made the process so easy!",
      name: "Sarah M.",
      location: "Oklahoma City, OK"
    },
    {
      quote: "Great service and fast payment! I was skeptical at first, but they made the whole process simple and paid me quickly.",
      name: "Michael T.",
      location: "Tulsa, OK"
    },
    {
      quote: "I appreciate how transparent they are about their pricing. No hidden fees or surprises - just honest business.",
      name: "Jennifer K.",
      location: "Norman, OK"
    }
  ];
  
  // Add click event to each nav item
  navItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      console.log("Nav item clicked:", index);
      
      // Update active class
      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");
      
      // Update testimonial content with animation
      testimonialQuote.style.opacity = 0;
      testimonialName.style.opacity = 0;
      testimonialLocation.style.opacity = 0;
      
      setTimeout(() => {
        testimonialQuote.textContent = testimonials[index].quote;
        testimonialName.textContent = testimonials[index].name;
        testimonialLocation.textContent = testimonials[index].location;
        
        testimonialQuote.style.opacity = 1;
        testimonialName.style.opacity = 1;
        testimonialLocation.style.opacity = 1;
        
        console.log("Testimonial updated to:", testimonials[index]);
      }, 300);
    });
  });
});
