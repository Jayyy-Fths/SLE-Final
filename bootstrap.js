// bootstrap.js - Minimal loader (replaces script.js)
// Loads shared.js + auto-detects page module via router

// 1. Load shared.js (handles theme/lang/nav/toast + page router)
if (!window.shared) {
  const sharedScript = document.createElement('script');
  sharedScript.src = 'shared.js';
  sharedScript.onload = () => {
    // Auto-init page module after shared ready
    const page = document.body.dataset.page || 'home';
    const moduleName = `${page}Module`;
    if (window[moduleName]?.init) {
      window[moduleName].init();
      console.log(`🚀 ${page.charAt(0).toUpperCase() + page.slice(1)} module initialized`);
    }
  };
  document.head.appendChild(sharedScript);
}

// 2. Page-specific module (router will auto-init after shared.js loads)
document.body.dataset.page = window.shared?.pageRouter?.detectPage() || 'home';

// 3. Lucide icons (global)
if (typeof lucide !== 'undefined') lucide.createIcons();

// Ready signal
console.log('🚀 Bootstrap complete - shared router will init page module');

