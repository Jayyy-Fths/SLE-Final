let allCareers = [];
let favoriteMOS = JSON.parse(localStorage.getItem('favoriteMOS') || '[]');
let achievements = JSON.parse(localStorage.getItem('achievements') || '[]');

function saveFavorites() {
    localStorage.setItem('favoriteMOS', JSON.stringify(favoriteMOS.slice(0, 5)));
}

function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

function awardAchievement(id, title, description) {
    if (achievements.some(a => a.id === id)) return; // only once
    achievements.push({ id, title, description, unlockedAt: new Date().toISOString() });
    saveAchievements();
    renderAchievements();
}

function renderAchievements() {
    const container = document.getElementById('achievement-list');
    if (!container) return;
    if (!achievements.length) {
        container.innerHTML = '<div class="col-span-3 text-gray-400 text-center">No achievements yet. Start exploring to unlock badges!</div>';
        return;
    }
    container.innerHTML = achievements.map(a => `
        <div class="bg-black p-4 rounded-xl border border-white/10">
            <p class="text-[#ffd700] text-xs uppercase font-black tracking-widest">${a.title}</p>
            <p class="text-gray-300 text-sm mt-2">${a.description}</p>
            <p class="text-gray-500 text-[10px] mt-3">Unlocked: ${new Date(a.unlockedAt).toLocaleDateString()}</p>
        </div>
    `).join('');
}


function toggleFavorite(mos, title) {
    const index = favoriteMOS.findIndex(item => item.mos === mos);
    if (index === -1) {
        if (favoriteMOS.length < 5) {
            favoriteMOS.push({ mos, title });
        } else {
            favoriteMOS.shift();
            favoriteMOS.push({ mos, title });
        }
    } else {
        favoriteMOS.splice(index, 1);
    }
    saveFavorites();
    awardAchievement('favorite-star', 'Top 5 Star', 'Saved a MOS to your top 5 favorites.');
    updateFavoritesUI();
    updateCardFavorites();
}

function updateFavoritesUI() {
    const container = document.getElementById('favorite-list');
    if (!container) return;

    container.innerHTML = favoriteMOS.length === 0 ? '<p class="text-gray-400 text-xs">No favorites selected yet.</p>' : favoriteMOS.map(item => `
        <div class="flex items-center justify-between bg-zinc-800 p-2 rounded">
            <span class="text-gray-200 text-xs"><strong>${item.mos}</strong> ${item.title}</span>
            <button class="text-[#ffd700] text-xs font-black" onclick="toggleFavorite('${item.mos}','${item.title}')">Remove</button>
        </div>
    `).join('');
}

function updateCardFavorites() {
    document.querySelectorAll('#career-grid [data-mos]').forEach(card => {
        const value = card.getAttribute('data-mos');
        const btn = card.querySelector('.favorite-btn');
        if (favoriteMOS.some(item => item.mos === value)) {
            card.classList.add('recommended');
            if (btn) {
                btn.classList.add('bg-[#ffd700]');
                btn.title = 'Remove from favorites';
            }
        } else {
            card.classList.remove('recommended');
            if (btn) {
                btn.classList.remove('bg-[#ffd700]');
                btn.title = 'Add to favorites';
            }
        }
    });
}

function populateMosDropdown(data) {
    const dropdown = document.getElementById('mos-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = '<option value="">Choose MOS</option>';

    data.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.mos;
        opt.innerText = `${m.mos} - ${m.title}`;
        dropdown.appendChild(opt);
    });

    dropdown.addEventListener('change', (e) => {
        showMosDetails(e.target.value);
    });
}

