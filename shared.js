// shared.js - Core shared runtime for NJ Guard multi-page portal
// Handles theme, language, shared components, toast notifications, and page-module bootstrapping.

(() => {
  'use strict';

  const STORAGE_KEYS = {
    theme: 'darkMode',
    language: 'pageLanguage',
    favorites: 'favoriteMOS'
  };

  const SUPPORTED_LANGUAGES = new Set(['en', 'es']);
  const PAGE_MAP = {
    index: 'home',
    careers: 'careers',
    armories: 'armories',
    eligibility: 'eligibility',
    contact: 'contact',
    about: 'about',
    resources: 'resources'
  };

  const state = {
    language: 'en',
    isDarkMode: true,
    pageScripts: new Map(),
    listenersBound: false
  };

  function safeStorageGet(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }

  function safeStorageJSONGet(key, fallback) {
    const raw = safeStorageGet(key, null);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function renderIcons() {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }

  // =========================
  // Theme
  // =========================
  function applyTheme(isDarkMode) {
    state.isDarkMode = Boolean(isDarkMode);
    document.body.classList.toggle('light-theme', !state.isDarkMode);
    safeStorageSet(STORAGE_KEYS.theme, String(state.isDarkMode));

    const iconName = state.isDarkMode ? 'sun' : 'moon';
    document.querySelectorAll('[data-theme-icon]').forEach((icon) => {
      icon.dataset.lucide = iconName;
    });
    renderIcons();
  }

  function initTheme() {
    const saved = safeStorageGet(STORAGE_KEYS.theme, 'true');
    applyTheme(saved !== 'false');
  }

  function toggleTheme() {
    applyTheme(!state.isDarkMode);
  }

  // =========================
  // Language
  // =========================
  function normalizeLanguage(lang) {
    return SUPPORTED_LANGUAGES.has(lang) ? lang : 'en';
  }

  function updateLanguageButtonLabels() {
    const nextLang = state.language === 'en' ? 'ES' : 'EN';
    document.querySelectorAll('#language-toggle, #language-toggle-mobile').forEach((button) => {
      button.textContent = nextLang;
      button.setAttribute('aria-label', `Switch language to ${nextLang}`);
    });
  }

  function setLanguage(lang) {
    state.language = normalizeLanguage(lang);
    safeStorageSet(STORAGE_KEYS.language, state.language);
    document.documentElement.lang = state.language;
    updateLanguageButtonLabels();
    document.dispatchEvent(new CustomEvent('languageChange', { detail: { lang: state.language } }));
  }

  function loadLanguage() {
    setLanguage(safeStorageGet(STORAGE_KEYS.language, 'en'));
  }

  function toggleLanguage() {
    setLanguage(state.language === 'en' ? 'es' : 'en');
  }

  // =========================
  // Favorites
  // =========================
  function getFavorites() {
    const data = safeStorageJSONGet(STORAGE_KEYS.favorites, []);
    return Array.isArray(data) ? data : [];
  }

  function saveFavorites(favorites) {
    safeStorageSet(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }

  function toggleFavorite(mos, title) {
    if (!mos) return;

    const favorites = getFavorites();
    const index = favorites.findIndex((item) => item?.mos === mos);

    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push({ mos, title: title || mos });
    }

    saveFavorites(favorites);
    document.dispatchEvent(new CustomEvent('favoritesUpdate', { detail: { favorites } }));
  }

  // =========================
  // Shared components + listeners
  // =========================
  async function loadHTML(url) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    return response.text();
  }

  async function injectComponent(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container || container.childElementCount > 0) return;

    try {
      container.innerHTML = await loadHTML(filePath);
    } catch (error) {
      console.warn(`⚠️ Component load failed for ${filePath}`, error);
    }
  }

  async function loadComponents() {
    await Promise.all([
      injectComponent('navbar-container', 'components/navbar.html'),
      injectComponent('footer-container', 'components/footer.html')
    ]);

    bindSharedListeners();
    renderIcons();
  }

  function bindSharedListeners() {
    // re-bind every time components are injected to avoid stale handlers,
    // but avoid duplicate handlers by replacing click listeners through .onclick
    const themeButtons = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    themeButtons.forEach((button) => {
      button.onclick = toggleTheme;
      const icon = button.querySelector('i');
      if (icon) {
        icon.setAttribute('data-theme-icon', 'true');
      }
    });

    const languageButtons = document.querySelectorAll('#language-toggle, #language-toggle-mobile');
    languageButtons.forEach((button) => {
      button.onclick = toggleLanguage;
    });

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
      menuToggle.onclick = () => {
        const menu = document.getElementById('mobile-menu');
        if (!menu) return;
        const isOpen = !menu.classList.contains('hidden');
        menu.classList.toggle('hidden');
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
        menu.setAttribute('aria-hidden', String(isOpen));
      };
    }

    updateLanguageButtonLabels();
  }

  // =========================
  // UX helpers
  // =========================
  function showToast(message, type = 'success') {
    if (!message) return;

    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast toast-${type} show fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl max-w-sm backdrop-blur`;

    window.clearTimeout(showToast._timeoutId);
    showToast._timeoutId = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  function initScrollProgress() {
    const progress = document.getElementById('scroll-progress');
    if (!progress) return;

    const renderProgress = () => {
      const maxScrollable = document.documentElement.scrollHeight - window.innerHeight;
      const percent = maxScrollable > 0 ? (window.scrollY / maxScrollable) * 100 : 0;
      progress.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    };

    renderProgress();
    window.addEventListener('scroll', renderProgress, { passive: true });
    window.addEventListener('resize', renderProgress);
  }

  // =========================
  // Page router + module loading
  // =========================
  function detectPage() {
    const fromData = (document.body.dataset.page || '').trim().toLowerCase();
    if (fromData) return fromData;

    const fileName = (window.location.pathname.split('/').pop() || 'index.html').replace('.html', '').toLowerCase();
    return PAGE_MAP[fileName] || fileName || 'home';
  }

  function loadPageScript(page) {
    if (!page) return Promise.resolve();

    if (state.pageScripts.has(page)) {
      return state.pageScripts.get(page);
    }

    const modulePath = `pages/${page}.js`;

    const loadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-page-script="${page}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }

        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${modulePath}`)), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = modulePath;
      script.defer = true;
      script.dataset.pageScript = page;

      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };

      script.onerror = () => {
        state.pageScripts.delete(page);
        reject(new Error(`Failed to load ${modulePath}`));
      };

      document.head.appendChild(script);
    });

    state.pageScripts.set(page, loadPromise);
    return loadPromise;
  }

  async function initPageModule(page) {
    const moduleName = `${page}Module`;

    if (!window[moduleName]) {
      try {
        await loadPageScript(page);
      } catch (error) {
        console.error(`❌ Could not load script for page module "${moduleName}"`, error);
        return;
      }
    }

    const module = window[moduleName];
    if (!module?.init || typeof module.init !== 'function') {
      console.warn(`⚠️ No usable module found for page: ${page}`);
      return;
    }

    try {
      await module.init();
      console.log(`✅ ${moduleName} initialized`);
    } catch (error) {
      console.error(`❌ Error while initializing ${moduleName}`, error);
      showToast('Page initialization failed. Please refresh.', 'error');
    }
  }

  // =========================
  // Shared public API
  // =========================
  function getSharedAPI() {
    return {
      getFavorites,
      toggleFavorite,
      setLanguage,
      showToast,
      pageRouter: {
        detectPage,
        initPageModule,
        loadPageScript
      },
      get isDarkMode() {
        return state.isDarkMode;
      },
      get language() {
        return state.language;
      }
    };
  }

  // =========================
  // Boot sequence
  // =========================
  async function boot() {
    initTheme();
    loadLanguage();

    await loadComponents();

    if (!state.listenersBound) {
      bindSharedListeners();
      state.listenersBound = true;
    }

    initScrollProgress();

    window.shared = getSharedAPI();

    const page = detectPage();
    await initPageModule(page);

    console.log('🚀 shared.js boot complete');
  }

  document.addEventListener('DOMContentLoaded', () => {
    boot().catch((error) => {
      console.error('❌ Shared boot failed', error);
    });
  });
})();
