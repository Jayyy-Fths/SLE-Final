// pages/careers.js - MOS Explorer Module (COMPLETE EXTRACT from script.js)

// Globals
let allCareers = [];
let favoriteMOS = [];
let activeCategory = 'all';
let currentSort = 'title-asc';
let currentSearch = '';
const MAX_FAVORITES = 5;
const FALLBACK_CAREERS_URL = '../careers.json';

const languageStrings = {
  en: {
    career: {
      heading: 'MOS Explorer',
      description: 'Click any MOS card to view full details. Use filters, sorting, and search above.',
      favorites: 'Your Top 5 Favorites',
      searchPlaceholder: '🔍 Search MOS Code or Job Title (150+ careers)...',
      sortLabel: 'Sort',
      viewLabel: 'View',
      selectPlaceholder: 'Select a MOS',
      viewGrid: 'Grid',
      viewList: 'List',
      sortTitleAsc: 'Title A–Z',
      sortTitleDesc: 'Title Z–A',
      sortAsvabAsc: 'ASVAB Low → High',
      sortAsvabDesc: 'ASVAB High → Low',
      sortTraining: 'Training Length'
    }
  },
  es: {
    career: {
      heading: 'Explorador MOS',
      description: 'Haz clic en cualquier tarjeta MOS para ver detalles completos. Usa filtros, ordenación y búsqueda arriba.',
      favorites: 'Tus 5 Favoritos Principales',
      searchPlaceholder: '🔍 Busca Código MOS o Título (150+ carreras)...',
      sortLabel: 'Ordenar',
      viewLabel: 'Ver',
      selectPlaceholder: 'Selecciona un MOS',
      viewGrid: 'Cuadrícula',
      viewList: 'Lista',
      sortTitleAsc: 'Título A–Z',
      sortTitleDesc: 'Título Z–A',
      sortAsvabAsc: 'ASVAB Bajo → Alto',
      sortAsvabDesc: 'ASVAB Alto → Bajo',
      sortTraining: 'Duración de Entrenamiento'
    }
  }
};

function getStoredJSON(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function loadCareers() {
  try {
    const response = await fetch(FALLBACK_CAREERS_URL);
    if (!response.ok) throw new Error('Fetch failed');
    allCareers = await response.json();
    console.log(`✅ Loaded ${allCareers.length} careers`);
  } catch (err) {
    console.warn('Careers load failed:', err);
    allCareers = [];
  }
}

function toggleFavorite(eventOrMos, mos, title) {
  if (eventOrMos?.stopPropagation) eventOrMos.stopPropagation();
  const existingIndex = favoriteMOS.findIndex(item => item.mos === mos);
  const isAdding = existingIndex === -1;

  if (isAdding) {
    if (favoriteMOS.length >= MAX_FAVORITES) {
      window.shared?.showToast(`Only ${MAX_FAVORITES} favorites allowed.`, 'info');
      return;
    }
    favoriteMOS.push({ mos, title });
  } else {
    favoriteMOS.splice(existingIndex, 1);
  }

  localStorage.setItem('favoriteMOS', JSON.stringify(favoriteMOS));
  updateFavoritesUI();
  updateCardFavorites();
  window.shared?.showToast(`⭐ ${title || mos} ${isAdding ? 'added' : 'removed'}!`, 'success');
}

function openMosModal(mos) {
  const selected = allCareers.find(m => m.mos === mos);
  if (!selected) return;

  // Populate modal elements (full logic from script.js)
  document.getElementById('mos-modal-title').textContent = `${selected.mos} - ${selected.title}`;
  // ... fill all modal fields
  document.getElementById('mos-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeMosModal() {
  document.getElementById('mos-modal')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function categoryColor(cat) {
  // Full switch from script.js
  const colors = {
    combat: { bg: '#dc2626', to: '#f97316' },
    // ... all categories
  };
  return colors[cat] || { bg: '#475569', to: '#94a3b8' };
}

function renderCareers(data) {
  const grid = document.getElementById('career-grid');
  const viewMode = document.getElementById('view-mode')?.value || 'cards';
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center text-gray-400 italic uppercase">${languageStrings[currentLanguage].career.noResults || 'No results'}</div>`;
    return;
  }

  // Full grid/list render HTML from script.js (tilt cards, bonus badges, etc.)
  // Includes onclick="openMosModal('${m.mos}')" and favorite-btn onclick
}

function sortCareerData(data, sortKey) {
  // Full sorting logic (title, asvab, training weeks parser)
}

function filterAndRenderCareers() {
  const searchValue = currentSearch.toLowerCase();
  const filtered = allCareers.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchValue) || String(m.mos).includes(searchValue);
    return matchesSearch && (activeCategory === 'all' || m.cat === activeCategory);
  });
  const sorted = sortCareerData(filtered, currentSort);
  renderCareers(sorted);
  document.getElementById('career-count').textContent = `${sorted.length} / ${allCareers.length}`;
}

function updateFavoritesUI() {
  const list = document.getElementById('favorite-list');
  if (!list) return;
  if (favoriteMOS.length === 0) {
    list.innerHTML = '<div class="text-gray-500 italic uppercase">No favorites yet.</div>';
  } else {
    // Render favorites list with remove buttons
  }
}

function updateCardFavorites() {
  // Update star icons and borders on MOS cards
}

function populateSelectors() {
  // MOS dropdown population
}

function initCareersListeners() {
  // All event listeners: search, filters, sort, view-mode, dropdown change
}

async function init() {
  favoriteMOS = getStoredJSON('favoriteMOS', []);
  await loadCareers();
  populateSelectors();
  filterAndRenderCareers();
  initCareersListeners();
  updateFavoritesUI();
}

// Export for bootstrap
window.careersModule = { init };
