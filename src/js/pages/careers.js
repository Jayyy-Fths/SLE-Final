// careers.js - MOS Explorer: filter, search, sort, compare, favorites
let allCareers = [];
let filteredCareers = [];
let currentFilter = 'all';
let currentViewMode = 'cards';
let currentSort = 'title-asc';
let compareList = [];   // up to 3 MOS objects

async function initCareers() {
    if (!window.shared) {
        setTimeout(initCareers, 100);
        return;
    }
    showSkeleton();
    allCareers = await window.shared.loadCareers();
    if (!allCareers || allCareers.length === 0) {
        document.getElementById('career-grid').innerHTML =
            '<p class="text-gray-400 col-span-full text-center py-20">Failed to load careers data.</p>';
        return;
    }
    filteredCareers = [...allCareers];
    setupFilterButtons();
    setupSearch();
    setupViewMode();
    setupSort();
    renderCareers();
    updateFavoritesSection();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCareers);
} else {
    initCareers();
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function showSkeleton() {
    const grid = document.getElementById('career-grid');
    if (!grid) return;
    grid.className = 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8';
    grid.innerHTML = Array(8).fill(0).map(() => `
        <div class="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 animate-pulse">
            <div class="h-7 bg-zinc-800 rounded mb-3 w-16"></div>
            <div class="h-3 bg-zinc-800 rounded mb-4 w-20"></div>
            <div class="h-5 bg-zinc-800 rounded mb-2 w-3/4"></div>
            <div class="h-3 bg-zinc-800 rounded mb-1 w-full"></div>
            <div class="h-3 bg-zinc-800 rounded mb-4 w-2/3"></div>
            <div class="h-3 bg-zinc-800 rounded w-24"></div>
        </div>
    `).join('');
}

// ─── Filters / search / sort ─────────────────────────────────────────────────
function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });
}

function setupSearch() {
    const input = document.getElementById('mos-search');
    if (!input) return;
    input.addEventListener('input', applyFilters);
}

function setupViewMode() {
    const sel = document.getElementById('view-mode');
    if (!sel) return;
    sel.addEventListener('change', e => { currentViewMode = e.target.value; renderCareers(); });
}

function setupSort() {
    const sel = document.getElementById('sort-mode');
    if (!sel) return;
    sel.addEventListener('change', e => { currentSort = e.target.value; applySorting(); renderCareers(); });
}

function applyFilters() {
    const term = (document.getElementById('mos-search')?.value || '').toLowerCase();
    filteredCareers = allCareers.filter(c => {
        if (currentFilter !== 'all' && c.cat !== currentFilter) return false;
        if (term) return c.mos.toLowerCase().includes(term) || c.title.toLowerCase().includes(term);
        return true;
    });
    applySorting();
    renderCareers();
}

function applySorting() {
    const [key, order] = currentSort.split('-');
    filteredCareers.sort((a, b) => {
        let av, bv;
        if (key === 'title')    { av = a.title.toLowerCase(); bv = b.title.toLowerCase(); }
        else if (key === 'asvab')    { av = parseInt(a.asvab) || 0; bv = parseInt(b.asvab) || 0; }
        else if (key === 'training') { av = parseInt(a.training) || 0; bv = parseInt(b.training) || 0; }
        if (order === 'asc') return av < bv ? -1 : av > bv ? 1 : 0;
        return av > bv ? -1 : av < bv ? 1 : 0;
    });
}

function clearFilters() {
    currentFilter = 'all';
    currentSort = 'title-asc';
    const searchInput = document.getElementById('mos-search');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (allBtn) allBtn.classList.add('active');
    const sortSel = document.getElementById('sort-mode');
    if (sortSel) sortSel.value = 'title-asc';
    filteredCareers = [...allCareers];
    renderCareers();
}
window.clearFilters = clearFilters;