function showMosDetails(mos) {
    const selected = allCareers.find(m => m.mos === mos);
    const container = document.getElementById('mos-details');
    const content = document.getElementById('mos-details-content');
    if (!selected || !container || !content) {
        if(container) container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    content.innerHTML = `
        <p><strong>MOS:</strong> ${selected.mos} - ${selected.title}</p>
        <p><strong>Description:</strong> ${selected.desc}</p>
        <p><strong>ASVAB:</strong> ${selected.asvab}</p>
        <p><strong>Training:</strong> ${selected.training}</p>
        <p><strong>Category:</strong> ${selected.cat}</p>
        <p class="text-xs text-gray-400 mt-2">Click the MOS card to mark as favorite once selected.</p>
    `;
}

function setViewMode(mode) {
    const search = document.getElementById('mos-search');
    const value = search?.value || '';
    const filtered = allCareers.filter(m => m.title.toLowerCase().includes(value.toLowerCase()) || m.mos.toLowerCase().includes(value.toLowerCase()));
    if (mode === 'list') {
        document.getElementById('career-grid').classList.remove('gap-6');
    }
    renderCareers(filtered);
}

async function initPortal() {
    try {
        const response = await fetch('careers.json');
        allCareers = await response.json();
        renderCareers(allCareers);
        populateSelectors(allCareers);
        updateFavoritesUI();
        updateCardFavorites();
        renderCallbackList();
        renderAchievements();
        lucide.createIcons();
    } catch (err) {
        console.error("Failed to load MOS data", err);
    }
}

function renderCareers(data) {
    const grid = document.getElementById('career-grid');
    const viewMode = document.getElementById('view-mode') ? document.getElementById('view-mode').value : 'cards';

    if (viewMode === 'list') {
        grid.innerHTML = data.map(m => `
            <div class="bg-zinc-900 p-4 border border-white/5 rounded-xl flex justify-between items-center gap-4" data-category="${m.cat}" data-mos="${m.mos}">
                <div>
                    <h3 class="text-sm font-black uppercase">${m.mos} - ${m.title}</h3>
                    <p class="text-gray-400 text-xs">${m.desc}</p>
                    <p class="text-gray-300 text-[11px]">ASVAB: ${m.asvab} • Training: ${m.training}</p>
                </div>
                <button class="bg-[#ffd700] text-black px-3 py-2 text-xs font-black uppercase" onclick="showMosDetails('${m.mos}')">View</button>
            </div>
        `).join('');
    } else {
        grid.innerHTML = data.map(m => `
            <div class="bg-zinc-900 p-8 border border-white/5 rounded-xl group hover:border-[#ffd700]/50 transition-all cursor-default relative" data-category="${m.cat}" data-mos="${m.mos}">
                <div class="recommended-label hidden">Recommended</div>
                <button class="favorite-btn absolute top-4 right-4 bg-black/80 border border-white/20 rounded-full w-8 h-8 flex items-center justify-center" data-mos="${m.mos}" onclick="toggleFavorite('${m.mos}','${m.title}')" title="Add to favorites">
                    <i data-lucide="star" class="w-4 h-4 text-white"></i>
                </button>
                <div class="flex justify-between items-start mb-4">
                    <span class="text-[#ffd700] font-mono text-xs font-bold uppercase tracking-widest">MOS ${m.mos}</span>
                    ${m.bonus ? '<span class="bg-[#ffd700] text-black text-[8px] font-black px-2 py-0.5 rounded-full">BONUS</span>' : ''}
                </div>
                <h3 class="text-xl font-black uppercase mb-2 group-hover:text-[#ffd700] transition-colors">${m.title}</h3>
                <p class="text-gray-400 text-sm leading-relaxed">${m.desc}</p>
                <p class="text-gray-400 text-xs mt-4">
                    <strong class="text-[#ffd700]">ASVAB Requirement:</strong> ${m.asvab}
                </p>
                <p class="text-gray-400 text-xs mt-2">
                    <strong class="text-[#ffd700]">Training Length:</strong> ${m.training}
                </p>
            </div>
        `).join('');
    }
    applyAfqtRecommendations();
    updateFavoritesUI();
}

function populateSelectors(data) {
    const s1 = document.getElementById('compare-1');
    const s2 = document.getElementById('compare-2');
    
    [s1, s2].forEach(select => {
        data.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.mos;
            opt.innerText = `${m.mos} - ${m.title}`;
            select.appendChild(opt);
        });

        select.addEventListener('change', (e) => {
            const match = data.find(m => m.mos === e.target.value);
            const detailDiv = select.nextElementSibling;
            if(match) {
                detailDiv.style.opacity = "1";
                detailDiv.innerHTML = `
                    <div class="bg-zinc-950 p-4 rounded border-l-4 border-[#ffd700]">
                        <h4 class="text-[10px] text-gray-500 uppercase font-black mb-1">Entry Requirement</h4>
                        <p class="text-sm font-bold uppercase">${match.asvab}</p>
                    </div>
                    <div class="bg-zinc-950 p-4 rounded border-l-4 border-white">
                        <h4 class="text-[10px] text-gray-500 uppercase font-black mb-1">Initial Training</h4>
                        <p class="text-sm font-bold uppercase">${match.training}</p>
                    </div>
                    <div class="bg-zinc-950 p-4 rounded border-l-4 border-gray-500">
                        <h4 class="text-[10px] text-gray-500 uppercase font-black mb-1">Role Description</h4>
                        <p class="text-sm text-gray-300">${match.desc}</p>
                    </div>
                `;
            } else { detailDiv.style.opacity = "0"; }
        });
    });

    populateMosDropdown(data);

    const viewModeSelect = document.getElementById('view-mode');
    if (viewModeSelect) {
        viewModeSelect.addEventListener('change', (e) => {
            setViewMode(e.target.value);
        });
    }

    const sortBtn = document.getElementById('sort-mos');
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            const sorted = [...allCareers].sort((a,b) => {
                const getNum = s => Number(s.match(/\d+/)?.[0] || 0);
                return getNum(a.asvab || '') - getNum(b.asvab || '');
            });
            renderCareers(sorted);
        });
    }

    const recommendedBtn = document.getElementById('show-recommended');
    if (recommendedBtn) {
        recommendedBtn.addEventListener('click', () => {
            const recCats = afqtRecommendedCategories || [];
            const recommended = allCareers.filter(m => recCats.includes(m.cat));
            if (recommended.length === 0) {
                alert('No recommendations yet; run ASVAB calculator first.');
            } else {
                renderCareers(recommended);
            }
        });
    }

    const scoreMatchBtn = document.getElementById('score-match');
    if (scoreMatchBtn) {
        scoreMatchBtn.addEventListener('click', () => {
            const weights = {
                combat: Number(document.getElementById('weight-combat').value || 3),
                intel: Number(document.getElementById('weight-intel').value || 3),
                medical: Number(document.getElementById('weight-medical').value || 3),
                engineer: Number(document.getElementById('weight-engineer').value || 3)
            };
            const results = allCareers.map(m => {
                const base = weights[m.cat] || 1;
                const raw = Number((m.asvab.match(/\d+/) || [31])[0]);
                const asvabFactor = Math.min(5, Math.round((raw / 110) * 5));
                const score = Math.round(base * 6 + asvabFactor * 4);
                return { ...m, score };
            }).sort((a,b) => b.score - a.score).slice(0, 5);

            document.getElementById('match-results').innerHTML = `Top MOS Matches:<br>` + results.map(r =>
                `<div class="border border-white/15 p-2 rounded mt-2"><strong>${r.mos}</strong> ${r.title} - Score ${r.score}</div>`
            ).join('');
            renderCareers(results);
            awardAchievement('matchmaker', 'Matchmaker', 'Computed MOS match score based on your interest weights.');
        });
    }
}


