// pages/home.js - Home Module with reveal animations

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
    el.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    observer.observe(el);
  });
}

function initTiltCards() {
  document.querySelectorAll('.mos-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

function initModals() {
  // Apply Modal
  const applyModal = document.getElementById('apply-modal');
  const openApplyBtns = document.querySelectorAll('#open-apply-modal, #open-apply-modal-mobile, #open-apply-modal-sticky');
  const closeApplyBtn = document.getElementById('close-apply-modal');
  const applyForm = document.getElementById('apply-modal-form');
  
  if (applyModal) {
    openApplyBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', (e) => {
        e.preventDefault();
        applyModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    });
    
    closeApplyBtn?.addEventListener('click', () => {
      applyModal.classList.add('hidden');
      document.body.style.overflow = '';
    });
    
    applyModal.addEventListener('click', (e) => {
      if (e.target === applyModal) {
        applyModal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
    
    applyForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.shared?.showToast) {
        window.shared.showToast('✅ Message sent to recruiting team!', 'success');
      }
      applyForm.reset();
      applyModal.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }
  
  // MOS Modal
  const mosModal = document.getElementById('mos-modal');
  if (mosModal) {
    mosModal.addEventListener('click', (e) => {
      if (e.target === mosModal) {
        closeMosModal();
      }
    });
  }
}

function closeMosModal() {
  const mosModal = document.getElementById('mos-modal');
  if (mosModal) {
    mosModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function toggleFavorite(eventOrMos, mos, title) {
  if (eventOrMos?.stopPropagation) eventOrMos.stopPropagation();
  if (window.shared?.toggleFavorite) {
    window.shared.toggleFavorite(mos, title);
  }
}

function openMosModal(mos) {
  // This is typically called from careers.js, but keeping it available globally
  const mosModal = document.getElementById('mos-modal');
  if (mosModal && window.careersModule?.openMosModal) {
    window.careersModule.openMosModal(mos);
  }
}

window.homeModule = {
  init() {
    console.log('🚀 Initializing home module');
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    // Initialize all interactions
    initScrollReveal();
    initTiltCards();
    initModals();
    
    console.log('✅ Home module ready');
  }
};

