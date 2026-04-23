// bootstrap.js - Loader for shared.js
if (!window.shared) {
  const sharedScript = document.createElement('script');
  sharedScript.src = 'src/js/shared.js';
  sharedScript.onerror = () => {
    console.error('Failed to load shared.js');
  };
  document.head.appendChild(sharedScript);
}
