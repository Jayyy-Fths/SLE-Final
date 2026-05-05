async function initIndexPage() {
    if (!window.shared) {
        setTimeout(initIndexPage, 100);
        return;
    }

    const armories = await window.shared.loadArmories();
    const careers = await window.shared.loadCareers();

    setupHomeZipSearch(armories);
    renderFeaturedMos(careers);
    renderSavedFavorites(careers);
    setupMissionQuiz(careers);

    window.updateFavoritesSection = () => renderSavedFavorites(careers);
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
            <div class="mt-8 text-left">
                <a href="eligibility.html" class="inline-block bg-white text-black px-8 py-4 font-black uppercase rounded-2xl hover:bg-gray-100 shadow-2xl transition-all">Check Full Eligibility</a>
            </div>
        </div>
    `;

    const questionsWrapper = document.getElementById('quiz-questions');
    const quizState = { focus: 'combat', training: 'rapid', environment: 'local' };

    QUIZ_QUESTIONS.forEach(question => {
        const block = document.createElement('div');
        block.innerHTML = `
            <div class="quiz-card">
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
        return;
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
