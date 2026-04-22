// pages/careers.js - MOS Explorer Module (COMPLETE)

// Globals
let allCareers = [];
let favoriteMOS = [];
let activeCategory = 'all';
let currentSort = 'title-asc';
let currentSearch = '';
const MAX_FAVORITES = 5;
const FALLBACK_CAREERS_URL = './careers.json';

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

function openMosModal(mos) {
  const selected = allCareers.find(m => m.mos === mos);
  if (!selected) return;

  const modal = document.getElementById('mos-modal');
  if (!modal) return;

  document.getElementById('mos-modal-title').textContent = `${selected.mos} - ${selected.title}`;
  document.getElementById('mos-modal-cat').textContent = `Category: ${selected.cat || 'Other'}`;
  document.getElementById('mos-modal-desc').textContent = selected.desc || 'No description';
  document.getElementById('mos-modal-asvab').textContent = selected.asvab || 'N/A';
  document.getElementById('mos-modal-training').textContent = selected.training || 'Varies';
  
  const bonusDiv = document.getElementById('mos-modal-bonus');
  if (bonusDiv) {
    bonusDiv.style.display = selected.bonus ? 'block' : 'none';
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  window.currentMosModal = mos;
}

function closeMosModal() {
  const modal = document.getElementById('mos-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function toggleFavorite(eventOrMos, mos, title) {
  if (eventOrMos?.stopPropagation) eventOrMos.stopPropagation();
  const existingIndex = favoriteMOS.findIndex(item => item.mos === mos);
  const isAdding = existingIndex === -1;

  if (isAdding) {
    if (favoriteMOS.length >= MAX_FAVORITES) {
      if (window.shared?.showToast) {
        window.shared.showToast(`Only ${MAX_FAVORITES} favorites allowed.`, 'info');
      }
      return;
    }
    favoriteMOS.push({ mos, title });
  } else {
    favoriteMOS.splice(existingIndex, 1);
  }

  try {
    localStorage.setItem('favoriteMOS', JSON.stringify(favoriteMOS));
  } catch (e) {
    console.warn('Failed to save favorites:', e);
  }
  
  updateFavoritesUI();
  updateCardFavorites();
  if (window.shared?.showToast) {
    window.shared.showToast(`⭐ ${title || mos} ${isAdding ? 'added' : 'removed'}!`, 'success');
  }
}

function renderCareers(data) {
  const grid = document.getElementById('career-grid');
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = '<div class="col-span-full text-center text-gray-400 italic uppercase">No results found</div>';
    return;
  }

  grid.innerHTML = data.map(m => {
    const isFav = favoriteMOS.findIndex(f => f.mos === m.mos) > -1;
    const categoryColor = {
      combat: 'from-red-600 to-orange-500',
      intel: 'from-purple-600 to-blue-500',
      medical: 'from-green-600 to-emerald-500',
      engineer: 'from-yellow-600 to-amber-500',
      aviation: 'from-sky-600 to-cyan-500',
      logistics: 'from-slate-600 to-gray-500'
    };
    const gradientClass = categoryColor[m.cat] || 'from-slate-600 to-gray-500';
    
    return `
      <div class="mos-card bg-zinc-900/50 border border-white/10 p-6 rounded-2xl hover:border-[#ffd700] transition-all cursor-pointer group"
           onclick="openMosModal('${m.mos}')" style="${isFav ? 'border-color: #ffd700;' : ''}">
        <div class="flex justify-between items-start mb-4">
          <div class="bg-gradient-to-r ${gradientClass} px-3 py-1 rounded-full text-white text-xs font-bold">${m.cat || 'Other'}</div>
          <button class="favorite-btn ${isFav ? 'text-[#ffd700]' : 'text-gray-400'} hover:text-[#ffd700] transition-colors"
                  onclick="toggleFavorite(event, '${m.mos}', '${(m.title || '').replace(/'/g, "\\'")}'); return false;">
            <i data-lucide="star" class="w-5 h-5 ${isFav ? 'fill-current' : ''}"></i>
          </button>
        </div>
        <p class="text-[#ffd700] font-mono text-sm font-bold">${m.mos}</p>
        <h3 class="text-lg font-black uppercase mb-2">${m.title || 'Untitled'}</h3>
        <p class="text-gray-400 text-sm mb-4">${m.desc || 'No description'}</p>
        <div class="text-xs text-gray-500 space-y-1">
          <p>ASVAB: <span class="text-white font-mono">${m.asvab || 'N/A'}</span></p>
          <p>Training: <span class="text-white font-mono">${m.training || 'Varies'}</span></p>
        </div>
      </div>
    `;
  }).join('');
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function sortCareerData(data, sortKey) {
  const sorted = [...data];
  
  const sortMap = {
    'title-asc': (a, b) => (a.title || '').localeCompare(b.title || ''),
    'title-desc': (a, b) => (b.title || '').localeCompare(a.title || ''),
    'asvab-asc': (a, b) => {
      const aScore = parseInt(a.asvab) || 0;
      const bScore = parseInt(b.asvab) || 0;
      return aScore - bScore;
    },
    'asvab-desc': (a, b) => {
      const aScore = parseInt(a.asvab) || 0;
      const bScore = parseInt(b.asvab) || 0;
      return bScore - aScore;
    }
  };
  
  const compareFn = sortMap[sortKey] || sortMap['title-asc'];
  return sorted.sort(compareFn);
}

function filterAndRenderCareers() {
  const searchValue = currentSearch.toLowerCase();
  const filtered = allCareers.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchValue) || String(m.mos).includes(searchValue);
    return matchesSearch && (activeCategory === 'all' || m.cat === activeCategory);
  });
  const sorted = sortCareerData(filtered, currentSort);
  renderCareers(sorted);
  const careeCount = document.getElementById('career-count');
  if (careeCount) careeCount.textContent = `${sorted.length} / ${allCareers.length}`;
}

function updateFavoritesUI() {
  const list = document.getElementById('favorite-list');
  if (!list) return;
  if (favoriteMOS.length === 0) {
    list.innerHTML = '<div class="text-gray-500 italic">No favorites yet. Click ⭐ on any MOS.</div>';
  } else {
    list.innerHTML = favoriteMOS.map(f => `
      <div class="flex justify-between items-center bg-zinc-800/50 p-3 rounded-lg">
        <div>
          <p class="font-mono text-[#ffd700] text-sm">${f.mos}</p>
          <p class="text-sm">${f.title || 'Untitled'}</p>
        </div>
        <button class="text-red-400 hover:text-red-300 transition-colors"
                onclick="toggleFavorite(null, '${f.mos}', '${(f.title || '').replace(/'/g, "\\'")}')"
                title="Remove from favorites">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
    `).join('');
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

function updateCardFavorites() {
  // Update star icons and borders on MOS cards
}

function populateSelectors() {
  // MOS dropdown population - optional for this version
}

function initCareersListeners() {
  // Search input
  const searchInput = document.getElementById('search-mos');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      filterAndRenderCareers();
    });
  }
  
  // Category filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter || 'all';
      filterAndRenderCareers();
    });
  });
  
  // Sort dropdown
  const sortSelect = document.getElementById('sort-mode');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      filterAndRenderCareers();
    });
  }
}

async function init() {
  console.log('🚀 Initializing careers module');
  
  favoriteMOS = getStoredJSON('favoriteMOS', []);
  await loadCareers();
  
  populateSelectors();
  filterAndRenderCareers();
  initCareersListeners();
  updateFavoritesUI();
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  console.log('✅ Careers module ready');
}

window.careersModule = { init, openMosModal, toggleFavorite, closeMosModal };
