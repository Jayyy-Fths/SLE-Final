async function initIndexPage() {
    if (!window.shared) {
        setTimeout(initIndexPage, 100);
        return;
    }

    const armories = await window.shared.loadArmories();
    const careers = await window.shared.loadCareers();

    setupHomeZipSearch(armories);
    renderEvents();
    renderTestimonials();
    renderFeaturedMos(careers);
    renderSavedFavorites(careers);
    renderSavedMatch();
    setupMissionQuiz(careers);

    window.updateFavoritesSection = () => {
        renderSavedFavorites(careers);
        renderSavedMatch();
    };
    window.renderCareers = () => renderFeaturedMos(careers);
}

const QUIZ_QUESTIONS = [
    {
        id: 'focus',
        title: 'What mission fits you best?',
        options: [
            { value: 'combat', label: 'Frontline, action, leadership' },
            { value: 'intel', label: 'Cyber, tech, information' },
            { value: 'medical', label: 'Care, emergency medicine, support' },
            { value: 'logistics', label: 'Supply, transport, planning' }
        ]
    },
    {
        id: 'training',
        title: 'How do you want to train?',
        options: [
            { value: 'rapid', label: 'Fast path and hands-on' },
            { value: 'specialized', label: 'Advanced technical school' },
            { value: 'team', label: 'Team-based leadership' },
            { value: 'support', label: 'Support and mission sustainment' }
        ]
    },
    {
        id: 'environment',
        title: 'Where do you prefer to serve?',
        options: [
            { value: 'local', label: 'Close to home, local support' },
            { value: 'travel', label: 'Travel, aviation, field work' },
            { value: 'indoors', label: 'Tech, command center' },
            { value: 'outdoors', label: 'Field, tactical, operations' }
        ]
    }
];

const EVENT_LIST = [
    { title: 'NJ Guard Open House', date: 'Jun 14', location: 'Jersey City Armory', type: 'Open House', description: 'Meet recruiters, ask questions, and tour the facility with current soldiers.' },
    { title: 'Recruiting Info Session', date: 'Jun 22', location: 'Newark Armory', type: 'Info Session', description: 'Learn about MOS options, training timelines, and tuition benefits.' },
    { title: 'Fitness & ASVAB Preview', date: 'Jul 5', location: 'Freehold Armory', type: 'Assessment', description: 'Get a free ASVAB practice session and physical readiness briefing.' }
];

const TESTIMONIALS = [
    { name: 'Alyssa M.', role: 'Infantryman · 119th Infantry Regiment', quote: 'Joining the NJ Guard gave me leadership skills, cash for school, and purpose in my community. The recruiters made the process feel personal and real.', location: 'Camden, NJ' },
    { name: 'Derek P.', role: 'Cyber Operations Specialist', quote: 'I wanted a tech career with real impact. The Guard helped me train in cyber defense while I finished my degree part-time.', location: 'Princeton, NJ' },
    { name: 'Maria S.', role: 'Health Care Specialist', quote: 'The training was intense but rewarding, and the tuition benefits covered my college classes. My unit supports my civilian job too.', location: 'Atlantic City, NJ' }
];

const SAVED_MATCH_KEY = 'njng_saved_quiz_match';

