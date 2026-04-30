// careers.js - MOS Explorer for careers page
let allCareers = [];
let filteredCareers = [];
let currentFilter = 'all';
let currentViewMode = 'cards';
let currentSort = 'title-asc';

// Wait for shared.js to load
async function initCareers() {
    console.log('initCareers called, window.shared:', !!window.shared);
    
    if (!window.shared) {
        console.log('window.shared not available, waiting...');
        setTimeout(initCareers, 100);
        return;
    }

    console.log('window.shared available, loading careers');
    // Load careers data
    await loadCareerData();
}

async function loadCareerData() {
    console.log('loadCareerData called');
    allCareers = await window.shared.loadCareers();
    console.log('Careers loaded:', allCareers.length);
    
    if (!allCareers || allCareers.length === 0) {
        console.error('Failed to load careers data');
        return;
    }

    filteredCareers = [...allCareers];
    
    // Setup event listeners
    setupFilterButtons();
    setupSearch();
    setupViewMode();
    setupSort();
    
    // Initial render
    renderCareers();
    updateFavoritesSection();
}

// Initialize on DOM ready
console.log('careers.js loaded, document.readyState:', document.readyState);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCareers);
} else {
    initCareers();
}

function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Apply filter
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('mos-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        applyFilters();
    });
}

function setupViewMode() {
    const viewSelect = document.getElementById('view-mode');
    if (!viewSelect) return;
    
    viewSelect.addEventListener('change', (e) => {
        currentViewMode = e.target.value;
        renderCareers();
    });
}

function setupSort() {
    const sortSelect = document.getElementById('sort-mode');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applySorting();
        renderCareers();
    });
}

function applyFilters() {
    const searchTerm = (document.getElementById('mos-search')?.value || '').toLowerCase();
    
    filteredCareers = allCareers.filter(career => {
        // Filter by category
        if (currentFilter !== 'all' && career.cat !== currentFilter) {
            return false;
        }
        
        // Filter by search term (MOS code or title)
        if (searchTerm) {
            const matchesMos = career.mos.toLowerCase().includes(searchTerm);
            const matchesTitle = career.title.toLowerCase().includes(searchTerm);
            return matchesMos || matchesTitle;
        }
        
        return true;
    });
    
    applySorting();
    renderCareers();
}