let currentQ = 0;
let quizScores = { combat:0, intel:0, medical:0, engineer:0, aviation:0 };
const questions = [
    { text: "Where do you thrive?", opts: [{t: "Solving data puzzles", c:"intel"}, {t:"Physical field work", c:"combat"}, {t:"Repairing complex tech", c:"aviation"}] },
    { text: "Your main goal?", opts: [{t: "Protecting lives", c:"medical"}, {t:"Building infrastructure", c:"engineer"}, {t:"Strategic defense", c:"combat"}] }
];

function startQuiz() {
    document.getElementById('quiz-start').classList.add('hidden');
    document.getElementById('quiz-question').classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    const q = questions[currentQ];
    document.getElementById('q-text').innerText = q.text;
    document.getElementById('q-options').innerHTML = q.opts.map(o => `
        <button onclick="handleAnswer('${o.c}')" class="p-4 border border-white/10 hover:border-[#ffd700] hover:bg-zinc-800 transition-all font-bold uppercase text-xs">${o.t}</button>
    `).join('');
}

function handleAnswer(cat) {
    quizScores[cat]++;
    currentQ++;
    if(currentQ < questions.length) showQuestion();
    else finishQuiz();
}

function finishQuiz() {
    document.getElementById('quiz-question').classList.add('hidden');
    const winner = Object.keys(quizScores).reduce((a, b) => quizScores[a] > quizScores[b] ? a : b);
    document.getElementById('quiz-result').classList.remove('hidden');
    document.getElementById('result-cat').innerText = winner;
    
    document.getElementById('roadmap').classList.remove('hidden');
    const asvabFocus = { intel: ["AR","WK"], combat:["CO","GS"], medical:["ST","GS"], engineer:["MK","MC"] };
    document.getElementById('asvab-focus').innerHTML = (asvabFocus[winner] || ["GT"]).map(t => 
        `<span class="bg-[#ffd700] text-black px-2 py-1 text-[10px] font-black">${t}</span>`
    ).join('');
    
    lucide.createIcons();
    document.getElementById('roadmap').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('mos-search').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allCareers.filter(m => m.title.toLowerCase().includes(val) || m.mos.toLowerCase().includes(val));
    renderCareers(filtered);
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'bg-[#ffd700]', 'text-black'));
        btn.classList.add('active', 'bg-[#ffd700]', 'text-black');
        const f = btn.dataset.filter;
        renderCareers(f === 'all' ? allCareers : allCareers.filter(m => m.cat === f));
    });
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });

