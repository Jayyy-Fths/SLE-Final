let allCareers = [];
let armories = [];
let favoriteMOS = [];
let achievements = [];
let callbacks = [];
let currentMosModal = null;
let isDarkMode = true;
let particles = [];

const convex = new ConvexHttpClient("https://keen-condor-8.convex.cloud/gas");
const FALLBACK_CAREERS_URL = './careers.json';
const FALLBACK_ARMORIES_URL = './armories.json';

// ========================================
// CORE DATA LOADERS
// ========================================

async function loadCareersWithFallback() {
  try {
    allCareers = await convex.query("getCareers");
    if (allCareers.length === 0) {
      const response = await fetch(FALLBACK_CAREERS_URL);
      allCareers = await response.json();
    }
    console.log(`✅ Loaded ${allCareers.length} careers`);
  } catch (err) {
    console.warn('Convex careers failed, using JSON:', err);
    const response = await fetch(FALLBACK_CAREERS_URL).catch(() => null);
    if (response) allCareers = await response.json();
  }
}

async function loadArmories() {
  try {
    const response = await fetch(FALLBACK_ARMORIES_URL);
    armories = await response.json();
    console.log(`🗺️ Loaded ${armories.length} NJANG armories`);
  } catch (err) {
    console.warn('Armories load failed:', err);
    armories = [];
  }
}

// ========================================
// PARTICLE SYSTEM - Hero Background
// ========================================

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.initParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        type: Math.random() > 0.7 ? 'shield' : 'star'
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Mouse attraction
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        p.vx += dx * 0.01;
        p.vy += dy * 0.01;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = isDarkMode ? '#ffd700' : '#1f2937';
      
      if (p.type === 'shield') {
        this.ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size * 1.5);
        this.ctx.fillRect(p.x - p.size/4, p.y + p.size/2, p.size/2, p.size/2);
      } else {
        // Simple star
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y - p.size);
        for (let i = 0; i < 5; i++) {
          this.ctx.lineTo(
            p.x + p.size * Math.cos((Math.PI * 2 * i / 5) - Math.PI/2),
            p.y + p.size * Math.sin((Math.PI * 2 * i / 5) - Math.PI/2)
          );
        }
        this.ctx.closePath();
        this.ctx.fill();
      }
      
      this.ctx.restore();
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// ========================================
// 3D TILT EFFECT
// ========================================

function initTiltCards() {
  document.querySelectorAll('.mos-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      card.style.transition = 'none';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
  });
}

// ========================================
// THEME SYSTEM
// ========================================

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('darkMode');
  isDarkMode = saved !== 'false';
  
  document.body.classList.toggle('light-theme', !isDarkMode);
  
  if (toggle) {
    toggle.addEventListener('click', () => {
      isDarkMode = !isDarkMode;
      document.body.classList.toggle('light-theme', !isDarkMode);
      localStorage.setItem('darkMode', isDarkMode);
    });
  }
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ========================================
// NJ ANG ARMORIES MAP
// ========================================

function initArmoriesMap() {
  const mapContainer = document.getElementById('armories-map');
  if (!mapContainer || armories.length === 0) return;
  
  // Leaflet CSS/JS
  const mapLink = document.createElement('link');
  mapLink.rel = 'stylesheet';
  mapLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(mapLink);
  
  const scriptLink = document.createElement('script');
  scriptLink.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  scriptLink.onload = initLeafletMap;
  document.head.appendChild(scriptLink);
}

