// assets/js/shared.js - Enhanced Core Logic for NJ Guard Portal v2.0
// Theme, Language, Router, Favorites, Components Loader
// Improved: Better error handling, PWA ready, i18n stub

const SUPPORTED_LANGUAGES = new Set(['en', 'es']);
let currentLanguage = 'en';
let isDarkMode = true;

const I18N_STRINGS = {
  en: {
    // Stub - expand per page
    'nav.home': 'Home',
    'nav.careers': 'Careers',
    'apply.now': 'Apply Now'
  },
  es: {
    'nav.home': 'Inicio',
    'nav.careers': 'Carreras',
    'apply.now': 'Aplicar Ahora'
  }
};

// ========================================
// Storage Utils (Error-safe)
// ========================================
function safeStorageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : fallback;
  } catch (e) {
    console.warn('Storage read failed:', key, e);
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('Storage write failed:', key, e);
  }
}

// ========================================
// Theme System (Improved)
// ========================================
function initTheme() {
  const saved = safeStorageGet('darkMode', 'true');
  isDarkMode = saved !== 'false';
  document.body.classList.toggle('light-theme', !isDarkMode);
  updateThemeIcons();
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('light-theme', !isDarkMode);
  safeStorageSet('darkMode', String(isDarkMode));
  updateThemeIcons();
  showToast(`Theme switched to ${isDarkMode ? 'Dark' : 'Light'} mode`, 'info');
}

function updateThemeIcons() {
  const icons = document.querySelectorAll('#theme-toggle i');
  icons.forEach(icon => {
    icon.dataset.lucide = isDarkMode ? 'sun' : 'moon';
  });
  if (window.lucide?.createIcons) {
    lucide.createIcons();
  }
}

// ========================================
// Language System + i18n Stub
// ========================================
function loadLanguage() {
  currentLanguage = safeStorageGet('pageLanguage', 'en');
  if (!SUPPORTED_LANGUAGES.has(currentLanguage)) currentLanguage = 'en';
  document.documentElement.lang = currentLanguage;
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.has(lang)) lang = 'en';
  currentLanguage = lang;
  safeStorageSet('pageLanguage', lang);
  document.dispatchEvent(new CustomEvent('languageChange', { detail: { lang } }));
  updateI18n();
}

function toggleLanguage() {
  setLanguage(currentLanguage === 'en' ? 'es' : 'en');
}

function updateI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = I18N_STRINGS[currentLanguage]?.[key] || key;
  });
}

// ========================================
// Favorites System
// ========================================
function getFavorites() {
  try {
    return JSON.parse(safeStorageGet('favoriteMOS', '[]') || '[]');
  } catch {
    return [];
  }
}

function saveFavorites(favs) {
  safeStorageSet('favoriteMOS', JSON.stringify(favs));
}

function toggleFavorite(mos, title) {
  const favs = getFavorites();
  const index = favs.findIndex(f => f.mos === mos);
  if (index > -1) {
    favs.splice(index, 1);
  } else if (favs.length < 5) {
    favs.unshift({ mos, title, timestamp: Date.now() });
  } else {
    showToast('Max 5 favorites. Remove one first.', 'info');
    return;
  }
  saveFavorites(favs);
  document.dispatchEvent(new CustomEvent('favoritesUpdate'));
}

// ========================================
// Component Loader (Dynamic Nav/Footer)
// ========================================
async function loadComponents() {
  const navContainer = document.getElementById('navbar-container');
  const footerContainer = document.getElementById('footer-container');
  
  if (navContainer && !navContainer.children.length) {
    try {
      const response = await fetch('assets/components/navbar.html');
      if (response.ok) navContainer.innerHTML = await response.text();
    } catch (e) {
      console.error('Nav load failed:', e);
    }
  }
  
  if (footerContainer && !footerContainer.children.length) {
    try {
      const response = await fetch('assets/components/footer.html');
      if (response.ok) footerContainer.innerHTML = await response.text();
    } catch (e) {
      console.error('Footer load failed:', e);
    }
  }
  
  initSharedListeners();
}

// ========================================
// Event Listeners
// ========================================
function initSharedListeners() {
  // Theme
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  document.querySelectorAll('#language-toggle, #language-toggle-mobile')?.forEach(btn => 
    btn.addEventListener('click', toggleLanguage)
  );
  
  // Mobile menu
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
  });
}

// ========================================
// Toast System
// ========================================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast-notification') || createToastElement();
  toast.textContent = message;
  toast.className = `toast toast-${type} show z-[10000]`;
  
  setTimeout(() => toast.classList.remove('show'), 4000);
}

function createToastElement() {
  const toast = document.createElement('div');
  toast.id = 'toast-notification';
  document.body.appendChild(toast);
  return toast;
}

// ========================================
// Scroll Progress
// ========================================
function initScrollProgress() {
  let ticking = false;
  function updateProgress() {
    const progress = document.getElementById('scroll-progress');
    if (!progress) return;
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progress.style.width = scrolled + '%';
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  });
}

// ========================================
// Enhanced Page Router
// ========================================
const loadedScripts = new Set();
const pageMap = {
  '/': 'home',
  'index.html': 'home',
  'careers.html': 'careers',
  'armories.html': 'armories',
  'eligibility.html': 'eligibility',
  'contact.html': 'contact',
  'about.html': 'about',
  'resources.html': 'resources'
};

function detectPage() {
  const path = window.location.pathname.split('/').pop().replace('.html', '');
  const dataPage = document.body.dataset.page || '';
  return pageMap[path] || dataPage.toLowerCase().replace(/[^a-z]/g, '') || 'home';
}

async function loadPageScript(page) {
  if (loadedScripts.has(page)) return;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `assets/js/pages/${page}.js`;
    script.dataset.pageScript = page;
    script.async = true;
    
    script.onload = () => {
      loadedScripts.add(page);
      resolve();
    };
    
    script.onerror = () => reject(new Error(`Failed to load ${page}.js`));
    
    document.head.appendChild(script);
  });
}

async function initPageModule(page) {
  try {
    await loadPageScript(page);
    const module = window[`${page.charAt(0).toUpperCase() + page.slice(1)}Module`];
    if (module?.init) {
      await module.init();
      console.log(`✅ ${page} module initialized`);
    }
  } catch (e) {
    console.error(`❌ ${page} module failed:`, e);
    showToast(`Page feature unavailable: ${page}`, 'info');
  }
}

// ========================================
// PWA Ready (Bonus)
// ========================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ========================================
// Main Init
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  loadLanguage();
  updateI18n();
  await loadComponents();
  initScrollProgress();
  initSharedListeners();
  
  // Global API
  window.shared = {
    getFavorites,
    toggleFavorite,
    setLanguage,
    showToast,
    updateI18n,
    pageRouter: { detectPage, initPageModule }
  };
  
  // Auto-init current page
  const page = detectPage();
  await initPageModule(page);
  
  console.log('🚀 Portal v2.0 initialized | Page:', page);
});
