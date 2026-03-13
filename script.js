let allCareers = [];
let favoriteMOS = [];
let achievements = [];
let callbacks = [];
let currentMosModal = null;

const convex = new ConvexHttpClient("https://keen-condor-8.convex.cloud/gas");
const FALLBACK_CAREERS_URL = './careers.json';

async function loadCareersWithFallback() {
  try {
    allCareers = await convex.query("getCareers");
    if (allCareers.length === 0) {
      console.log('Convex careers empty, loading fallback JSON');
      const response = await fetch(FALLBACK_CAREERS_URL);
      allCareers = await response.json();
    }
    console.log(`Loaded ${allCareers.length} careers from ${allCareers.length > 0 && allCareers[0]._id ? 'Convex' : 'JSON fallback'}`);
  } catch (err) {
    console.warn('Convex failed, using fallback JSON:', err);
    try {
      const response = await fetch(FALLBACK_CAREERS_URL);
      allCareers = await response.json();
      console.log(`Loaded fallback careers: ${allCareers.length} items`);
    } catch (fallbackErr) {
      console.error('Fallback failed too:', fallbackErr);
      allCareers = [];
    }
  }
}

async function loadFavorites() {
    try {
      favoriteMOS = await convex.query("getFavorites");
    } catch (e) {
      favoriteMOS = JSON.parse(localStorage.getItem('favoriteMOS') || '[]');
    }
}

async function loadAchievements() {
    try {
      achievements = await convex.query("getAchievements");
    } catch (e) {
      achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    }
}

async function loadCallbacks() {
    try {
      callbacks = await convex.query("getCallbacks");
    } catch (e) {
      callbacks = JSON.parse(localStorage.getItem('recruiterCallbacks') || '[]');
    }
}

async function toggleFavorite(mos, title) {
    try {
      await convex.mutation("toggleFavorite", { mos, title });
      await loadFavorites();
    } catch (e) {
      // Local fallback
      const index = favoriteMOS.findIndex(item => item.mos === mos);
      if (index === -1) {
        favoriteMOS.push({ mos, title });
      } else {
        favoriteMOS.splice(index, 1);
      }
      localStorage.setItem('favoriteMOS', JSON.stringify(favoriteMOS));
    }
    updateFavoritesUI();
    updateCardFavorites();
    await awardAchievement('favorite-star', 'Top 5 Star', 'Saved a MOS to your top 5 favorites.');
}

async function awardAchievement(id, title, description) {
    try {
      await convex.mutation("awardAchievement", { id, title, description });
      await loadAchievements();
    } catch (e) {
      console.warn('Achievement failed:', e);
    }
    renderAchievements();
}

function renderAchievements() {
    const container = document.getElementById('achievement-list');
    if (!container) return;
    if (!achievements.length) {
      container.innerHTML = '<div class="col-span-3 text-gray-400 text-center py-8">No achievements yet. Start exploring to unlock badges!</div>';
      return;
    }
    container.innerHTML = achievements.map(a => `
        <div class="bg-zinc-900 p-6 rounded-xl border border-white/10">
            <p class="text-[#ffd700] text-sm uppercase font-black tracking-widest">${a.title}</p>
            <p class="text-gray-300 text-sm mt-2">${a.description}</p>
            <p class="text-gray-500 text-xs mt-3">${new Date(a.unlockedAt || Date.now()).toLocaleDateString()}</p>
        </div>
    `).join('');
}

function updateFavoritesUI() {
    const container = document.getElementById('favorite-list');
    if (!container) return;
    container.innerHTML = favoriteMOS.length === 0 ? '<p class="text-gray-400 text-xs">No favorites selected yet. Click ⭐ on MOS cards.</p>' : favoriteMOS.map(item => `
        <div class="flex items-center justify-between bg-zinc-800 p-3 rounded-lg">
            <span class="text-gray-200 text-sm"><strong>${item.mos}</strong> - ${item.title}</span>
            <button class="text-[#ffd700] text-xs font-black hover:text-red-400" onclick="toggleFavorite('${item.mos}','${item.title}')">✕</button>
        </div>
    `).join('');
}

