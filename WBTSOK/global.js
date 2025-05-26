document.addEventListener('DOMContentLoaded', function() {
  // Check if user has already accepted cookies
  if (!localStorage.getItem('cookieConsent')) {
    // Create cookie consent banner
    const cookieBanner = document.createElement('div');
    cookieBanner.className = 'cookie-banner';
    cookieBanner.innerHTML = `
      <p>We use cookies to improve your experience. By using our site, you agree to our 
         <a href="privacy.html">Privacy Policy</a>.
      </p>
      <button id="accept-cookies">Accept</button>
    `;
    
    document.body.appendChild(cookieBanner);
    
    // Add event listener to accept button
    document.getElementById('accept-cookies').addEventListener('click', function() {
      localStorage.setItem('cookieConsent', 'true');
      cookieBanner.remove();
    });
  }
});