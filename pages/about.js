// pages/about.js - About Page Module

window.aboutModule = {
  init() {
    // Initialize Lucide icons for this page
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    // Initialize any scroll reveal animations
    initScrollReveal();
    
    console.log('✅ About module initialized');
  }
};

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('[data-reveal]').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.5s ease';
    observer.observe(el);
  });
}