// ─── Render ───────────────────────────────────────────────────────────────────
function renderCareers() {
    const grid = document.getElementById('career-grid');
    if (!grid) return;

    const count = document.getElementById('career-count');
    if (count) count.textContent = `${filteredCareers.length} / ${allCareers.length}`;

    if (filteredCareers.length === 0) {
        grid.className = 'grid';
        grid.innerHTML = `
            <div class="text-center py-20 col-span-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 text-zinc-700 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>
                <h3 class="text-2xl font-black uppercase text-zinc-600 mb-3">No Results</h3>
                <p class="text-zinc-600 mb-6">Try a different filter or search term.</p>
                <button onclick="clearFilters()" class="bg-[#ffd700] text-black px-8 py-3 font-black uppercase rounded-xl hover:bg-white transition-all">Clear Filters</button>
            </div>
        `;
        return;
    }

    grid.className = currentViewMode === 'cards'
        ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
        : 'grid gap-3';

    grid.innerHTML = filteredCareers.map(c =>
        currentViewMode === 'cards' ? createCardView(c) : createListView(c)
    ).join('');

    grid.querySelectorAll('[data-mos]').forEach(el => {
        el.addEventListener('click', () => {
            const c = allCareers.find(x => x.mos === el.dataset.mos);
            if (c && window.shared?.openMosModal) window.shared.openMosModal(c);
        });
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

const CAT_COLORS = {
    combat:    'border-red-500/40 bg-red-500/5',
    intel:     'border-blue-500/40 bg-blue-500/5',
    medical:   'border-green-500/40 bg-green-500/5',
    engineer:  'border-yellow-500/40 bg-yellow-500/5',
    aviation:  'border-purple-500/40 bg-purple-500/5',
    logistics: 'border-orange-500/40 bg-orange-500/5',
};

function createCardView(c) {
    const fav = window.shared?.isFavorited(c.mos);
    const inCompare = compareList.some(x => x.mos === c.mos);
    const border = CAT_COLORS[c.cat] || 'border-white/10';
    return `
        <div class="mos-card-container cursor-pointer group" data-mos="${c.mos}">
            <div class="bg-zinc-900/50 border ${border} rounded-2xl p-6 h-full hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 relative">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="text-xl font-black uppercase text-[#ffd700]">${c.mos}</h3>
                        <p class="text-gray-500 text-xs uppercase tracking-wider">${c.cat}</p>
                    </div>
                    <button class="favorite-btn text-xl hover:scale-125 transition-transform" title="Favorite"
                        onclick="event.stopPropagation(); window.shared?.toggleFavorite(event, ${escJson(c)})">
                        ${fav ? '★' : '☆'}
                    </button>
                </div>
                <h4 class="font-bold text-base mb-2 leading-snug">${c.title}</h4>
                <p class="text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2">${c.desc}</p>
                <div class="space-y-1 text-xs text-gray-500 mb-4">
                    <div><strong class="text-gray-300">ASVAB:</strong> ${c.asvab}</div>
                    <div><strong class="text-gray-300">Training:</strong> ${c.training}</div>
                    ${c.bonus ? '<div class="text-green-400 font-semibold">✓ Bonus Eligible</div>' : ''}
                </div>
                <div class="flex gap-2 pt-3 border-t border-white/10">
                    <span class="text-[#ffd700] font-black uppercase text-xs flex-1 group-hover:text-white transition-colors">View Details →</span>
                    <button class="compare-btn text-xs font-black uppercase px-2 py-1 rounded-lg border transition-all ${inCompare ? 'bg-[#ffd700] text-black border-[#ffd700]' : 'border-white/20 text-gray-400 hover:border-[#ffd700] hover:text-[#ffd700]'}"
                        onclick="event.stopPropagation(); toggleCompare(${escJson(c)})" title="Add to compare">
                        ${inCompare ? '✓ Added' : '+ Compare'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createListView(c) {
    const fav = window.shared?.isFavorited(c.mos);
    const inCompare = compareList.some(x => x.mos === c.mos);
    return `
        <div class="mos-card-container cursor-pointer" data-mos="${c.mos}">
            <div class="bg-zinc-900/50 border border-white/10 rounded-xl p-4 hover:border-[#ffd700] transition-all flex items-center gap-4">
                <div class="font-black text-[#ffd700] min-w-[3.5rem] text-sm">${c.mos}</div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold">${c.title}</h4>
                    <p class="text-gray-400 text-xs truncate">${c.desc.substring(0, 70)}...</p>
                </div>
                <div class="text-right text-xs text-gray-500 hidden sm:block min-w-[7rem]">
                    <div><strong class="text-gray-300">ASVAB:</strong> ${c.asvab}</div>
                    <div><strong class="text-gray-300">Training:</strong> ${c.training}</div>
                </div>
                <div class="flex gap-2 ml-2">
                    <button class="text-lg hover:scale-125 transition-transform" title="Favorite"
                        onclick="event.stopPropagation(); window.shared?.toggleFavorite(event, ${escJson(c)})">
                        ${fav ? '★' : '☆'}
                    </button>
                    <button class="text-xs font-black uppercase px-2 py-1 rounded border transition-all ${inCompare ? 'bg-[#ffd700] text-black border-[#ffd700]' : 'border-white/20 text-gray-400 hover:border-[#ffd700]'}"
                        onclick="event.stopPropagation(); toggleCompare(${escJson(c)})">
                        ${inCompare ? '✓' : '+'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function escJson(obj) {
    return JSON.stringify(obj).replace(/"/g, '&quot;');
}

// ─── Favorites ────────────────────────────────────────────────────────────────
function updateFavoritesSection() {
    const list = document.getElementById('favorite-list');
    const count = document.getElementById('career-count');
    if (!list || !window.shared?.getFavorites) return;

    const favCodes = window.shared.getFavorites();
    const favItems = allCareers.filter(c => favCodes.includes(c.mos)).slice(0, 5);

    list.innerHTML = favItems.length === 0
        ? '<p class="text-gray-500 italic text-center py-6 col-span-full">Click ★ on any card to save favorites here.</p>'
        : favItems.map(c => `
            <div class="bg-zinc-800/50 border border-[#ffd700]/40 rounded-xl p-3 flex justify-between items-center hover:bg-zinc-800 cursor-pointer" data-mos="${c.mos}">
                <div>
                    <strong class="text-[#ffd700] text-sm">${c.mos}</strong>
                    <p class="text-xs text-gray-300">${c.title}</p>
                </div>
                <button class="text-gray-500 hover:text-red-400 transition-colors text-lg"
                    onclick="event.stopPropagation(); window.shared?.removeFavorite('${c.mos}'); updateFavoritesSection(); renderCareers();">✕</button>
            </div>
          `).join('');

    list.querySelectorAll('[data-mos]').forEach(el => {
        el.addEventListener('click', () => {
            const c = allCareers.find(x => x.mos === el.dataset.mos);
            if (c) window.shared?.openMosModal(c);
        });
    });

    if (count) count.textContent = `${favCodes.length} saved / ${allCareers.length} total`;
}

// ─── Compare ──────────────────────────────────────────────────────────────────
function toggleCompare(mosData) {
    const idx = compareList.findIndex(x => x.mos === mosData.mos);
    if (idx > -1) {
        compareList.splice(idx, 1);
    } else {
        if (compareList.length >= 3) {
            window.shared?.showToast('Max 3 MOS to compare at once.', 'info');
            return;
        }
        compareList.push(mosData);
    }
    updateCompareBar();
    renderCareers();
}
window.toggleCompare = toggleCompare;

function clearCompare() {
    compareList = [];
    updateCompareBar();
    renderCareers();
}
window.clearCompare = clearCompare;

function updateCompareBar() {
    const bar = document.getElementById('compare-bar');
    const slots = document.getElementById('compare-slots');
    const btn = document.getElementById('compare-now-btn');
    if (!bar || !slots) return;

    if (compareList.length === 0) {
        bar.classList.add('hidden');
        return;
    }
    bar.classList.remove('hidden');

    slots.innerHTML = compareList.map(c => `
        <span class="inline-flex items-center gap-1 bg-zinc-800 border border-[#ffd700]/40 rounded-full px-3 py-1 text-xs font-black">
            <span class="text-[#ffd700]">${c.mos}</span>
            <button onclick="toggleCompare(${escJson(c)})" class="text-gray-400 hover:text-red-400 ml-1 transition-colors">×</button>
        </span>
    `).join('');

    if (btn) {
        btn.disabled = compareList.length < 2;
        btn.className = `px-6 py-2.5 font-black uppercase rounded-xl text-sm transition-all ${
            compareList.length >= 2
                ? 'bg-[#ffd700] text-black hover:bg-white shadow-lg cursor-pointer'
                : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
        }`;
    }
}

function openCompareModal() {
    if (compareList.length < 2) {
        window.shared?.showToast('Select at least 2 MOS to compare.', 'info');
        return;
    }
    const rows = [
        { label: 'Category',      key: c => c.cat.charAt(0).toUpperCase() + c.cat.slice(1) },
        { label: 'ASVAB Score',   key: c => c.asvab },
        { label: 'Training',      key: c => c.training },
        { label: 'Bonus',         key: c => c.bonus ? '<span class="text-green-400 font-bold">✓ Eligible</span>' : '<span class="text-gray-500">—</span>' },
        { label: 'Description',   key: c => `<span class="text-sm text-gray-300 leading-relaxed">${c.desc}</span>` },
    ];

    const colHead = compareList.map(c => `
        <th class="px-4 py-3 text-left min-w-[180px]">
            <div class="text-[#ffd700] font-black text-lg">${c.mos}</div>
            <div class="text-white font-bold text-sm leading-snug">${c.title}</div>
        </th>
    `).join('');

    const bodyRows = rows.map(r => `
        <tr class="border-t border-white/10 hover:bg-white/5 transition-colors">
            <td class="px-4 py-3 text-xs font-black uppercase text-gray-400 tracking-wider whitespace-nowrap">${r.label}</td>
            ${compareList.map(c => `<td class="px-4 py-3">${r.key(c)}</td>`).join('')}
        </tr>
    `).join('');

    document.getElementById('compare-table-wrap').innerHTML = `
        <table class="w-full text-sm">
            <thead class="bg-zinc-800/60">
                <tr>
                    <th class="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-28">Feature</th>
                    ${colHead}
                </tr>
            </thead>
            <tbody>${bodyRows}</tbody>
        </table>
    `;

    const modal = document.getElementById('compare-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}
window.openCompareModal = openCompareModal;

// Expose for shared.js toggle callbacks
window.updateFavoritesSection = updateFavoritesSection;
window.renderCareers = renderCareers;