function updateCardFavorites() {
    document.querySelectorAll('#career-grid [data-mos]').forEach(card => {
        const mos = card.getAttribute('data-mos');
        const btn = card.querySelector('.favorite-btn');
        if (favoriteMOS.some(item => item.mos === mos)) {
            card.classList.add('recommended');
            if (btn) {
                btn.classList.add('bg-[#ffd700]', 'text-black');
                btn.title = 'Remove from favorites';
            }
        } else {
            card.classList.remove('recommended');
            if (btn) {
                btn.classList.remove('bg-[#ffd700]', 'text-black');
                btn.title = 'Add to favorites';
            }
        }
    });
}

function populateMosDropdown(data) {
    const dropdown = document.getElementById('mos-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = '<option value="">Quick Select MOS</option>';
    data.slice(0, 50).forEach(m => {  // Limit to top 50 for dropdown
        const opt = document.createElement('option');
        opt.value = m.mos;
        opt.innerText = `${m.mos} - ${m.title}`;
        dropdown.appendChild(opt);
    });
    dropdown.addEventListener('change', (e) => showMosDetails(e.target.value));
}

function showMosDetails(mos) {
    const selected = allCareers.find(m => m.mos === mos);
    const container = document.getElementById('mos-details');
    const content = document.getElementById('mos-details-content');
    if (!selected || !container || !content) {
        if (container) container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');
    content.innerHTML = `
        <div class="text-left">
            <h4 class="text-xl font-black uppercase mb-2">${selected.mos} - ${selected.title}</h4>
            <p class="text-gray-300 mb-4">${selected.desc}</p>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div><strong>ASVAB:</strong> ${selected.asvab}</div>
                <div><strong>Training:</strong> ${selected.training}</div>
                <div><strong>Category:</strong> <span class="text-[#ffd700]">${selected.cat}</span></div>
                ${selected.bonus ? '<div><strong>Bonus:</strong> Yes</div>' : ''}
            </div>
        </div>
    `;
    currentMosModal = mos;
}

// **NEW: MOS Popup Modal**
function openMosModal(mos) {
    const selected = allCareers.find(m => m.mos === mos);
    if (!selected) return;
    
    document.getElementById('mos-modal-title').innerText = `${selected.mos} - ${selected.title}`;
    document.getElementById('mos-modal-desc').innerText = selected.desc;
    document.getElementById('mos-modal-asvab').innerText = selected.asvab;
    document.getElementById('mos-modal-training').innerText = selected.training;
    document.getElementById('mos-modal-cat').innerText = selected.cat;
    document.getElementById('mos-modal-bonus').classList.toggle('hidden', !selected.bonus);
    
    document.getElementById('mos-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeMosModal() {
    document.getElementById('mos-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function renderCareers(data) {
    const grid = document.getElementById('career-grid');
    const viewMode = document.getElementById('view-mode')?.value || 'cards';

    if (viewMode === 'list') {
        grid.innerHTML = data.map(m => `
            <div class="bg-zinc-900 p-5 border border-white/10 rounded-xl hover:border-[#ffd700]/50 cursor-pointer" data-mos="${m.mos}" onclick="openMosModal('${m.mos}')">
                <div class="flex justify-between items-start mb-3">
                    <span class="text-[#ffd700] font-mono text-sm font-bold">${m.mos}</span>
                    ${m.bonus ? '<span class="bg-[#ffd700] text-black text-xs font-black px-2 py-0.5 rounded-full">BONUS</span>' : ''}
                </div>
                <h4 class="font-black text-base mb-2">${m.title}</h4>
                <p class="text-gray-400 text-sm">${m.desc}</p>
                <p class="text-xs mt-3 text-gray-300">ASVAB: ${m.asvab} | Training: ${m.training}</p>
            </div>
        `).join('');
    } else {
        grid.innerHTML = data.map(m => `
            <div class="mos-card bg-zinc-900 p-8 border border-white/10 rounded-xl group hover:border-[#ffd700]/50 transition-all cursor-pointer relative" data-mos="${m.mos}" onclick="openMosModal('${m.mos}')">
                <div class="recommended-label absolute top-4 right-4 hidden bg-[#00ffcc] text-black text-xs font-black px-3 py-1 rounded-full tracking-wider">Recommended</div>
                <button class="favorite-btn absolute top-4 right-4 bg-black/50 border border-white/30 rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#ffd700] hover:text-black transition-all z-10" onclick="event.stopPropagation(); toggleFavorite('${m.mos}','${m.title}')" title="Favorite">
                    <i data-lucide="star" class="w-5 h-5"></i>
                </button>
                <div class="flex justify-between items-start mb-4">
                    <span class="text-[#ffd700] font-mono text-sm font-bold uppercase tracking-widest">MOS ${m.mos}</span>
                    ${m.bonus ? '<span class="bg-[#ffd700] text-black text-[10px] font-black px-2 py-1 rounded-full">BONUS</span>' : ''}
                </div>
                <h3 class="text-xl font-black uppercase mb-3 group-hover:text-[#ffd700] transition-colors">${m.title}</h3>
                <p class="text-gray-400 text-sm leading-relaxed mb-4">${m.desc}</p>
                <div class="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <span><strong>ASVAB:</strong> ${m.asvab}</span>
                    <span><strong>Training:</strong> ${m.training}</span>
                </div>
                <p class="text-[11px] mt-2 text-gray-500 group-hover:text-[#ffd700] font-bold">Click to view details</p>
            </div>
        `).join('');
    }
    updateCardFavorites();
    lucide.createIcons();
}

function populateSelectors(data) {
    // Compare dropdowns
    ['compare-1', 'compare-2'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        Array.from(select.options).slice(1).forEach(opt => opt.remove());
        data.slice(0, 30).forEach(m => {
            const opt = new Option(`${m.mos} - ${m.title}`, m.mos);
            select.appendChild(opt);
        });
        select.onchange = (e) => {
            const match = data.find(m => m.mos === e.target.value);
            const detailDiv = select.nextElementSibling;
            if (match && detailDiv) {
                detailDiv.style.opacity = '1';
                detailDiv.innerHTML = `
                    <div class="space-y-3">
                        <div class="bg-zinc-950 p-4 rounded-lg border-l-4 border-[#ffd700]">
                            <h5 class="text-xs text-gray-400 uppercase font-bold mb-1">Entry Req</h5>
                            <p class="font-mono text-sm">${match.asvab}</p>
                        </div>
                        <div class="bg-zinc-950 p-4 rounded-lg border-l-4 border-white">
                            <h5 class="text-xs text-gray-400 uppercase font-bold mb-1">Training</h5>
                            <p class="font-mono text-sm">${match.training}</p>
                        </div>
                        <div class="bg-zinc-950 p-4 rounded-lg border-l-4 border-gray-400">
                            <h5 class="text-xs text-gray-400 uppercase font-bold mb-1">Summary</h5>
                            <p class="text-sm">${match.desc.slice(0, 100)}...</p>
                        </div>
                    </div>
                `;
            }
        };
    });

    populateMosDropdown(data);

    // View mode
    document.getElementById('view-mode')?.addEventListener('change', (e) => {
        renderCareers(allCareers.filter(m => {
            const search = document.getElementById('mos-search')?.value.toLowerCase() || '';
            return m.title.toLowerCase().includes(search) || m.mos.toLowerCase().includes(search);
        }));
    });

    // Filters, search, etc. (existing logic preserved)
}

let currentQ = 0;
let quizScores = { combat:0, intel:0, medical:0, engineer:0, aviation:0, logistics:0 };
const questions = [
    { text: "Where do you thrive most?", opts: [{t: "Solving complex problems", c:"intel"}, {t: "Hands-on building/fixing", c:"engineer"}, {t: "High adrenaline action", c:"combat"}, {t: "Helping people heal", c:"medical"}] },
    { text: "Your ideal work environment?", opts: [{t: "Aircraft/helicopters", c:"aviation"}, {t: "High-tech networks", c:"intel"}, {t: "Field operations", c:"combat"}, {t: "Logistics coordination", c:"logistics"}] },
    { text: "Primary motivation?", opts: [{t: "Technical challenges", c:"engineer"}, {t: "Saving lives", c:"medical"}, {t: "Team leadership", c:"combat"}, {t: "Strategy/planning", c:"intel"}] },
    { text: "Long-term career goal?", opts: [{t: "Officer leadership", c:"combat"}, {t: "Aviation specialist", c:"aviation"}, {t: "Cyber expert", c:"intel"}, {t: "Healthcare professional", c:"medical"}] }
];

function startQuiz() {
    document.getElementById('quiz-start').classList.add('hidden');
    document.getElementById('quiz-question').classList.remove('hidden');
    currentQ = 0;
    quizScores = { combat:0, intel:0, medical:0, engineer:0, aviation:0, logistics:0 };
    showQuestion();
}

function showQuestion() {
    const q = questions[currentQ];
    document.getElementById('q-progress').innerText = `Question ${currentQ + 1} of ${questions.length}`;
    document.getElementById('q-text').innerText = q.text;
    document.getElementById('q-options').innerHTML = q.opts.map((o, i) => `
        <button onclick="handleAnswer('${o.c}')" class="p-6 border-2 border-white/20 hover:border-[#ffd700] hover:bg-[#ffd700]/10 rounded-xl font-bold uppercase text-left transition-all mb-2 last:mb-0">${o.t}</button>
    `).join('');
}

function handleAnswer(cat) {
    quizScores[cat]++;
    currentQ++;
    if (currentQ < questions.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    document.getElementById('quiz-question').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');
    const topCat = Object.entries(quizScores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    const catNames = {
        intel: 'Cyber & Intelligence', combat: 'Combat Arms', engineer: 'Engineering', medical: 'Healthcare', aviation: 'Aviation', logistics: 'Logistics'
    };
    document.getElementById('result-cat').innerText = catNames[topCat] || topCat;
    document.getElementById('result-desc').innerText = `Perfect fit for ${catNames[topCat] || topCat.toUpperCase()} roles based on your answers.`;
}

function resetQuiz() {
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('quiz-start').classList.remove('hidden');
    document.getElementById('quiz-question').classList.add('hidden');
}

async function initPortal() {
    try {
        await loadCareersWithFallback();
        await loadFavorites();
        await loadAchievements();
        await loadCallbacks();
        
        renderCareers(allCareers);
        populateSelectors(allCareers);
        updateFavoritesUI();
        updateCardFavorites();
        renderAchievements();
        
        // Event listeners
        document.getElementById('mos-search')?.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = allCareers.filter(m => 
                m.title.toLowerCase().includes(val) || m.mos.toLowerCase().includes(val)
            );
            renderCareers(filtered);
        });
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active', 'bg-[#ffd700]', 'text-black');
                });
                btn.classList.add('active', 'bg-[#ffd700]', 'text-black');
                const filter = btn.dataset.filter;
                renderCareers(filter === 'all' ? allCareers : allCareers.filter(m => m.cat === filter));
            };
        });
        
        lucide.createIcons();
        console.log('✅ NJ Guard Portal fully initialized. Careers loaded:', allCareers.length);
    } catch (err) {
        console.error('❌ Portal init failed:', err);
    }
}

// Callback functions (existing, simplified)
async function scheduleCallback() {
    const name = document.getElementById('callback-name').value.trim();
    const phone = document.getElementById('callback-phone').value.trim();
    const datetime = document.getElementById('callback-datetime').value;
    if (!name || !phone || !datetime) return alert('Fill all fields');
    
    try {
        await convex.mutation("addCallback", { name, phone, datetime });
    } catch (e) {
        callbacks.push({ name, phone, datetime, created: new Date().toISOString() });
        localStorage.setItem('recruiterCallbacks', JSON.stringify(callbacks));
    }
    
    document.getElementById('callback-feedback').innerHTML = '✅ Callback scheduled!';
    setTimeout(() => location.reload(), 1500);
}

// Init on load
window.addEventListener('load', initPortal);
