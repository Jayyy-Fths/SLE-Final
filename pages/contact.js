// pages/contact.js - Contact/Recruitment Form Module

window.contactModule = {
  init() {
    // Initialize Lucide icons for this page
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    // Initialize form handlers
    initContactForm();
    
    console.log('✅ Contact module initialized');
  }
};

function initContactForm() {
  // Initialize any contact form event listeners
  const contactForm = document.getElementById('contact-form');
  const contactStepForm = document.getElementById('contact-step-form');
  const contactInterestsForm = document.getElementById('contact-interests-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }
  
  if (contactStepForm) {
    contactStepForm.addEventListener('submit', handleStepSubmit);
  }
  
  if (contactInterestsForm) {
    contactInterestsForm.addEventListener('submit', handleInterestsSubmit);
  }
}

function handleContactSubmit(e) {
  e.preventDefault();
  if (window.shared?.showToast) {
    window.shared.showToast('✅ Message sent to recruiting team!', 'success');
  }
}

function handleStepSubmit(e) {
  e.preventDefault();
  if (window.shared?.showToast) {
    window.shared.showToast('✅ Step completed!', 'success');
  }
}

function handleInterestsSubmit(e) {
  e.preventDefault();
  if (window.shared?.showToast) {
    window.shared.showToast('✅ Message sent to recruiting team!', 'success');
  }
}
