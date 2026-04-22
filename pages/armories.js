// pages/armories.js - COMPLETE Armories Module

let armories = [];
const FALLBACK_ARMORIES_URL = '../armories.json';

async function loadArmories() {
  try {
    const response = await fetch(FALLBACK_ARMORIES_URL);
    if (!response.ok) throw new Error();
    armories = await response.json();
    console.log(`🗺️ Loaded ${armories.length} armories`);
  } catch {
    console.warn('Armories load failed');
    armories = [];
  }
}

function initLeafletMap() {
  const njCenter = [40.0583, -74.4057];
  const map = L.map('armories-map').setView(njCenter, 9);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
  armories.forEach(armory => {
    const popupContent = `
      <div class="armory-popup">
        <h3>${armory.name}</h3>
        <p>${armory.address}</p>
        <p><a href="tel:${armory.phone}">${armory.phone}</a></p>
        <!-- Full popup -->
      </div>
    `;
    L.marker([armory.lat, armory.lng])
      .addTo(map)
      .bindPopup(popupContent);
  });
  
  if (armories.length) {
    const group = new L.featureGroup(armories.map(a => L.marker([a.lat, a.lng])));
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

function initArmoriesMap() {
  const container = document.getElementById('armories-map');
  if (!container || armories.length === 0) return;

  if (window.L) {
    initLeafletMap();
    return;
  }

  // Lazy load Leaflet CSS/JS (copy full logic from script.js)
  const cssLink = document.querySelector('link[data-leaflet-css]');
  if (!cssLink) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.dataset.leafletCss = 'true';
    document.head.appendChild(link);
  }

  const jsScript = document.querySelector('script[data-leaflet-js]');
  if (!jsScript) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.dataset.leafletJs = 'true';
    script.onload = initLeafletMap;
    document.head.appendChild(script);
  }
}

window.armoriesModule = {
  async init() {
    await loadArmories();
    initArmoriesMap();
  }
};