document.querySelectorAll('.js-reveal').forEach(el => observer.observe(el));
let afqtRecommendedCategories = [];

function calculateAsvab() {
    const gt = Number(document.getElementById('asvab-gt').value || 0);
    const co = Number(document.getElementById('asvab-co').value || 0);
    const st = Number(document.getElementById('asvab-st').value || 0);
    const mm = Number(document.getElementById('asvab-mm').value || 0);
    const el = Number(document.getElementById('asvab-el').value || 0);
    const ar = Number(document.getElementById('asvab-ar').value || 0);
    const wk = Number(document.getElementById('asvab-wk').value || 0);
    const pc = Number(document.getElementById('asvab-pc').value || 0);

    const afqt = Math.round((ar + wk + pc) / 3);

    const eligible = [];
    afqtRecommendedCategories = [];

    if (afqt >= 31) {
        eligible.push('General Combat/Logistics');
        afqtRecommendedCategories.push('combat', 'logistics');
    }
    if (afqt >= 50 && gt >= 100) {
        eligible.push('Engineering & Aviation');
        afqtRecommendedCategories.push('engineer', 'aviation');
    }
    if (afqt >= 60 && gt >= 110) {
        eligible.push('Cyber & Intelligence');
        afqtRecommendedCategories.push('intel');
    }
    if (afqt >= 70 && gt >= 110 && el >= 100) {
        eligible.push('Advanced Cyber/Specialty');
        afqtRecommendedCategories.push('specialty');
    }

    afqtRecommendedCategories = [...new Set(afqtRecommendedCategories)];

    let feedback = `<p class="font-black uppercase text-[#ffd700]">Estimated AFQT: ${afqt}</p>`;
    feedback += `<p>GT: ${gt}, CO: ${co}, ST: ${st}, MM: ${mm}, EL: ${el}</p>`;
    if (eligible.length > 0) {
        feedback += `<p class="mt-2">Potential categories: <strong>${eligible.join(', ')}</strong></p>`;
        feedback += `<p class="mt-2">Recommended MOS categories highlighted.</p>`;
    } else {
        feedback += `<p class="mt-2">No category reached yet. Keep practicing and retest every 30 days.</p>`;
    }
    feedback += `<p class="mt-2 text-xs text-gray-300">Note: AFQT calculation is approximate. Final eligibility is determined by MEPS and recruiter.</p>`;

    document.getElementById('asvab-result').innerHTML = feedback;

    awardAchievement('asvab-hero', 'ASVAB Hero', 'Calculated your ASVAB score and got MOS recommendations.');
    applyAfqtRecommendations();
}

