// assets/js/bootstrap.js - Enhanced Portal Bootstrapper v2.0
// Loads critical assets, initializes icons, and kicks off shared.js

(function() {
  'use strict';
  
  // Preload critical assets
  const links = [
    { rel: 'preload', as: 'style', href: 'assets/css/style.css' },
    { rel: 'dns-prefetch', href: 'https://unpkg.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
  ];
  
  links.forEach(({ rel, as, href }) => {
    const link = document.createElement('link');
    link.rel = rel;
    if (as) link.as = as;
    link.href = href;
    document.head.appendChild(link);
  });
  
  // Load Lucide Icons
  const iconScript = document.createElement('script');
  iconScript.src = 'https://unpkg.com/lucide@latest';
  iconScript.onload = () => {
    if (window.lucide) {
      document.addEventListener('DOMContentLoaded', () => {
        lucide.createIcons();
      });
    }
  };
  document.head.appendChild(iconScript);
  
  // Load Tailwind (if not CDN in HTML)
  const tailwindScript = document.createElement('script');
  tailwindScript.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(tailwindScript);
  
  // Load enhanced shared.js
  const sharedScript = document.createElement('script');
  sharedScript.src = 'assets/js/shared.js';
  sharedScript.onerror = (e) => {
    console.error('❌ Critical: Failed to load shared.js', e);
    document.body.innerHTML += '<div style="position:fixed;top:20px;right:20px;background:red;color:white;padding:1rem;border-radius:8px;z-index:9999">Core system failed to load. Refresh page.</div>';
  };
  document.head.appendChild(sharedScript);
  
  console.log('🚀 Bootstrap v2.0: Critical assets preloading...');
  
  // PWA Install Prompt (enhanced)
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
  
  window.installPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => deferredPrompt = null);
    }
  };
  
})();