function initLeafletMap() {
  const njCenter = [40.0583, -74.4057];
  const map = L.map('armories-map').setView(njCenter, 9);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
  
  armories.forEach(armory => {
    const popupContent = `
      <div class="armory-popup">
        <h3 class="font-bold text-lg mb-2">${armory.name}</h3>
        <p class="text-sm mb-1"><strong>📍</strong> ${armory.address}</p>
        <p class="text-sm mb-1"><strong>📞</strong> <a href="tel:${armory.phone}">${armory.phone}</a></p>
        <p class="text-sm mb-3"><strong>⏰</strong> ${armory.drill}</p>
        <p class="text-xs text-gray-600 mb-2">Recruiter: ${armory.recruiter}</p>
        <button onclick="showToast('Directions opened!')" class="bg-[#ffd700] text-black px-4 py-1 rounded font-bold text-sm">Get Directions</button>
      </div>
    `;
    
    L.marker([armory.lat, armory.lng])
      .addTo(map)
      .bindPopup(popupContent, { maxWidth: 300 })
      .bindTooltip(armory.name, { permanent: false, direction: 'top' });
  });
  
  // Fit bounds to NJ armories
  if (armories.length > 0) {
    const group = new L.featureGroup(armories.map(a => L.marker([a.lat, a.lng])));
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

// ========================================
// CORE MOS FUNCTIONS (from previous)
// ========================================

async function toggleFavorite(mos, title) {
  try {
    await convex.mutation("toggleFavorite", { mos, title });
    await loadFavorites();
  } catch (e) {
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
  showToast(`⭐ ${title} ${index === -1 ? 'added' : 'removed'} from favorites!`, 'success');
}

function openMosModal(mos) {
  const selected = allCareers.find(m => m.mos === mos);
  if (!selected) return;
  
  document.getElementById('mos-modal-title').innerText = `${selected.mos} - ${selected.title}`;
  document.getElementById('mos-modal-desc').innerText = selected.desc;
  document.getElementById('mos-modal-asvab').innerText = selected.asvab;
  document.getElementById('mos-modal-training').innerText = selected.training;
  document.getElementById('mos-modal-cat').innerText = selected.cat.toUpperCase();
  document.getElementById('mos-modal-bonus').classList.toggle('hidden', !selected.bonus);
  
  document.getElementById('mos-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  currentMosModal = mos;
  showToast(`📋 Opened ${selected.title}`, 'info');
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
      <div class="mos-card p-6 flex items-center gap-4 hover:shadow-2xl" onclick="openMosModal('${m.mos}')">
        <div class="w-12 h-12 bg-gradient-to-br from-${m.cat === 'combat' ? 'red' : m.cat === 'intel' ? 'purple' : m.cat === 'medical' ? 'emerald' : 'blue'}-500 rounded-xl flex items-center justify-center">
          <i data-lucide="shield" class="w-6 h-6 text-white"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-black text-lg uppercase tracking-tight mb-1">${m.mos} ${m.title}</h4>
          <p class="text-gray-400 text-sm mb-2">${m.desc.slice(0, 80)}...</p>
          <div class="flex gap-4 text-xs text-gray-500">
            <span>ASVAB: ${m.asvab}</span>
            <span>${m.training}</span>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    grid.innerHTML = data.map(m => `
      <div class="mos-card group relative" onclick="openMosModal('${m.mos}')">
        <div class="recommended-label hidden group-hover:block">Recommended</div>
        <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite('${m.mos}','${m.title}')">
          <i data-lucide="star" class="w-5 h-5"></i>
        </button>
        <div class="mb-4">
          <span class="text-[#ffd700] font-mono text-sm font-bold uppercase tracking-wider">MOS ${m.mos}</span>
          ${m.bonus ? '<span class="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">BONUS</span>' : ''}
        </div>
        <h3 class="text-xl font-black uppercase mb-3 group-hover:text-[#ffd700]">${m.title}</h3>
        <p class="text-gray-400 mb-4">${m.desc}</p>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-zinc-800 px-3 py-2 rounded-lg">
            <span class="text-gray-400 text-[10px] uppercase tracking-wider block">ASVAB</span>
            <span class="font-mono font-bold">${m.asvab}</span>
          </div>
          <div class="bg-zinc-800 px-3 py-2 rounded-lg">
            <span class="text-gray-400 text-[10px] uppercase tracking-wider block">Training</span>
            <span class="font-bold">${m.training}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  updateCardFavorites();
  initTiltCards(); // Re-apply tilt after render
  lucide.createIcons();
}

// ... [rest of MOS functions unchanged from previous version]

async function initPortal() {
  await loadCareersWithFallback();
  await loadArmories();
  await loadFavorites();
  await loadAchievements();
  await loadCallbacks();
  
  renderCareers(allCareers);
  populateSelectors(allCareers);
  updateFavoritesUI();
  updateCardFavorites();
  renderAchievements();
  initThemeToggle();
  
  // Event listeners
  document.getElementById('mos-search')?.addEventListener('input', throttle((e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allCareers.filter(m => 
      m.title.toLowerCase().includes(val) || m.mos.toLowerCase().includes(val)
    );
    renderCareers(filtered);
  }, 200));
  
  // Particles
  const particleCanvas = document.createElement('canvas');
  particleCanvas.id = 'particles-canvas';
  particleCanvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1;';
  document.body.prepend(particleCanvas);
  new ParticleSystem(particleCanvas);
  
  // Theme body class listener
  document.body.addEventListener('mousemove', (e) => {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
      canvas.mouse = { x: e.clientX, y: e.clientY };
    }
  });
  
  lucide.createIcons();
  console.log('🚀 NJANG Portal Enhanced - Map/Particles/Tilt Ready!');
}

// Throttle helper
function throttle(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

window.addEventListener('load', initPortal);
window.addEventListener('resize', () => {
  const canvas = document.getElementById('particles-canvas');
  if (canvas) canvas.__particleSystem?.resize();
});
