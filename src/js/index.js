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

    window.updateFavoritesSection = () => renderSavedFavorites(careers);
    window.renderCareers = () => renderFeaturedMos(careers);
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
