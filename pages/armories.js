// pages/armories.js - Armories Map Module

let armories = [];
const FALLBACK_ARMORIES_URL = './armories.json';

async function loadArmories() {
  try {
    const response = await fetch(FALLBACK_ARMORIES_URL);
    if (!response.ok) {
      console.warn('Armories fetch failed:', response.status);
      return [];
    }
    const data = await response.json();
    armories = Array.isArray(data) ? data : [];
    console.log(`🗺️ Loaded ${armories.length} armories`);
    return armories;
  } catch (err) {
    console.warn('Armories load error:', err);
    return [];
  }
}

async function initArmoriesSearch() {
  // Populate search functionality if armories were loaded
  const searchInput = document.getElementById('armory-search');
  if (searchInput && armories.length > 0) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = armories.filter(a => 
        (a.name && a.name.toLowerCase().includes(query)) || 
        (a.city && a.city.toLowerCase().includes(query)) ||
        (a.zip && a.zip.includes(query))
      );
      displayArmories(filtered);
    });
    displayArmories(armories);
  }
}

function displayArmories(list) {
  const container = document.getElementById('armories-list');
  if (!container) return;
  
  if (list.length === 0) {
    container.innerHTML = '<p class="col-span-full text-center text-gray-400">No armories found</p>';
    return;
  }
  
  container.innerHTML = list.map(armory => `
    <div class="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl hover:border-[#ffd700] transition-all">
      <h3 class="font-black text-lg mb-2">${armory.name || 'Armory'}</h3>
      <p class="text-gray-400 text-sm mb-2">${armory.address || ''}</p>
      <p class="text-gray-400 text-sm mb-3">${armory.city || ''}, ${armory.state || 'NJ'} ${armory.zip || ''}</p>
      ${armory.phone ? `<p class="text-[#ffd700] font-mono text-sm"><a href="tel:${armory.phone}">${armory.phone}</a></p>` : ''}
    </div>
  `).join('');
}

async function initArmoriesModule() {
  console.log('🚀 Initializing armories module');
  
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Load and display armories
  await loadArmories();
  await initArmoriesSearch();
  
  console.log('✅ Armories module ready');
}

window.armoriesModule = {
  init: initArmoriesModule
};
