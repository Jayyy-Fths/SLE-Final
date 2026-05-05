// armories.js - Armories map and ZIP search functionality

async function initArmories() {
    if (!window.shared) {
        setTimeout(initArmories, 100);
        return;
    }

    const zipInput    = document.getElementById('zip-search');
    const zipBtn      = document.getElementById('zip-find-btn');
    const feedback    = document.getElementById('zip-feedback');
    const nearestDiv  = document.getElementById('nearest-armories');
    const mapContainer = document.getElementById('armories-map');

    const armories = await window.shared.loadArmories();

    // Initialize Leaflet map
    if (mapContainer && typeof L !== 'undefined') {
        // Do NOT clear innerHTML — the overlay div inside the container must stay visible
        const map = L.map('armories-map').setView([40.3, -74.5], 8);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap, &copy; CartoDB',
            maxZoom: 19
        }).addTo(map);

        // Custom gold marker icon
        const goldIcon = L.divIcon({
            className: '',
            html: '<div style="width:14px;height:14px;background:#ffd700;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(255,215,0,0.8)"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        armories.forEach(armory => {
            if (armory.lat && armory.lng) {
                const marker = L.marker([armory.lat, armory.lng], { icon: goldIcon }).addTo(map);
                marker.bindPopup(`
                    <div style="font-family:sans-serif;min-width:220px">
                        <strong style="font-size:1rem">${armory.name}</strong><br>
                        <span style="color:#555">${armory.address}</span><br>
                        <span style="color:#ff8c00;font-weight:bold">${armory.phone}</span><br>
                        <span style="font-size:0.85rem">Drill: ${armory.drill}</span><br>
                        <span style="font-size:0.75rem;color:#888">Recruiter: ${armory.recruiter}</span>
                    </div>
                `);
            }
        });

        // Fit to show all markers
        const validCoords = armories.filter(a => a.lat && a.lng).map(a => [a.lat, a.lng]);
        if (validCoords.length > 0) {
            map.fitBounds(validCoords, { padding: [50, 50], maxZoom: 11 });
        }

        window.armoryMap = map;
    }

    // Update armory count overlay
    const armoryCount = document.getElementById('armory-count');
    if (armoryCount) {
        armoryCount.innerHTML = `<i data-lucide="map-pin" class="w-4 h-4 inline mr-2"></i> ${armories.length} NJ Armories`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // ZIP proximity search using Haversine distance
    function haversine(lat1, lng1, lat2, lng2) {
        const R = 3958.8; // miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Rough ZIP→lat/lng lookup for NJ ZIP code ranges
    function zipToLatLng(zip) {
        const n = parseInt(zip);
        if (n >= 7001 && n <= 7999)   return { lat: 40.75, lng: -74.2 };  // North NJ
        if (n >= 8001 && n <= 8099)   return { lat: 40.1,  lng: -74.7 };  // Central NJ
        if (n >= 8100 && n <= 8299)   return { lat: 39.8,  lng: -74.9 };  // South NJ
        if (n >= 8300 && n <= 8499)   return { lat: 39.5,  lng: -75.0 };  // SW NJ
        return { lat: 40.3, lng: -74.5 };  // fallback: center of NJ
    }

    if (zipBtn && zipInput) {
        const doSearch = () => {
            const zip = zipInput.value.trim();
            if (!zip || zip.length !== 5 || !/^\d{5}$/.test(zip)) {
                if (feedback) feedback.textContent = 'Please enter a valid 5-digit ZIP code.';
                return;
            }

            const origin = zipToLatLng(zip);
            const sorted = [...armories]
                .filter(a => a.lat && a.lng)
                .map(a => ({ ...a, dist: haversine(origin.lat, origin.lng, a.lat, a.lng) }))
                .sort((a, b) => a.dist - b.dist);

            const closest = sorted.slice(0, 3);

            if (typeof L !== 'undefined' && window.armoryMap) {
                const bounds = closest.map(a => [a.lat, a.lng]);
                if (bounds.length > 0) {
                    window.armoryMap.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
                }
            }

            if (nearestDiv) {
                nearestDiv.innerHTML = closest.map(a => `
                    <div class="armory-nearest-card">
                        <h4>${a.name}</h4>
                        <p>${a.address}</p>
                        <p class="text-[#ffd700] text-sm mt-2">📞 ${a.phone}</p>
                        <p class="text-gray-400 text-sm">⏰ Drill: ${a.drill}</p>
                        <p class="text-gray-500 text-xs mt-1">~${Math.round(a.dist)} mi away • Recruiter: ${a.recruiter}</p>
                    </div>
                `).join('');
            }

            if (feedback) feedback.textContent = `Showing 3 nearest armories to ZIP ${zip}`;
        };

        zipBtn.addEventListener('click', doSearch);
        zipInput.addEventListener('keypress', e => { if (e.key === 'Enter') doSearch(); });
    }

    // Drill schedule sidebar
    const drillList = document.getElementById('drill-list');
    if (drillList) {
        drillList.innerHTML = `
            <div class="flex items-start gap-3">
                <span class="text-[#ffd700] font-black text-lg">1</span>
                <div>
                    <h5 class="font-bold">One Weekend per Month</h5>
                    <p class="text-gray-400 text-xs mt-1">Typically Saturday–Sunday 0730–1730</p>
                </div>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-[#ffd700] font-black text-lg">2</span>
                <div>
                    <h5 class="font-bold">Two Weeks Annual Training</h5>
                    <p class="text-gray-400 text-xs mt-1">Usually summer or as scheduled by unit</p>
                </div>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-[#ffd700] font-black text-lg">3</span>
                <div>
                    <h5 class="font-bold">State Activations</h5>
                    <p class="text-gray-400 text-xs mt-1">May be called for state emergencies and disasters</p>
                </div>
            </div>
        `;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArmories);
} else {
    initArmories();
}