function applyAfqtRecommendations() {
    const cards = document.querySelectorAll('#career-grid > div');
    cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const label = card.querySelector('.recommended-label');
        if (afqtRecommendedCategories.includes(cat)) {
            card.classList.add('recommended');
            if (label) label.classList.remove('hidden');
        } else {
            card.classList.remove('recommended');
            if (label) label.classList.add('hidden');
        }
    });
}

function calculateTuition() {
    const tuitionTable = {
        rutgers: 1700,
        njit: 1750,
        rowan: 1500
    };
    const school = document.getElementById('tuition-school').value;
    const credits = Number(document.getElementById('tuition-credits').value || 0);
    const giPct = Number(document.getElementById('gi-bill-percent').value || 0);

    const rate = tuitionTable[school] || 0;
    const total = rate * credits;
    const giBill = Math.round(total * (giPct / 100));
    const outOfPocket = total - giBill;

    document.getElementById('tuition-result').innerHTML = `
        <p class="font-black text-[#ffd700]">Estimated Total Tuition: $${total.toLocaleString()}</p>
        <p>GI Bill Coverage: $${giBill.toLocaleString()} (${giPct}%)</p>
        <p class="text-green-400">NJ SMART tuition waiver assumes remaining amount up to $${outOfPocket.toLocaleString()}.</p>
        <p class="text-xs text-gray-400 mt-2">Actual financial aid and scholarship value may vary.</p>
    `;

    awardAchievement('finance-expert', 'Finance Expert', 'Calculated tuition and GI Bill savings estimate.');
}

function scheduleCallback() {
    const name = document.getElementById('callback-name').value.trim();
    const phone = document.getElementById('callback-phone').value.trim();
    const datetime = document.getElementById('callback-datetime').value;
    const feedback = document.getElementById('callback-feedback');

    if (!name || !phone || !datetime) {
        feedback.className = 'text-red-400 text-sm mt-4';
        feedback.innerText = 'Please fill out all fields before scheduling.';
        return;
    }

    const callbacks = JSON.parse(localStorage.getItem('recruiterCallbacks') || '[]');
    callbacks.push({ name, phone, datetime, created: new Date().toISOString() });
    localStorage.setItem('recruiterCallbacks', JSON.stringify(callbacks));

    feedback.className = 'text-green-400 text-sm mt-4';
    feedback.innerText = `Callback scheduled for ${new Date(datetime).toLocaleString()}. Recruiter will follow up soon.`;

    document.getElementById('callback-name').value = '';
    document.getElementById('callback-phone').value = '';
    document.getElementById('callback-datetime').value = '';

    awardAchievement('callback-scheduler', 'Recruiter Connection', 'Scheduled your first callback with a recruiter.');
    renderCallbackList();
    projectCareerPath();
}

