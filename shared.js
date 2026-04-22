// shared.js - Common logic for multi-page NJ Guard portal
// Theme, language, nav/footer load, favorites sync

const SUPPORTED_LANGUAGES = new Set(['en', 'es']);
let currentLanguage = 'en';
let isDarkMode = true;

// ========================================
// Storage Utils
// ========================================
function safeStorageGet(key, fallback = null) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

// ========================================
// Theme System
// ========================================
function initTheme() {
  const saved = safeStorageGet('darkMode', 'true');
  isDarkMode = saved !== 'false';
  document.body.classList.toggle('light-theme', !isDarkMode);
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('light-theme', !isDarkMode);
  safeStorageSet('darkMode', String(isDarkMode));
  
  // Update toggle icon
  const toggles = document.querySelectorAll('#theme-toggle i');
  toggles.forEach(icon => {
    icon.dataset.lucide = isDarkMode ? 'sun' : 'moon';
  });
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

// ========================================
// Language System
// ========================================
function loadLanguage() {
  currentLanguage = safeStorageGet('pageLanguage', 'en');
  if (!SUPPORTED_LANGUAGES.has(currentLanguage)) currentLanguage = 'en';
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.has(lang)) lang = 'en';
  currentLanguage = lang;
  safeStorageSet('pageLanguage', lang);
  document.documentElement.lang = lang;
  // Trigger i18n update in page-specific scripts
  document.dispatchEvent(new CustomEvent('languageChange', { detail: { lang } }));
}

function toggleLanguage() {
  setLanguage(currentLanguage === 'en' ? 'es' : 'en');
}

// ========================================
// Favorites Sync (MOS)
// ========================================
function getFavorites() {
  return JSON.parse(safeStorageGet('favoriteMOS', '[]') || '[]');
}

function saveFavorites(favs) {
  safeStorageSet('favoriteMOS', JSON.stringify(favs));
}

function toggleFavorite(mos, title) {
  const favs = getFavorites();
  const index = favs.findIndex(f => f.mos === mos);
  if (index > -1) {
    favs.splice(index, 1);
  } else {
    favs.push({ mos, title });
  }
  saveFavorites(favs);
  document.dispatchEvent(new CustomEvent('favoritesUpdate'));
}

// ========================================
// Nav/Footer Loader
// ========================================
async function loadComponents() {
  const navContainer = document.getElementById('navbar-container');
  const footerContainer = document.getElementById('footer-container');
  
  if (navContainer && !navContainer.hasChildNodes()) {
    try {
      const navResp = await fetch('components/navbar.html');
      navContainer.innerHTML = await navResp.text();
    } catch {}
  }
  
  if (footerContainer && !footerContainer.hasChildNodes()) {
    try {
      const footerResp = await fetch('components/footer.html');
      footerContainer.innerHTML = await footerResp.text();
    } catch {}
  }
  
  // Re-init listeners after load
  initSharedListeners();
}

function initSharedListeners() {
  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('language-toggle')?.addEventListener('click', toggleLanguage);
  
  // Mobile menu
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
  });
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, type = 'success') {
  // Create toast if not exists
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast toast-success fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl max-w-sm';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.className = `toast toast-${type} show fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl max-w-sm backdrop-blur`;
  
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ========================================
// Scroll Progress
// ========================================
function initScrollProgress() {
  window.addEventListener('scroll', () => {
    const progress = document.getElementById('scroll-progress');
    if (!progress) return;
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progress.style.width = scrolled + '%';
  });
}

// ========================================
// Page Detection + Auto-Init Router
// ========================================
function detectPage() {
  const pageData = document.body.dataset.page || document.title.toLowerCase().split(' | ')[0] || '';
  const path = window.location.pathname.split('/').pop().replace('.html', '');
  const pageMap = {
    'index': 'home',
    'careers': 'careers',
    'armories': 'armories',
    'eligibility': 'eligibility',
    'contact': 'contact',
    'about': 'about',
    'resources': 'resources'
  };
  const detected = pageMap[path] || pageData.toLowerCase().replace(/[^a-z]/g, '') || 'home';
  return detected;
}

async function initPageModule(page) {
  const moduleName = `${page}Module`;
  if (window[moduleName]?.init) {
    try {
      await window[moduleName].init();
      console.log(`✅ ${page.charAt(0).toUpperCase() + page.slice(1)} module loaded`);
    } catch (err) {
      console.error(`❌ ${page} module error:`, err);
    }
  } else {
    console.warn(`⚠️ No ${moduleName} found for page: ${page}`);
  }
}

// ========================================
// INIT - Run on all pages
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  loadLanguage();
  await loadComponents();
  initScrollProgress();
  initSharedListeners();
  
  // Expose globals for page scripts
  window.shared = {
    getFavorites,
    toggleFavorite,
    setLanguage,
    showToast,
    isDarkMode,
    pageRouter: {
      detectPage,
      initPageModule
    }
  };
  
  console.log('🚀 Shared.js initialized');
  
  // AUTO-INIT PAGE MODULE after shared setup
  const page = detectPage();
  await initPageModule(page);
});


