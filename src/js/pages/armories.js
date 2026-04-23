// armories.js - Armories map and ZIP search functionality
document.addEventListener('DOMContentLoaded', async () => {
    const zipInput = document.getElementById('zip-search');
    const zipBtn = document.getElementById('zip-find-btn');
    const feedback = document.getElementById('zip-feedback');
    const nearestDiv = document.getElementById('nearest-armories');

    if (!window.shared) return;

    const armories = await window.shared.loadArmories();

    if (zipBtn && zipInput) {
        zipBtn.addEventListener('click', () => {
            const zip = zipInput.value.trim();
            if (!zip || zip.length !== 5) {
                if (feedback) feedback.textContent = 'Please enter a valid 5-digit ZIP code';
                return;
            }

            const closest = armories.sort((a, b) => {
                const distA = Math.abs(parseInt(a.zip || '0') - parseInt(zip));
                const distB = Math.abs(parseInt(b.zip || '0') - parseInt(zip));
                return distA - distB;
            }).slice(0, 3);

            if (nearestDiv) {
                nearestDiv.innerHTML = closest.map(armory => `
                    <div class="armory-nearest-card">
                        <h4>${armory.name}</h4>
                        <p>${armory.address}</p>
                        <p class="text-[#ffd700] text-sm mt-2">📞 ${armory.phone}</p>
                        <p class="text-gray-400 text-sm">⏰ ${armory.drill}</p>
                    </div>
                `).join('');
            }

            if (feedback) feedback.textContent = `Found nearest armories to ZIP ${zip}`;
        });

        zipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') zipBtn.click();
        });
    }

    const drillList = document.getElementById('drill-list');
    if (drillList) {
        drillList.innerHTML = `
            <div class="flex items-start gap-3">
                <span class="text-[#ffd700] font-black">1</span>
                <div>
                    <h5 class="font-bold">One Weekend per Month</h5>
                    <p class="text-gray-400 text-xs">Typically Saturday-Sunday 0730-1730</p>
                </div>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-[#ffd700] font-black">2</span>
                <div>
                    <h5 class="font-bold">Two Weeks Annual Training</h5>
                    <p class="text-gray-400 text-xs">Usually summer or as scheduled</p>
                </div>
            </div>
            <div class="flex items-start gap-3">
                <span class="text-[#ffd700] font-black">3</span>
                <div>
                    <h5 class="font-bold">State Activations</h5>
                    <p class="text-gray-400 text-xs">May be called for state emergencies</p>
                </div>
            </div>
        `;
    }

    const armoryCount = document.getElementById('armory-count');
    if (armoryCount) {
        armoryCount.innerHTML = `<i data-lucide="map-pin" class="w-4 h-4 inline mr-2"></i> ${armories.length}+ NJ Armories`;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
});