function projectCareerPath() {
    const years = Number(document.getElementById('career-years').value || 0);
    const category = document.getElementById('career-category').value;
    const out = document.getElementById('career-path-output');
    if (!out) return;

    if (!years || years < 1) {
        out.innerHTML = '<p class="text-red-400">Enter a valid year between 1 and 20.</p>';
        return;
    }

    const base = {
        combat: 2600,
        intel: 2800,
        medical: 2750,
        engineer: 2900,
        aviation: 3000,
        logistics: 2650,
        specialty: 3100
    };

    const promotion = {
        low: 0.045,
        mid: 0.055,
        high: 0.065
    };

    let factor = promotion.low;
    if (category === 'intel' || category === 'specialty') factor = promotion.high;
    else if (category === 'engineer' || category === 'aviation') factor = promotion.mid;

    const schedule = [];
    let currentPay = base[category] || 2600;
    for (let y = 1; y <= years; y++) {
        currentPay = currentPay * (1 + factor);
        schedule.push({ year: y, pay: Math.round(currentPay) });
    }

    out.innerHTML = `
        <p class="text-gray-200"><strong>${years}-year projection for ${category.toUpperCase()} track:</strong></p>
        <ul class="mt-3 text-gray-300 text-xs space-y-1">
            ${schedule.map(s => `<li>Year ${s.year}: approx $${s.pay}/month</li>`).join('')}
        </ul>
        <p class="mt-3 text-gray-400 text-xs">Estimation based on predicted raise rates and does not include MOS-specific special pay, bonuses, or state-level incentives.</p>
    `;

    awardAchievement('long-game', 'The Long Game', 'Projected your career path and long-term earnings for selected MOS category.');
}