function applySorting() {
    const [sortKey, sortOrder] = currentSort.split('-');
    
    filteredCareers.sort((a, b) => {
        let aVal, bVal;
        
        if (sortKey === 'title') {
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
        } else if (sortKey === 'asvab') {
            aVal = parseInt(a.asvab) || 0;
            bVal = parseInt(b.asvab) || 0;
        } else if (sortKey === 'training') {
            aVal = parseInt(a.training) || 0;
            bVal = parseInt(b.training) || 0;
        }
        
        if (sortOrder === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
}

function renderCareers() {
    const grid = document.getElementById('career-grid');
    if (!grid) return;
    
    if (currentViewMode === 'cards') {
        grid.className = 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8';
    } else {
        grid.className = 'grid gap-3';
    }
    
    grid.innerHTML = filteredCareers.map(career => {
        if (currentViewMode === 'cards') {
            return createCardView(career);
        } else {
            return createListView(career);
        }
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('[data-mos]').forEach(el => {
        el.addEventListener('click', () => {
            const mosCode = el.dataset.mos;
            const career = allCareers.find(c => c.mos === mosCode);
            if (career && window.shared?.openMosModal) {
                window.shared.openMosModal(career);
            }
        });
    });
    
    // Recreate lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function createCardView(career) {
    const isFavorited = window.shared?.isFavorited(career.mos);
    const categoryColors = {
        combat: 'border-red-500/50 bg-red-500/5',
        intel: 'border-blue-500/50 bg-blue-500/5',
        medical: 'border-green-500/50 bg-green-500/5',
        engineer: 'border-yellow-500/50 bg-yellow-500/5',
        aviation: 'border-purple-500/50 bg-purple-500/5',
        logistics: 'border-orange-500/50 bg-orange-500/5'
    };
    
    const borderClass = categoryColors[career.cat] || 'border-white/10';
    
    return `
        <div class="mos-card-container cursor-pointer group" data-mos="${career.mos}">
            <div class="bg-zinc-900/50 border ${borderClass} rounded-2xl p-6 h-full hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-2xl font-black uppercase text-[#ffd700] group-hover:text-white transition-colors">${career.mos}</h3>
                        <p class="text-gray-400 text-xs uppercase tracking-wider mt-1">${career.cat}</p>
                    </div>
                    <button class="favorite-btn text-xl hover:scale-125 transition-transform" onclick="event.stopPropagation(); window.shared?.toggleFavorite(event, ${JSON.stringify(career).replace(/"/g, '&quot;')})">
                        ${isFavorited ? '★' : '☆'}
                    </button>
                </div>
                <h4 class="font-bold text-lg mb-3">${career.title}</h4>
                <p class="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">${career.desc}</p>
                <div class="space-y-2 text-xs text-gray-400 mb-4">
                    <div><strong>ASVAB:</strong> ${career.asvab}</div>
                    <div><strong>Training:</strong> ${career.training}</div>
                    ${career.bonus ? '<div class="text-green-400"><i data-lucide="award" class="w-3 h-3 inline mr-1"></i> Bonus Eligible</div>' : ''}
                </div>
                <div class="pt-3 border-t border-white/10 text-[#ffd700] font-black uppercase text-xs hover:text-white transition-colors">
                    View Details →
                </div>
            </div>
        </div>
    `;
}

function createListView(career) {
    const isFavorited = window.shared?.isFavorited(career.mos);
    
    return `
        <div class="mos-card-container cursor-pointer" data-mos="${career.mos}">
            <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-4 hover:border-[#ffd700] hover:bg-zinc-900 transition-all flex justify-between items-center">
                <div class="flex-1">
                    <div class="flex items-center gap-4">
                        <div class="font-black text-[#ffd700] min-w-16">${career.mos}</div>
                        <div class="flex-1">
                            <h4 class="font-bold text-lg">${career.title}</h4>
                            <p class="text-gray-400 text-sm">${career.desc.substring(0, 60)}...</p>
                        </div>
                        <div class="text-right text-xs text-gray-400 min-w-32">
                            <div><strong>ASVAB:</strong> ${career.asvab}</div>
                            <div><strong>Training:</strong> ${career.training}</div>
                        </div>
                    </div>
                </div>
                <button class="favorite-btn text-2xl ml-4 hover:scale-125 transition-transform" onclick="event.stopPropagation(); window.shared?.toggleFavorite(event, ${JSON.stringify(career).replace(/"/g, '&quot;')})">
                    ${isFavorited ? '★' : '☆'}
                </button>
            </div>
        </div>
    `;
}

function updateFavoritesSection() {
    const favoriteList = document.getElementById('favorite-list');
    const careerCount = document.getElementById('career-count');
    
    if (!favoriteList || !window.shared?.getFavorites) return;
    
    const favorites = window.shared.getFavorites();
    const favoriteCareers = allCareers.filter(c => favorites.includes(c.mos)).slice(0, 5);
    
    if (favoriteCareers.length === 0) {
        favoriteList.innerHTML = '<p class="text-gray-400 italic text-center py-6">Click the ★ icon to add careers to your favorites</p>';
    } else {
        favoriteList.innerHTML = favoriteCareers.map(career => `
            <div class="bg-zinc-800/50 border border-[#ffd700]/50 rounded-lg p-3 flex justify-between items-center hover:bg-zinc-800 cursor-pointer" data-mos="${career.mos}">
                <div>
                    <strong class="text-[#ffd700]">${career.mos}</strong>
                    <p class="text-sm text-gray-300">${career.title}</p>
                </div>
                <button class="text-xl text-[#ffd700]" onclick="event.stopPropagation(); window.shared?.removeFavorite('${career.mos}'); updateFavoritesSection(); renderCareers();">
                    ✕
                </button>
            </div>
        `).join('');
        
        // Add click handler for favorites
        favoriteList.querySelectorAll('[data-mos]').forEach(el => {
            el.addEventListener('click', () => {
                const mosCode = el.dataset.mos;
                const career = allCareers.find(c => c.mos === mosCode);
                if (career && window.shared?.openMosModal) {
                    window.shared.openMosModal(career);
                }
            });
        });
    }
    
    if (careerCount) {
        careerCount.textContent = `${favorites.length} / ${allCareers.length}`;
    }
}

// Expose update function globally for modal interactions
window.updateFavoritesSection = updateFavoritesSection;
window.renderCareers = renderCareers;