function setupMissionQuiz(careers) {
    const container = document.getElementById('quiz-form-container');
    if (!container) return;

    container.innerHTML = `
        <div class="quiz-card">
            <h3>Mission Quiz</h3>
            <p class="text-gray-400 mb-6">Choose the options that match your strengths and goals. The results will recommend an MOS category and top careers.</p>
            <div id="quiz-questions" class="grid gap-6"></div>
            <label class="block text-left">
                <span class="text-sm font-bold uppercase tracking-wide mb-2 block text-gray-300">ASVAB confidence score</span>
                <input type="range" id="quiz-asvab" min="80" max="140" value="105" class="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#ffd700]">
                <output id="quiz-asvab-value" class="text-[#ffd700] font-mono font-bold text-lg block mt-3">105</output>
            </label>
            <button id="quiz-submit" class="mt-8 w-full bg-[#ffd700] text-black px-8 py-4 font-black uppercase rounded-2xl hover:bg-white shadow-2xl transition-all">Get My Match</button>
        </div>
        <div id="quiz-results" class="hidden quiz-card mt-8">
            <div class="quiz-summary mb-8">
                <div>
                    <div class="text-gray-400 uppercase text-sm">Recommended Path</div>
                    <div id="quiz-result-category" class="text-3xl font-black mt-2"></div>
                </div>
                <div>
                    <div class="text-gray-400 uppercase text-sm">Estimated Score</div>
                    <div id="quiz-result-score" class="quiz-score font-black mt-2"></div>
                </div>
            </div>
            <div id="quiz-result-message" class="text-gray-200 text-lg leading-relaxed mb-8"></div>
            <div id="quiz-result-cards" class="grid md:grid-cols-3 gap-6"></div>
            <div id="quiz-result-actions" class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"></div>
                <h3>${question.title}</h3>
                <div class="quiz-options" data-question="${question.id}"></div>
            </div>
        `;

        questionsWrapper.appendChild(block);
        const optionsContainer = block.querySelector('.quiz-options');

        question.options.forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'quiz-option';
            button.textContent = option.label;
            button.dataset.value = option.value;
            if (quizState[question.id] === option.value) button.classList.add('active');
            button.addEventListener('click', () => {
                quizState[question.id] = option.value;
                optionsContainer.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('active'));
                button.classList.add('active');
            });
            optionsContainer.appendChild(button);
        });
    });

    const asvabInput = document.getElementById('quiz-asvab');
    const asvabValue = document.getElementById('quiz-asvab-value');
    asvabInput?.addEventListener('input', (e) => {
        asvabValue.textContent = e.target.value;
    });

    document.getElementById('quiz-submit')?.addEventListener('click', () => {
        const asvab = parseInt(asvabInput.value);
        const match = computeQuizMatch(quizState, asvab, careers);
        displayQuizResults(match);
    });
}

