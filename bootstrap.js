// bootstrap.js - Minimal loader
// Loads shared.js which handles theme, language, nav, page routing, and component loading

if (!window.shared) {
  const sharedScript = document.createElement('script');
  sharedScript.src = 'shared.js';
  sharedScript.onerror = () => {
    console.error('❌ Failed to load shared.js');
  };
  document.head.appendChild(sharedScript);
}

// Initialize Lucide icons globally
if (typeof lucide !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
  });
}

console.log('🚀 Bootstrap loaded - shared.js will initialize page');


