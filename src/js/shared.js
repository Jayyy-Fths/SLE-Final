// shared.js - Common logic for multi-page NJ Guard portal
// Theme, language, nav/footer load, favorites sync

const SUPPORTED_LANGUAGES = new Set(['en', 'es']);
let currentLanguage = 'en';
let isDarkMode = true;

// ========================================