function computeQuizMatch(quizState, asvab, careers) {
    const categoryWeight = { combat: 3, intel: 2.5, medical: 2, logistics: 1.5 };
    const scores = { combat: 0, intel: 0, medical: 0, logistics: 0, aviation: 0, engineer: 0 };

    if (quizState.focus === 'combat') scores.combat += 3;
    if (quizState.focus === 'intel') scores.intel += 3;
    if (quizState.focus === 'medical') scores.medical += 3;
    if (quizState.focus === 'logistics') scores.logistics += 3;

    if (quizState.training === 'rapid') {
        scores.combat += 2;
        scores.logistics += 1;
    } else if (quizState.training === 'specialized') {
        scores.intel += 2;
        scores.engineer += 2;
    } else if (quizState.training === 'team') {
        scores.combat += 2;
        scores.logistics += 1;
    } else if (quizState.training === 'support') {
        scores.medical += 2;
        scores.logistics += 2;
    }

    if (quizState.environment === 'local') {
        scores.logistics += 2;
        scores.combat += 1;
    } else if (quizState.environment === 'travel') {
        scores.aviation += 3;
        scores.combat += 1;
    } else if (quizState.environment === 'indoors') {
        scores.intel += 3;
        scores.engineer += 1;
    } else if (quizState.environment === 'outdoors') {
        scores.combat += 2;
        scores.engineer += 1;
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topCategory = sorted[0][0];
    const topScore = Math.min(Math.round((scores[topCategory] / 10) * 100), 100);

    const recommended = careers
        .filter(c => c.cat === topCategory || (topCategory === 'engineer' && c.cat === 'engineer') || (topCategory === 'aviation' && c.cat === 'aviation'))
        .filter(c => {
            const match = c.asvab.match(/(\d+)/);
            const required = match ? parseInt(match[1]) : 90;
            return required <= asvab;
        })
        .sort((a, b) => (b.bonus === true) - (a.bonus === true))
        .slice(0, 3);

    return {
        category: topCategory,
        score: topScore,
        message: `You are best matched with ${topCategory.toUpperCase()} mission roles based on your answers. These MOS options fit your interest and ASVAB score.`,
        recommended
    };
}

function displayQuizResults(match) {
    const resultsSection = document.getElementById('quiz-results');
    const categoryEl = document.getElementById('quiz-result-category');
    const scoreEl = document.getElementById('quiz-result-score');
    const messageEl = document.getElementById('quiz-result-message');
    const cardsEl = document.getElementById('quiz-result-cards');

    if (!resultsSection || !categoryEl || !scoreEl || !messageEl || !cardsEl) return;

    resultsSection.classList.remove('hidden');
    categoryEl.textContent = match.category.toUpperCase();
    scoreEl.textContent = `${match.score}%`;
    messageEl.textContent = match.message;
    cardsEl.innerHTML = '';
    if (match.recommended.length) {
        match.recommended.forEach(mos => {
            const card = document.createElement('div');
            card.className = 'quiz-result-card';
            card.innerHTML = `
                <div class="text-[#ffd700] uppercase text-xs font-black mb-3">${mos.mos}</div>
                <h4 class="font-black text-xl mb-2">${mos.title}</h4>
                <p class="text-gray-300 mb-3">${mos.desc}</p>
                <div class="text-sm text-gray-400">ASVAB: ${mos.asvab}</div>
            `;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'mt-4 bg-[#ffd700] text-black px-4 py-3 font-black uppercase rounded-xl hover:bg-white transition-all';
            button.textContent = 'View Details';
            button.addEventListener('click', () => window.shared.openMosModal(mos));
            card.appendChild(button);
            cardsEl.appendChild(card);
        });
    } else {
        const card = document.createElement('div');
        card.className = 'quiz-result-card';
        card.innerHTML = '<p class="text-gray-400">No MOS recommendations matched your ASVAB score and selected mission type. Try adjusting your ASVAB estimate or answer set.</p>';
        cardsEl.appendChild(card);
    }

    const actions = document.getElementById('quiz-result-actions');
    if (actions) {
        actions.innerHTML = '';
        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'save-match-btn';
        saveBtn.textContent = 'Save This Match';
        saveBtn.addEventListener('click', () => {
            saveQuizMatch({
                category: match.category,
                score: match.score,
                message: match.message,
                recommended: match.recommended,
                date: new Date().toISOString()
            });
            window.shared.showToast('Match saved for later.', 'success');
        });
        actions.appendChild(saveBtn);
    }
}

function getSavedMatch() {
    try {
        return JSON.parse(localStorage.getItem(SAVED_MATCH_KEY) || 'null');
    } catch (e) {
        return null;
    }
}

function saveQuizMatch(match) {
    localStorage.setItem(SAVED_MATCH_KEY, JSON.stringify(match));
    renderSavedMatch();
}

function renderSavedMatch() {
    const container = document.getElementById('saved-match-card');
    if (!container) return;

    const saved = getSavedMatch();
    if (!saved) {
        container.innerHTML = `
            <div class="save-match-card">
                <h4 class="font-black text-2xl mb-3">No saved match yet</h4>
                <p class="text-gray-400">Take the mission quiz and save your best fit for easy review with a recruiter.</p>
                <div class="mt-6">
                    <a href="#quiz" class="save-match-btn">Go Take the Quiz</a>
                </div>
            </div>
        `;
        return;
    }

    const recommendations = saved.recommended || [];
    container.innerHTML = `
        <div class="save-match-card">
            <div class="save-match-meta">
                <div>
                    <span class="save-match-pill">${saved.category.toUpperCase()}</span>
                    <h4 class="font-black text-2xl mt-4">${saved.score}% Match</h4>
                </div>
                <div class="text-right text-gray-400">
                    <p>Saved ${new Date(saved.date).toLocaleDateString()}</p>
                </div>
            </div>
            <p class="text-gray-400">${saved.message}</p>
            <div class="grid gap-3">
                ${recommendations.map(mos => `
                    <div class="bg-zinc-900/50 border border-white/10 p-4 rounded-2xl">
                        <div class="text-[#ffd700] uppercase text-xs font-black mb-2">${mos.mos}</div>
                        <div class="font-bold">${mos.title}</div>
                        <div class="text-gray-400 text-sm mt-1">ASVAB: ${mos.asvab}</div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-6 flex flex-wrap gap-3 justify-center">
                <button onclick="saveQuizMatch(getSavedMatch()); window.shared.showToast('Match refreshed', 'success');" class="save-match-btn">Refresh Match</button>
                <a href="contact.html" class="save-match-btn">Share with Recruiter</a>
            </div>
        </div>
    `;
}

function renderEvents() {
    const container = document.getElementById('event-cards');
    if (!container) return;

    container.innerHTML = EVENT_LIST.map(event => `
        <article class="event-card">
            <div class="text-xs uppercase tracking-[0.3em] text-[#ffd700] font-black mb-3">${event.type}</div>
            <h4 class="font-black mb-2">${event.title}</h4>
            <p class="text-gray-400 mb-4">${event.description}</p>
            <div class="text-sm text-[#ffd700] font-bold mb-2">${event.date}</div>
            <div class="text-gray-400 text-sm">${event.location}</div>
        </article>
    `).join('');
}

function renderTestimonials() {
    const container = document.getElementById('testimonial-cards');
    if (!container) return;

    container.innerHTML = TESTIMONIALS.map(testimonial => `
        <article class="testimonial-card">
            <p class="quote text-gray-200 mb-6">“${testimonial.quote}”</p>
            <h4 class="font-black mb-2">${testimonial.name}</h4>
            <p class="text-[#ffd700] uppercase text-xs tracking-[0.3em] font-black mb-1">${testimonial.role}</p>
            <p class="text-gray-400 text-sm">${testimonial.location}</p>
        </article>
    `).join('');
}

function zipToLatLng(zip) {
    const n = Number(zip);
    if (n >= 7001 && n <= 7999) return { lat: 40.75, lng: -74.2 };
    if (n >= 8001 && n <= 8099) return { lat: 40.1, lng: -74.7 };
    if (n >= 8100 && n <= 8299) return { lat: 39.8, lng: -74.9 };
    if (n >= 8300 && n <= 8499) return { lat: 39.5, lng: -75.0 };
    return { lat: 40.3, lng: -74.5 };
}

function haversine(lat1, lng1, lat2, lng2) {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatArmoryCard(armory) {
    return `
        <div class="home-armory-card">
            <h4>${armory.name}</h4>
            <p class="text-gray-400">${armory.address}</p>
            <p class="text-gray-400 text-sm mt-2">Drill: ${armory.drill}</p>
            <p class="text-[#ffd700] text-sm mt-3">📞 ${armory.phone}</p>
            <p class="text-gray-500 text-xs mt-2">Recruiter: ${armory.recruiter}</p>
        </div>
    `;
}

function showArmoryResults(results, zip) {
    const container = document.getElementById('home-armory-results');
    const message = document.getElementById('home-zip-message');

    if (!container || !message) return;

    if (!results.length) {
        container.innerHTML = '';
        message.textContent = `No armories found for ZIP ${zip}. Try another NJ ZIP code.`;
        const recruiterSummary = document.getElementById('home-zip-recruiter');
        if (recruiterSummary) recruiterSummary.classList.add('hidden');
        return;
    }

    const nearest = results[0];
    const recruiterSummary = document.getElementById('home-zip-recruiter');
    if (recruiterSummary) {
        recruiterSummary.classList.remove('hidden');
        recruiterSummary.innerHTML = `
            <strong>Nearest recruiter:</strong> ${nearest.recruiter} · ${nearest.name}<br>
            <span>${nearest.address}</span><br>
            <span class="text-[#ffd700]">${nearest.phone}</span><br>
            <a href="tel:${nearest.phone.replace(/[^0-9]/g, '')}" class="save-match-btn inline-block mt-3">Call Recruiter</a>
        `;
    }

    message.textContent = `Showing ${results.length} nearest armories to ${zip}.`;
    container.innerHTML = results.map(formatArmoryCard).join('');
}

function setupHomeZipSearch(armories) {
    const input = document.getElementById('home-zip-input');
    const button = document.getElementById('home-zip-search');

    if (!input || !button) return;

    const search = () => {
        const zip = input.value.trim();
        if (!/^[0-9]{5}$/.test(zip)) {
            window.shared.showToast('Please enter a valid 5-digit ZIP code.', 'info');
            return;
        }

        const origin = zipToLatLng(zip);
        const sorted = armories
            .filter(a => Number.isFinite(a.lat) && Number.isFinite(a.lng))
            .map(a => ({ ...a, dist: haversine(origin.lat, origin.lng, a.lat, a.lng) }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 3);

        showArmoryResults(sorted, zip);
        window.shared.showToast(`Nearest armories loaded for ${zip}.`, 'success');
    };

    button.addEventListener('click', search);
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            search();
        }
    });
}

function createMosFeatureCard(mosData) {
    const card = document.createElement('div');
    card.className = 'feature-card';
    card.innerHTML = `
        <div>
            <span class="badge">${mosData.bonus ? 'Bonus' : 'Popular'}</span>
            <h3>${mosData.mos} · ${mosData.title}</h3>
            <p>${mosData.desc}</p>
        </div>
        <div class="mt-6 flex flex-wrap gap-3 items-center">
            <button type="button" class="bg-[#ffd700] text-black px-4 py-3 font-black uppercase rounded-xl hover:bg-white transition-all mos-open-btn">View Details</button>
            <button type="button" class="border border-white/20 px-4 py-3 font-bold uppercase rounded-xl hover:border-[#ffd700] hover:text-[#ffd700] transition-all mos-fav-btn">${window.shared.isFavorited(mosData.mos) ? 'Favorited' : 'Save'}</button>
        </div>
    `;

    card.querySelector('.mos-open-btn')?.addEventListener('click', () => {
        window.shared.openMosModal(mosData);
    });

    card.querySelector('.mos-fav-btn')?.addEventListener('click', () => {
        window.shared.toggleFavorite(null, mosData);
        card.querySelector('.mos-fav-btn').textContent = window.shared.isFavorited(mosData.mos) ? 'Favorited' : 'Save';
        renderSavedFavorites(window.cachedCareers || []);
    });

    return card;
}

function renderFeaturedMos(careers) {
    const container = document.getElementById('featured-mos-list');
    if (!container) return;

    window.cachedCareers = careers;
    const featured = careers
        .filter(item => item.bonus)
        .slice(0, 3);

    if (!featured.length) {
        container.innerHTML = '<p class="text-gray-400">No featured MOS are available right now.</p>';
        return;
    }

    container.innerHTML = '';
    featured.forEach(mos => container.appendChild(createMosFeatureCard(mos)));
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderSavedFavorites(careers) {
    const container = document.getElementById('favorite-list');
    if (!container) return;

    const favorites = window.shared.getFavorites();
    if (!favorites.length) {
        container.innerHTML = '<div class="feature-card"><p class="text-gray-400">You have no saved favorites yet. Save a career to compare training and recruiter options later.</p></div>';
        return;
    }

    const saved = careers.filter(item => favorites.includes(item.mos)).slice(0, 4);
    container.innerHTML = saved.length
        ? saved.map(item => `
            <div class="feature-card">
                <span class="badge">Saved</span>
                <h3>${item.mos} · ${item.title}</h3>
                <p>${item.desc}</p>
                <p class="text-gray-400 text-sm mt-3">ASVAB: ${item.asvab} · ${item.training}</p>
            </div>
        `).join('')
        : '<div class="feature-card"><p class="text-gray-400">Your saved favorites are not available yet.</p></div>';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIndexPage);
} else {
    initIndexPage();
}