function formatTimeDiff(ms) {
    const total = Math.abs(ms);
    const minutes = Math.floor(total / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

function renderCallbackList() {
    const list = JSON.parse(localStorage.getItem('recruiterCallbacks') || '[]');
    const container = document.getElementById('callback-schedule-list');
    if (!container) return;

    if(list.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm">No callbacks scheduled yet.</p>';
        return;
    }

    const now = new Date();
    const sorted = [...list].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    const next = sorted[0];
    const nextDiff = new Date(next.datetime) - now;
    const nextStatus = nextDiff >= 0 ? `in ${formatTimeDiff(nextDiff)}` : `${formatTimeDiff(nextDiff)} ago`;

    const summary = `
        <div class="mb-4 p-3 bg-zinc-900 border border-white/10 rounded text-xs text-gray-300">
            <p><strong>Total callbacks:</strong> ${list.length}</p>
            <p><strong>Next scheduled:</strong> ${new Date(next.datetime).toLocaleString()} (${nextStatus})</p>
        </div>
    `;

    container.innerHTML = summary + sorted.map((item, index) => {
        const delta = new Date(item.datetime) - now;
        const scheduled = delta >= 0 ? `in ${formatTimeDiff(delta)}` : `${formatTimeDiff(delta)} ago`;
        const requested = Math.abs(new Date(item.created) - now);
        return `
        <div class="border-b border-white/10 py-2 flex justify-between items-start gap-3">
            <div>
                <p><strong>${item.name}</strong> &#8226; ${item.phone}</p>
                <p class="text-sm text-gray-300">${new Date(item.datetime).toLocaleString()} (scheduled ${scheduled})</p>
                <p class="text-xs text-gray-400">Requested ${formatTimeDiff(requested)} ago</p>
            </div>
            <button onclick="deleteCallback(${list.indexOf(item)})" class="bg-red-500 text-white px-2 py-1 rounded text-xs uppercase">Delete</button>
        </div>
    `;
    }).join('');
}

function deleteCallback(index) {
    const callbacks = JSON.parse(localStorage.getItem('recruiterCallbacks') || '[]');
    if (index < 0 || index >= callbacks.length) return;
    callbacks.splice(index, 1);
    localStorage.setItem('recruiterCallbacks', JSON.stringify(callbacks));
    renderCallbackList();
}

function clearCallbacks() {
    if (confirm('Clear all scheduled callbacks?')) {
        localStorage.removeItem('recruiterCallbacks');
        renderCallbackList();
    }
}

function exportCallbacks() {
    const callbacks = JSON.parse(localStorage.getItem('recruiterCallbacks') || '[]');
    if (!callbacks.length) {
        alert('No callbacks to export');
        return;
    }
    const csv = ['Name,Phone,DateTime,RequestedAt', ...callbacks.map(c => {
        const safe = x => '"' + String(x).replace(/"/g, '""') + '"';
        return `${safe(c.name)},${safe(c.phone)},${safe(c.datetime)},${safe(c.created)}`;
    })].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recruiter-callbacks.csv';
    a.click();
    URL.revokeObjectURL(url);
}


const i18n = {
    en: {
        topTag: 'Always Ready • Always There',
        heroIntro: 'Join the NJ National Guard and keep your civilian life while gaining leadership training, student benefits, and professional skills that last a lifetime.',
        overviewTitle: 'One Program, Multiple Futures',
        quizTitle: 'Mission Match Quiz',
        careersTitle: 'MOS Explorer',
        compareTitle: 'Side-by-Side Comparison',
        splitTitle: 'The Split Option',
        faqTitle: 'Frequently Asked Questions',
        contactTitle: 'Start Your Inquiry',
        applyNow: 'Apply Now',
        language: 'ES'
    },
    es: {
        topTag: 'Siempre Listo • Siempre Presente',
        heroIntro: 'Únete a la Guardia Nacional de NJ y mantén tu vida civil mientras obtienes entrenamiento de liderazgo, beneficios estudiantiles y habilidades profesionales de por vida.',
        overviewTitle: 'Un Programa, Múltiples Futuros',
        quizTitle: 'Quiz de Misión',
        careersTitle: 'Explorador MOS',
        compareTitle: 'Comparación Lado a Lado',
        splitTitle: 'Opción Dividida',
        faqTitle: 'Preguntas Frecuentes',
        contactTitle: 'Inicia tu Consulta',
        applyNow: 'Aplica Ahora',
        language: 'EN'
    }
};

function setLanguage(lang) {
    const root = i18n[lang] || i18n.en;
    document.querySelector('#hero-top-tag').innerText = root.topTag;
    document.querySelector('#hero-subtitle').innerText = root.heroIntro;
    document.querySelector('#overview-heading').innerText = root.overviewTitle;
    document.querySelector('#quiz-heading').innerText = root.quizTitle;
    document.querySelector('#careers-heading').innerText = root.careersTitle;
    document.querySelector('#compare-heading').innerText = root.compareTitle;
    document.querySelector('#split-heading').innerText = root.splitTitle;
    document.querySelector('#faq-heading').innerText = root.faqTitle;
    document.querySelector('#contact-heading').innerText = root.contactTitle;
    document.querySelectorAll('.apply-text').forEach(el => el.innerText = root.applyNow);
    document.getElementById('language-toggle').innerText = root.language;
    document.getElementById('language-toggle-mobile').innerText = root.language;
}

window.addEventListener('load', () => {
    setLanguage('en');

    document.getElementById('language-toggle').addEventListener('click', () => {
        const can = document.getElementById('language-toggle').innerText.toLowerCase();
        setLanguage(can === 'es' ? 'es' : 'en');
    });
    document.getElementById('language-toggle-mobile').addEventListener('click', () => {
        const can = document.getElementById('language-toggle-mobile').innerText.toLowerCase();
        setLanguage(can === 'es' ? 'es' : 'en');
    });

    document.getElementById('open-apply-modal').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('apply-modal').classList.remove('hidden');
    });

    document.getElementById('open-apply-modal-mobile').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('apply-modal').classList.remove('hidden');
    });

    document.getElementById('close-apply-modal').addEventListener('click', () => {
        document.getElementById('apply-modal').classList.add('hidden');
    });

    document.getElementById('apply-modal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('modal-feedback').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('apply-modal').classList.add('hidden');
            document.getElementById('modal-feedback').classList.add('hidden');
            document.getElementById('apply-modal-form').reset();
        }, 2000);
    });
});

window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if(window.scrollY > 50) nav.classList.add('scrolled', 'bg-black/95', 'py-3');
    else nav.classList.remove('scrolled', 'bg-black/95', 'py-3');
});

initPortal();