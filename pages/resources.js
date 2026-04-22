// pages/resources.js - Resources & FAQ Module

window.resourcesModule = {
  init() {
    // Initialize Lucide icons for this page
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    // Initialize accordion functionality if present
    initAccordions();
    
    console.log('✅ Resources module initialized');
  }
};

function initAccordions() {
  document.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
    trigger.addEventListener('click', function() {
      const content = this.nextElementSibling;
      const isOpen = content.style.display === 'block';
      
      // Close all other accordions
      document.querySelectorAll('[data-accordion-content]').forEach(el => {
        el.style.display = 'none';
      });
      
      // Toggle current
      content.style.display = isOpen ? 'none' : 'block';
    });
  });
}
