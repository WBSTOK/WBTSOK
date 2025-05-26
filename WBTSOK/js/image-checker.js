document.addEventListener('DOMContentLoaded', function() {
  // Check all images
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    img.addEventListener('error', function() {
      console.error('Failed to load image:', img.src);
      img.style.border = '2px solid red';
      img.style.padding = '10px';
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.display = 'flex';
      img.style.justifyContent = 'center';
      img.style.alignItems = 'center';
      img.style.backgroundColor = '#ffdddd';
      img.style.color = 'red';
      img.alt = 'Image failed to load: ' + img.src;
    });
  });
  
  // Check background images
  const elementsWithBgImage = [
    { selector: '.hero', property: 'background-image' },
    { selector: '.brand-grid', property: 'background-image' },
    { selector: '.cta-section', property: 'background-image' }
  ];
  
  elementsWithBgImage.forEach(item => {
    const elements = document.querySelectorAll(item.selector);
    elements.forEach(el => {
      const style = getComputedStyle(el);
      const bgImage = style.getPropertyValue(item.property);
      if (bgImage === 'none' || bgImage === '') {
        console.error('Background image missing for:', item.selector);
        el.style.border = '2px solid red';
        el.style.position = 'relative';
        
        const errorMsg = document.createElement('div');
        errorMsg.textContent = 'Background image missing';
        errorMsg.style.position = 'absolute';
        errorMsg.style.top = '10px';
        errorMsg.style.left = '10px';
        errorMsg.style.backgroundColor = 'rgba(255,0,0,0.7)';
        errorMsg.style.color = 'white';
        errorMsg.style.padding = '5px 10px';
        errorMsg.style.borderRadius = '3px';
        errorMsg.style.zIndex = '1000';
        
        el.appendChild(errorMsg);
      }
    });
  });
});