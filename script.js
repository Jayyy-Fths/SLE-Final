let allCareers = [];
let armories = [];
let favoriteMOS = [];
window.currentMosModal = null;
let isDarkMode = true;
let allCareers = [];
let armories = [];
let favoriteMOS = [];
window.currentMosModal = null;
let isDarkMode = true;
let quizIndex = 0;
let quizAnswers = [];
let currentLanguage = 'en';
let activeCategory = 'all';
let currentSort = 'title-asc';
let currentSearch = '';

const FALLBACK_CAREERS_URL = './careers.json';
const FALLBACK_ARMORIES_URL = './armories.json';
const SUPPORTED_LANGUAGES = new Set(['en', 'es']);
const MAX_FAVORITES = 5;
const APPLY_FORM_DRAFT_KEY = 'applyModalDraftV1';
const NJ_ZIP_COORDS = {
  '07030': [40.7440, -74.0324], // Hoboken
  '07102': [40.7357, -74.1724], // Newark
  '07302': [40.7215, -74.0471], // Jersey City
  '07501': [40.9168, -74.1718], // Paterson
  '08608': [40.2206, -74.7699], // Trenton
  '07740': [40.3043, -74.0160], // Long Branch
  '08753': [39.9537, -74.1979], // Toms River
  '08002': [39.9340, -75.0260], // Cherry Hill
  '08360': [39.4860, -75.0257], // Vineland
  '08201': [39.3643, -74.4229] // Atlantic City
};
const FALLBACK_CAREERS_URL = './careers.json';
const FALLBACK_ARMORIES_URL = './armories.json';
const SUPPORTED_LANGUAGES = new Set(['en', 'es']);
const MAX_FAVORITES = 5;

const languageStrings = {
  en: {
    nav: {
      overview: 'Overview',
      quiz: 'Mission Quiz',
      careers: 'Careers',
      armories: 'Armories',
      split: 'Split Option',
      faq: 'FAQ'
    },
    hero: {
      topTag: 'Always Ready • Always There',
      heading: 'OWN YOUR <br><span class="text-[#ffd700]">FUTURE.</span>',
      subtitle: 'Join the NJ National Guard and keep your civilian life while gaining leadership training, student benefits, and professional skills that last a lifetime.',
      cta1: 'Find Your Mission',
      cta2: 'Browse MOS List',
      badge1: '100% Tuition Waiver',
      badge2: '$20K Bonus Qualifications',
      badge3: 'Part-time service, full-time benefits'
    },
    overview: {
      heading: 'One Program, Multiple Futures',
      copy: 'The New Jersey National Guard pairs military discipline with civilian career growth. Keep your hometown roots and access national-level training, pay, and educational assistance.',
      card1: 'Serve close to home with 12 drills each year and two weeks annual training.',
      card2: 'Access tuition waiver, scholarships, and transfer credits at NJ colleges.',
      card3: 'Choose from 150+ MOS, from cyber warfare to combat medicine.',
      card4: 'Health, retirement, VA benefits, and leadership credentials.'
    },
    career: {
      heading: 'MOS Explorer',
      description: 'Click any MOS card to view full details. Use filters, sorting, and search above.',
      favorites: 'Your Top 5 Favorites',
      searchPlaceholder: '🔍 Search MOS Code or Job Title (150+ careers)...',
      sortLabel: 'Sort',
      viewLabel: 'View',
      selectPlaceholder: 'Select a MOS',
      viewGrid: 'Grid',
      viewList: 'List',
      sortTitleAsc: 'Title A–Z',
      sortTitleDesc: 'Title Z–A',
      sortAsvabAsc: 'ASVAB Low → High',
      sortAsvabDesc: 'ASVAB High → Low',
      sortTraining: 'Training Length'
    },
    apply: {
      applyNow: 'Apply Now'
    },
    modal: {
      contactTitle: 'Contact Recruiter',
      contactDesc: 'Send your information and our recruiting team will follow up promptly.',
      sentMessage: '✅ Message sent to recruiting team!'
    },
    toast: {
      languageSwitched: '🌐 English activated',
      darkMode: '🌙 Dark mode enabled',
      lightMode: '☀️ Light mode enabled',
      noResults: 'No matches found. Try broadening your search.'
    }
  },
  es: {
    nav: {
      overview: 'Resumen',
      quiz: 'Quiz de Misión',
      careers: 'Carreras',
      armories: 'Armerías',
      split: 'Opción Dividida',
      faq: 'Preguntas'
    },
    hero: {
      topTag: 'Siempre Listos • Siempre Ahí',
      heading: 'CONQUISTA TU <br><span class="text-[#ffd700]">FUTURO.</span>',
      subtitle: 'Únete a la Guardia Nacional de NJ y conserva tu vida civil mientras obtienes entrenamiento de liderazgo, beneficios estudiantiles y habilidades profesionales para toda la vida.',
      cta1: 'Encuentra Tu Misión',
      cta2: 'Explorar MOS',
      badge1: 'Exención de matrícula 100%',
      badge2: '$20K en bonos de calificación',
      badge3: 'Servicio a tiempo parcial, beneficios completos'
    },
    overview: {
      heading: 'Un Programa, Múltiples Futuros',
      copy: 'La Guardia Nacional de Nueva Jersey combina disciplina militar con crecimiento profesional civil. Mantén tus raíces locales y accede a entrenamiento, salario y asistencia educativa nacional.',
      card1: 'Sirve cerca de casa con 12 entrenamientos al año y dos semanas de entrenamiento anual.',
      card2: 'Accede a exención de matrícula, becas y créditos transferibles en universidades de NJ.',
      card3: 'Elige entre 150+ MOS, desde guerra cibernética hasta medicina de combate.',
      card4: 'Salud, jubilación, beneficios VA y credenciales de liderazgo.'
    },
    career: {
      heading: 'Explorador MOS',
      description: 'Haz clic en cualquier tarjeta MOS para ver detalles completos. Usa filtros, ordenación y búsqueda arriba.',
      favorites: 'Tus 5 Favoritos Principales',
      searchPlaceholder: '🔍 Busca Código MOS o Título (150+ carreras)...',
      sortLabel: 'Ordenar',
      viewLabel: 'Ver',
      selectPlaceholder: 'Selecciona un MOS',
      viewGrid: 'Cuadrícula',
      viewList: 'Lista',
      sortTitleAsc: 'Título A–Z',
      sortTitleDesc: 'Título Z–A',
      sortAsvabAsc: 'ASVAB Bajo → Alto',
      sortAsvabDesc: 'ASVAB Alto → Bajo',
      sortTraining: 'Duración de Entrenamiento'
    },
    apply: {
      applyNow: 'Aplicar Ahora'
    },
    modal: {
      contactTitle: 'Contactar Reclutador',
      contactDesc: 'Envía tu información y nuestro equipo de reclutamiento te contactará pronto.',
      sentMessage: '✅ ¡Mensaje enviado al equipo de reclutamiento!'
    },
    toast: {
      languageSwitched: '🌐 Español activado',
      darkMode: '🌙 Modo oscuro activado',
      lightMode: '☀️ Modo claro activado',
      noResults: 'No hay coincidencias. Intenta ampliar tu búsqueda.'
    }
  }
};

const quizQuestions = [
  {
    question: 'Which environment motivates you most?',
    options: [
      { label: 'On the ground with a close-knit team', value: 'combat' },
      { label: 'In a secure operations center', value: 'intel' },
      { label: 'Helping people directly every day', value: 'medical' },
      { label: 'Working with machines and aircraft', value: 'aviation' }
    ]
  },
  {
    question: 'What kind of challenges do you enjoy?',
    options: [
      { label: 'Tactical field operations', value: 'combat' },
      { label: 'Cyber or communications puzzles', value: 'intel' },
      { label: 'Medical care and response', value: 'medical' },
      { label: 'Engineering and logistics solutions', value: 'engineer' }
    ]
  },
  {
    question: 'Which statement fits you best?',
    options: [
      { label: 'I like being on the front line', value: 'combat' },
      { label: 'I enjoy planning and analysis', value: 'intel' },
      { label: 'I want to train to save lives', value: 'medical' },
      { label: 'I enjoy building and fixing systems', value: 'engineer' }
    ]
  },
  {
    question: 'What is your long-term goal?',
    options: [
      { label: 'Lead in challenging environments', value: 'combat' },
      { label: 'Master technology and intel', value: 'intel' },
      { label: 'Serve through care and medicine', value: 'medical' },
      { label: 'Advance with technical skills', value: 'engineer' }
    ]
  }
];

// ========================================
// CORE DATA LOADERS
// ========================================

function getStoredJSON(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.warn(`Unable to parse localStorage key "${key}"`, error);
    return fallback;
  }
}

async function loadCareersWithFallback() {
  try {
    const response = await fetch(FALLBACK_CAREERS_URL);
    if (!response.ok) {
      throw new Error(`Failed careers fetch: ${response.status}`);
    }
    const careersData = await response.json();
    allCareers = Array.isArray(careersData) ? careersData : [];
    console.log(`✅ Loaded ${allCareers.length} careers from JSON`);
  } catch (err) {
    console.warn('JSON load failed:', err);
    allCareers = [];
  }
}

async function loadArmories() {
  try {
    const response = await fetch(FALLBACK_ARMORIES_URL);
    if (!response.ok) {
      throw new Error(`Failed armories fetch: ${response.status}`);
    }
    const armoryData = await response.json();
    armories = Array.isArray(armoryData) ? armoryData : [];
    console.log(`🗺️ Loaded ${armories.length} NJANG armories`);
  } catch (err) {
    console.warn('Armories load failed:', err);
    armories = [];
  }
// ========================================
// CORE DATA LOADERS
// ========================================

function getStoredJSON(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.warn(`Unable to parse localStorage key "${key}"`, error);
    return fallback;
  }
}

async function loadCareersWithFallback() {
  try {
    const response = await fetch(FALLBACK_CAREERS_URL);
    if (!response.ok) {
      throw new Error(`Failed careers fetch: ${response.status}`);
    }
    const careersData = await response.json();
    allCareers = Array.isArray(careersData) ? careersData : [];
    console.log(`✅ Loaded ${allCareers.length} careers from JSON`);
  } catch (err) {
    console.warn('JSON load failed:', err);
    allCareers = [];
  }
}

async function loadArmories() {
  try {
    const response = await fetch(FALLBACK_ARMORIES_URL);
    if (!response.ok) {
      throw new Error(`Failed armories fetch: ${response.status}`);
    }
    const armoryData = await response.json();
    armories = Array.isArray(armoryData) ? armoryData : [];
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

function setThemeIcon(toggle) {
  if (!toggle) return;
  const icon = toggle.querySelector('i');
  if (icon) {
    icon.dataset.lucide = isDarkMode ? 'sun' : 'moon';
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }
  toggle.setAttribute('aria-pressed', String(!isDarkMode));
}

function initThemeToggle() {
function setThemeIcon(toggle) {
  if (!toggle) return;
  const icon = toggle.querySelector('i');
  if (icon) {
    icon.dataset.lucide = isDarkMode ? 'sun' : 'moon';
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }
  toggle.setAttribute('aria-pressed', String(!isDarkMode));
}
function setThemeIcon(toggle) {
  if (!toggle) return;
  const icon = toggle.querySelector('i');
  if (icon) {
    icon.dataset.lucide = isDarkMode ? 'sun' : 'moon';
    lucide.createIcons();
  }
  toggle.setAttribute('aria-pressed', String(!isDarkMode));
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('darkMode');
  isDarkMode = saved !== 'false';

  document.body.classList.toggle('light-theme', !isDarkMode);
  setThemeIcon(toggle);

  if (toggle) {
    toggle.addEventListener('click', () => {
      isDarkMode = !isDarkMode;
      document.body.classList.toggle('light-theme', !isDarkMode);
      safeStorageSet('darkMode', String(isDarkMode));
      setThemeIcon(toggle);
      showToast(isDarkMode ? languageStrings[currentLanguage].toast.darkMode : languageStrings[currentLanguage].toast.lightMode, 'info');
    });
  }
}

function loadLanguagePreference() {
  const stored = localStorage.getItem('pageLanguage');
  if (SUPPORTED_LANGUAGES.has(stored)) {
    return stored;
  }
  return 'en';
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.has(lang)) lang = 'en';
  currentLanguage = lang;
  }
}

function loadLanguagePreference() {
  const stored = localStorage.getItem('pageLanguage');
  if (SUPPORTED_LANGUAGES.has(stored)) {
    if (stored === 'en' || stored === 'es') {
      return stored;
    }
    return 'en';
  }
  return 'en';
}
function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.has(lang)) lang = 'en';
  currentLanguage = lang;
  localStorage.setItem('pageLanguage', lang);
  document.documentElement.lang = lang;

  const strings = languageStrings[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const path = key.split('.');
    let value = strings;
    path.forEach(segment => value = value?.[segment]);
    if (value) el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    const path = key.split('.');
    let value = strings;
    path.forEach(segment => value = value?.[segment]);
    if (value) el.innerHTML = value;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const path = key.split('.');
    let value = strings;
    path.forEach(segment => value = value?.[segment]);
    if (value) el.placeholder = value;
  });

  const viewMode = document.getElementById('view-mode');
  if (viewMode) {
    const options = viewMode.querySelectorAll('option');
    if (options[0]) options[0].textContent = strings.career.viewGrid;
    if (options[1]) options[1].textContent = strings.career.viewList;
  }

  const sortMode = document.getElementById('sort-mode');
  if (sortMode) {
    const options = sortMode.querySelectorAll('option');
    if (options[0]) options[0].textContent = strings.career.sortTitleAsc;
    if (options[1]) options[1].textContent = strings.career.sortTitleDesc;
    if (options[2]) options[2].textContent = strings.career.sortAsvabAsc;
    if (options[3]) options[3].textContent = strings.career.sortAsvabDesc;
    if (options[4]) options[4].textContent = strings.career.sortTraining;
  }

  const dropdown = document.getElementById('mos-dropdown');
  if (dropdown?.options?.length) {
    dropdown.options[0].textContent = strings.career.selectPlaceholder;
  }

  const applyButtons = document.querySelectorAll('#open-apply-modal, #open-apply-modal-mobile');
  applyButtons.forEach(btn => {
    if (btn) btn.textContent = strings.apply.applyNow;
  });

  const languageButtons = document.querySelectorAll('#language-toggle, #language-toggle-mobile');
  languageButtons.forEach(btn => btn.textContent = lang === 'en' ? 'ES' : 'EN');

  const modalSubmit = document.getElementById('apply-modal-form')?.querySelector('button[type="submit"]');
  if (modalSubmit) {
    modalSubmit.textContent = lang === 'en' ? 'Send Message' : 'Enviar Mensaje';
  }
  document.getElementById('theme-toggle')?.setAttribute('aria-label', lang === 'en' ? 'Toggle light and dark theme' : 'Cambiar tema claro y oscuro');
}

function toggleLanguage() {
  setLanguage(currentLanguage === 'en' ? 'es' : 'en');
  showToast(languageStrings[currentLanguage].toast.languageSwitched, 'info');
}

function observeRevealItems() {
  const revealItems = document.querySelectorAll('[data-reveal]:not(.visible)');
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
function observeRevealItems() {
  const revealItems = document.querySelectorAll('[data-reveal]:not(.visible)');
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach(item => observer.observe(item));
}

function initScrollReveal() {
  observeRevealItems();
}

function updateScrollProgress() {
  const progress = document.getElementById('scroll-progress');
  if (!progress) return;
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progress.style.width = `${percent}%`;
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

  if (window.L) {
    initLeafletMap();
    return;
  }

  if (!document.querySelector('link[data-leaflet-css="true"]')) {
    const mapLink = document.createElement('link');
    mapLink.rel = 'stylesheet';
    mapLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    mapLink.dataset.leafletCss = 'true';
    document.head.appendChild(mapLink);
  }

  if (!document.querySelector('script[data-leaflet-js="true"]')) {
    const scriptLink = document.createElement('script');
    scriptLink.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptLink.dataset.leafletJs = 'true';
    scriptLink.onload = initLeafletMap;
    scriptLink.onerror = () => console.warn('Leaflet failed to load.');
    document.head.appendChild(scriptLink);
  }
}
function initArmoriesMap() {
  const mapContainer = document.getElementById('armories-map');
  if (!mapContainer || armories.length === 0) return;

  if (window.L) {
    initLeafletMap();
    return;
  }

  if (!document.querySelector('link[data-leaflet-css="true"]')) {
    const mapLink = document.createElement('link');
    mapLink.rel = 'stylesheet';
    mapLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    mapLink.dataset.leafletCss = 'true';
    document.head.appendChild(mapLink);
  }

  if (!document.querySelector('script[data-leaflet-js="true"]')) {
    const scriptLink = document.createElement('script');
    scriptLink.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptLink.dataset.leafletJs = 'true';
    scriptLink.onload = initLeafletMap;
    scriptLink.onerror = () => console.warn('Leaflet failed to load.');
    document.head.appendChild(scriptLink);
  }
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
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(armory.address)}" target="_blank" rel="noopener noreferrer" class="inline-block bg-[#ffd700] text-black px-4 py-1 rounded font-bold text-sm">Get Directions</a>
      </div>
    `;
        <p class="text-sm mb-1"><strong>📍</strong> ${armory.address}</p>
        <p class="text-sm mb-1"><strong>📞</strong> <a href="tel:${armory.phone}">${armory.phone}</a></p>
        <p class="text-sm mb-3"><strong>⏰</strong> ${armory.drill}</p>
        <p class="text-xs text-gray-600 mb-2">Recruiter: ${armory.recruiter}</p>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(armory.address)}" target="_blank" rel="noopener noreferrer" class="inline-block bg-[#ffd700] text-black px-4 py-1 rounded font-bold text-sm">Get Directions</a>
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

async function toggleFavorite(eventOrMos, mos, title) {
  if (eventOrMos && eventOrMos.stopPropagation) {
    eventOrMos.stopPropagation();
  }

  if (typeof eventOrMos === 'string') {
    title = mos;
    mos = eventOrMos;
  }

  if (!mos) return;

  const selected = allCareers.find(m => String(m.mos) === String(mos));
  const favoriteTitle = title || selected?.title || mos;
  const existingIndex = favoriteMOS.findIndex(item => String(item.mos) === String(mos));
  const isAdding = existingIndex === -1;

  if (isAdding) {
    if (favoriteMOS.length >= MAX_FAVORITES) {
      showToast(`Only ${MAX_FAVORITES} favorites allowed. Remove one to add another.`, 'info');
      return;
    }
    favoriteMOS.push({ mos, title: favoriteTitle });
  } else {
    favoriteMOS.splice(existingIndex, 1);
  }

  saveFavorites();
  updateFavoritesUI();
  updateCardFavorites();
  showToast(`⭐ ${favoriteTitle} ${isAdding ? 'added' : 'removed'} from favorites!`, 'success');
}

function openMosModal(mos) {
  const selected = allCareers.find(m => m.mos === mos);
  if (!selected) return;

  const modalTitle = document.getElementById('mos-modal-title');
  const modalDesc = document.getElementById('mos-modal-desc');
  const modalAsvab = document.getElementById('mos-modal-asvab');
  const modalTraining = document.getElementById('mos-modal-training');
  const modalCategory = document.getElementById('mos-modal-cat');
  const modalBonus = document.getElementById('mos-modal-bonus');
  if (modalTitle) modalTitle.innerText = `${selected.mos} - ${selected.title}`;
  if (modalDesc) modalDesc.innerText = selected.desc;
  if (modalAsvab) modalAsvab.innerText = selected.asvab;
  if (modalTraining) modalTraining.innerText = selected.training;
  if (modalCategory) modalCategory.innerText = selected.cat.toUpperCase();
  if (modalBonus) modalBonus.classList.toggle('hidden', !selected.bonus);

  window.currentMosModal = selected.mos;
  document.getElementById('mos-modal')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  showToast(`📋 Opened ${selected.title}`, 'info');
}

function closeMosModal() {
  document.getElementById('mos-modal')?.classList.add('hidden');
  document.body.style.overflow = '';
}
  const favoriteTitle = title || selected?.title || mos;
  const existingIndex = favoriteMOS.findIndex(item => String(item.mos) === String(mos));
  const isAdding = existingIndex === -1;

  if (isAdding) {
    if (favoriteMOS.length >= MAX_FAVORITES) {
      showToast(`Only ${MAX_FAVORITES} favorites allowed. Remove one to add another.`, 'info');
      return;
    }
    favoriteMOS.push({ mos, title: favoriteTitle });
  } else {
    favoriteMOS.splice(existingIndex, 1);
  }

  saveFavorites();
  updateFavoritesUI();
  updateCardFavorites();
  showToast(`⭐ ${favoriteTitle} ${isAdding ? 'added' : 'removed'} from favorites!`, 'success');
}

function openMosModal(mos) {
  const selected = allCareers.find(m => m.mos === mos);
  if (!selected) return;

  const modalTitle = document.getElementById('mos-modal-title');
  const modalDesc = document.getElementById('mos-modal-desc');
  const modalAsvab = document.getElementById('mos-modal-asvab');
  const modalTraining = document.getElementById('mos-modal-training');
  const modalCategory = document.getElementById('mos-modal-cat');
  const modalBonus = document.getElementById('mos-modal-bonus');
  if (modalTitle) modalTitle.innerText = `${selected.mos} - ${selected.title}`;
  if (modalDesc) modalDesc.innerText = selected.desc;
  if (modalAsvab) modalAsvab.innerText = selected.asvab;
  if (modalTraining) modalTraining.innerText = selected.training;
  if (modalCategory) modalCategory.innerText = selected.cat.toUpperCase();
  if (modalBonus) modalBonus.classList.toggle('hidden', !selected.bonus);

  window.currentMosModal = selected.mos;
  document.getElementById('mos-modal')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  showToast(`📋 Opened ${selected.title}`, 'info');
}

function closeMosModal() {
  document.getElementById('mos-modal')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function categoryColor(cat) {
  switch (cat) {
    case 'combat': return { bg: '#dc2626', to: '#f97316' };
    case 'intel': return { bg: '#7c3aed', to: '#0ea5e9' };
    case 'medical': return { bg: '#16a34a', to: '#22c55e' };
    case 'aviation': return { bg: '#0284c7', to: '#38bdf8' };
    case 'engineer': return { bg: '#f59e0b', to: '#fbbf24' };
    case 'logistics': return { bg: '#65a30d', to: '#a3e635' };
    default: return { bg: '#475569', to: '#94a3b8' };
  }
}

function renderCareers(data) {
  const grid = document.getElementById('career-grid');
  const viewMode = document.getElementById('view-mode')?.value || 'cards';
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = `<div class="text-gray-400 italic uppercase tracking-widest text-center col-span-full">${languageStrings[currentLanguage].toast.noResults}</div>`;
    return;
  }

  if (viewMode === 'list') {
    grid.innerHTML = data.map(m => `
      <div class="mos-card p-6 flex items-center gap-4 hover:shadow-2xl" data-mos="${m.mos}" data-reveal="true" onclick="openMosModal('${m.mos}')">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, ${categoryColor(m.cat).bg}, ${categoryColor(m.cat).to});">
          <i data-lucide="shield" class="w-6 h-6 text-white"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-black text-lg uppercase tracking-tight mb-1">${m.mos} ${m.title}</h4>
          <p class="text-gray-400 text-sm mb-2">${m.desc.slice(0, 80)}${m.desc.length > 80 ? '...' : ''}</p>
          <div class="flex gap-4 text-xs text-gray-500">
            <span>ASVAB: ${m.asvab}</span>
            <span>${m.training}</span>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    grid.innerHTML = data.map(m => {
      const colors = categoryColor(m.cat);
      return `
      <div class="mos-card group relative" data-mos="${m.mos}" data-reveal="true" onclick="openMosModal('${m.mos}')">
        <button type="button" class="favorite-btn" onclick="toggleFavorite(event,'${m.mos}','${m.title}')">
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
    `;
    }).join('');
  }

  updateCardFavorites();
  initTiltCards();
  if (window.lucide?.createIcons) window.lucide.createIcons();
  observeRevealItems();
}

function sortCareerData(data, sortKey) {
  const sorted = [...data];
  const toTrainingWeeks = (value = '') => {
    const normalized = String(value).toLowerCase();
    const match = normalized.match(/(\d+)\s*(week|month)/);
    if (!match) return Number.MAX_SAFE_INTEGER;
    const count = Number.parseInt(match[1], 10);
    return match[2].startsWith('month') ? count * 4 : count;
  };
  if (sortKey === 'title-asc') {
  updateCardFavorites();
  initTiltCards();
  if (window.lucide?.createIcons) window.lucide.createIcons();
  observeRevealItems();
}

function sortCareerData(data, sortKey) {
  const sorted = [...data];
  const toTrainingWeeks = (value = '') => {
    const normalized = String(value).toLowerCase();
    const match = normalized.match(/(\d+)\s*(week|month)/);
    if (!match) return Number.MAX_SAFE_INTEGER;
    const count = Number.parseInt(match[1], 10);
    return match[2].startsWith('month') ? count * 4 : count;
  };
  if (sortKey === 'title-asc') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortKey === 'title-desc') {
    sorted.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortKey === 'asvab-asc') {
    sorted.sort((a, b) => parseInt(a.asvab, 10) - parseInt(b.asvab, 10));
  } else if (sortKey === 'asvab-desc') {
    sorted.sort((a, b) => parseInt(b.asvab, 10) - parseInt(a.asvab, 10));
  } else if (sortKey === 'training') {
    sorted.sort((a, b) => toTrainingWeeks(a.training) - toTrainingWeeks(b.training));
  }
  return sorted;
}
  } else if (sortKey === 'asvab-desc') {
    sorted.sort((a, b) => parseInt(b.asvab, 10) - parseInt(a.asvab, 10));
  } else if (sortKey === 'training') {
    sorted.sort((a, b) => toTrainingWeeks(a.training) - toTrainingWeeks(b.training));
  }
  return sorted;
}

function filterAndRenderCareers() {
  const searchValue = currentSearch.toLowerCase();
  const filtered = allCareers.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchValue) || m.mos.toLowerCase().includes(searchValue) || m.desc.toLowerCase().includes(searchValue);
    const matchesCategory = activeCategory === 'all' || m.cat === activeCategory;
    return matchesSearch && matchesCategory;
  });
  const sorted = sortCareerData(filtered, currentSort);
  renderCareers(sorted);
  const status = document.getElementById('career-count');
  if (status) status.textContent = `${sorted.length} / ${allCareers.length}`;
}

function saveFavorites() {
  localStorage.setItem('favoriteMOS', JSON.stringify(favoriteMOS));
}

async function loadFavorites() {
  favoriteMOS = getStoredJSON('favoriteMOS', []).slice(0, MAX_FAVORITES);
  saveFavorites();
}
async function loadFavorites() {
  favoriteMOS = getStoredJSON('favoriteMOS', []).slice(0, MAX_FAVORITES);
  saveFavorites();
}

function updateFavoritesUI() {
  const list = document.getElementById('favorite-list');
  if (!list) return;

  if (favoriteMOS.length === 0) {
    list.innerHTML = `<div class="text-gray-500 italic uppercase">No favorites yet. Click a star to save your top MOS.</div>`;
    return;
  }

  list.innerHTML = favoriteMOS.map(entry => `
    <div class="p-4 bg-zinc-900/70 border border-white/10 rounded-2xl flex justify-between items-center">
      <div>
        <h4 class="font-black uppercase tracking-tight">${entry.mos}</h4>
        <p class="text-gray-400 text-sm">${entry.title}</p>
      </div>
      <button type="button" onclick="toggleFavorite(event,'${entry.mos}','${entry.title}')" class="text-[#ffd700] hover:text-white">Remove</button>
    </div>
  `).join('');
}

function updateCardFavorites() {
  document.querySelectorAll('.mos-card').forEach(card => {
    const mos = card.dataset.mos;
    const isFav = favoriteMOS.some(item => item.mos === mos);
    const button = card.querySelector('.favorite-btn');
    if (button) {
      button.classList.toggle('text-[#ffd700]', isFav);
      button.classList.toggle('text-white', !isFav);
      const icon = button.querySelector('i');
      if (icon) icon.dataset.lucide = 'star';
    }
    card.classList.toggle('border-[#ffd700]', isFav);
  });
}

function populateSelectors(careers) {
  const dropdown = document.getElementById('mos-dropdown');
  if (!dropdown) return;

  dropdown.innerHTML = `
    <option value="">${languageStrings[currentLanguage].career.selectPlaceholder}</option>
    ${careers.map(c => `<option value="${c.mos}">${c.mos} — ${c.title}</option>`).join('')}
  `;

  dropdown.addEventListener('change', () => {
    const selected = dropdown.value;
    if (selected) openMosModal(selected);
  });

  document.getElementById('view-mode')?.addEventListener('change', () => filterAndRenderCareers());
  document.getElementById('sort-mode')?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    filterAndRenderCareers();
  });

  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      activeCategory = filter;
      filterAndRenderCareers();
    });
  });
}

function renderDrillList() {
  const list = document.getElementById('drill-list');
  if (!list) return;
  list.innerHTML = armories.slice(0, 4).map(armory => `
    <div class="bg-zinc-800/70 p-4 rounded-3xl border border-white/10">
      <h4 class="font-bold uppercase text-sm mb-1">${armory.name}</h4>
      <p class="text-gray-400 text-sm mb-1">${armory.address}</p>
      <p class="text-gray-300 text-sm"><strong>Drill:</strong> ${armory.drill}</p>
    </div>
  `).join('');

  const countEl = document.getElementById('armory-count');
  if (countEl) countEl.innerText = armories.length;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineMiles([lat1, lon1], [lat2, lon2]) {
  const earthMiles = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthMiles * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function initZipArmoryFinder() {
  const input = document.getElementById('zip-search');
  const button = document.getElementById('zip-find-btn');
  const output = document.getElementById('nearest-armories');
  const feedback = document.getElementById('zip-feedback');
  if (!input || !button || !output || !feedback) return;

  const findNearest = () => {
    const zip = input.value.trim();
    const origin = NJ_ZIP_COORDS[zip];
    if (!origin) {
      feedback.textContent = 'ZIP not in quick lookup yet. Try: 07102, 08608, 08002, 08201.';
      output.innerHTML = '';
      return;
    }

    const nearest = armories
      .map(armory => ({
        ...armory,
        distance: haversineMiles(origin, [armory.lat, armory.lng])
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    feedback.textContent = `Top ${nearest.length} nearest armories for ${zip}`;
    output.innerHTML = nearest.map(armory => `
      <article class="armory-nearest-card">
        <h4>${armory.name}</h4>
        <p>${armory.address}</p>
        <div class="text-xs text-gray-400 mt-2">${armory.distance.toFixed(1)} miles away</div>
        <a href="tel:${armory.phone}" class="text-[#ffd700] text-sm font-bold">Call ${armory.phone}</a>
      </article>
    `).join('');
  };

  button.addEventListener('click', findNearest);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      findNearest();
    }
  });
}

function initApplyFormDraft() {
  const form = document.getElementById('apply-modal-form');
  if (!form) return;

  const fields = ['modal-firstname', 'modal-lastname', 'modal-email', 'modal-phone', 'modal-message'];
  const savedDraft = (() => {
    try {
      return JSON.parse(safeStorageGet(APPLY_FORM_DRAFT_KEY) || '{}');
    } catch {
      return {};
    }
  })();

  fields.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    if (savedDraft[id]) input.value = savedDraft[id];
    input.addEventListener('input', () => {
      const draft = {};
      fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field?.value) draft[fieldId] = field.value;
      });
      safeStorageSet(APPLY_FORM_DRAFT_KEY, JSON.stringify(draft));
    });
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function initBenefitsCalculator() {
  const calcBtn = document.getElementById('calculate-benefits');
  if (!calcBtn) return;

  const calculate = () => {
    const tuition = Number.parseFloat(document.getElementById('calc-tuition')?.value || 0);
    const years = Number.parseFloat(document.getElementById('calc-years')?.value || 0);
    const monthlyDrill = Number.parseFloat(document.getElementById('calc-drill')?.value || 0);
    const bonus = Number.parseFloat(document.getElementById('calc-bonus')?.value || 0);

    const tuitionValue = Math.max(0, tuition * years);
    const drillValue = Math.max(0, monthlyDrill * 12);
    const totalValue = tuitionValue + drillValue + Math.max(0, bonus);

    const outTuition = document.getElementById('calc-out-tuition');
    const outDrill = document.getElementById('calc-out-drill');
    const outBonus = document.getElementById('calc-out-bonus');
    const outTotal = document.getElementById('calc-out-total');
    if (outTuition) outTuition.textContent = formatCurrency(tuitionValue);
    if (outDrill) outDrill.textContent = formatCurrency(drillValue);
    if (outBonus) outBonus.textContent = formatCurrency(bonus);
    if (outTotal) outTotal.textContent = formatCurrency(totalValue);
  };

  calcBtn.addEventListener('click', calculate);
  calculate();
}

function initEligibilityCheck() {
  const wrapper = document.getElementById('eligibility-questions');
  if (!wrapper) return;

  const answers = {};
  const updateResult = () => {
    const result = document.getElementById('eligibility-result');
    if (!result) return;
    const values = Object.values(answers);
    if (values.length < 3) {
      result.classList.add('hidden');
      return;
    }
    const passed = values.every(value => value === 'yes');
    result.classList.remove('hidden');
    result.classList.toggle('border-green-400', passed);
    result.classList.toggle('border-orange-400', !passed);
    result.innerHTML = passed
      ? '<h3 class="text-green-300 font-black uppercase mb-2">Likely Eligible</h3><p class="text-gray-200">Great start. You look ready for a recruiter conversation and next-step screening.</p>'
      : '<h3 class="text-orange-300 font-black uppercase mb-2">Needs Recruiter Review</h3><p class="text-gray-200">You may still have options. Talk to a recruiter for waivers, timing, and pathway guidance.</p>';
  };

  wrapper.querySelectorAll('.eligibility-question').forEach(question => {
    const key = question.dataset.key;
    const buttons = question.querySelectorAll('.eligibility-btn');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        answers[key] = button.dataset.value;
        updateResult();
      });
    });
  });
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineMiles([lat1, lon1], [lat2, lon2]) {
  const earthMiles = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthMiles * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function initZipArmoryFinder() {
  const input = document.getElementById('zip-search');
  const button = document.getElementById('zip-find-btn');
  const output = document.getElementById('nearest-armories');
  const feedback = document.getElementById('zip-feedback');
  if (!input || !button || !output || !feedback) return;

  const findNearest = () => {
    const zip = input.value.trim();
    const origin = NJ_ZIP_COORDS[zip];
    if (!origin) {
      feedback.textContent = 'ZIP not in quick lookup yet. Try: 07102, 08608, 08002, 08201.';
      output.innerHTML = '';
      return;
    }

    const nearest = armories
      .map(armory => ({
        ...armory,
        distance: haversineMiles(origin, [armory.lat, armory.lng])
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    feedback.textContent = `Top ${nearest.length} nearest armories for ${zip}`;
    output.innerHTML = nearest.map(armory => `
      <article class="armory-nearest-card">
        <h4>${armory.name}</h4>
        <p>${armory.address}</p>
        <div class="text-xs text-gray-400 mt-2">${armory.distance.toFixed(1)} miles away</div>
        <a href="tel:${armory.phone}" class="text-[#ffd700] text-sm font-bold">Call ${armory.phone}</a>
      </article>
    `).join('');
  };

  button.addEventListener('click', findNearest);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      findNearest();
    }
  });
}

function initApplyFormDraft() {
  const form = document.getElementById('apply-modal-form');
  if (!form) return;

  const fields = ['modal-firstname', 'modal-lastname', 'modal-email', 'modal-phone', 'modal-message'];
  const savedDraft = (() => {
    try {
      return JSON.parse(localStorage.getItem(APPLY_FORM_DRAFT_KEY) || '{}');
    } catch {
      return {};
    }
  })();

  fields.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    if (savedDraft[id]) input.value = savedDraft[id];
    input.addEventListener('input', () => {
      const draft = {};
      fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field?.value) draft[fieldId] = field.value;
      });
      localStorage.setItem(APPLY_FORM_DRAFT_KEY, JSON.stringify(draft));
    });
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function initBenefitsCalculator() {
  const calcBtn = document.getElementById('calculate-benefits');
  if (!calcBtn) return;

  const calculate = () => {
    const tuition = Number.parseFloat(document.getElementById('calc-tuition')?.value || 0);
    const years = Number.parseFloat(document.getElementById('calc-years')?.value || 0);
    const monthlyDrill = Number.parseFloat(document.getElementById('calc-drill')?.value || 0);
    const bonus = Number.parseFloat(document.getElementById('calc-bonus')?.value || 0);

    const tuitionValue = Math.max(0, tuition * years);
    const drillValue = Math.max(0, monthlyDrill * 12);
    const totalValue = tuitionValue + drillValue + Math.max(0, bonus);

    const outTuition = document.getElementById('calc-out-tuition');
    const outDrill = document.getElementById('calc-out-drill');
    const outBonus = document.getElementById('calc-out-bonus');
    const outTotal = document.getElementById('calc-out-total');
    if (outTuition) outTuition.textContent = formatCurrency(tuitionValue);
    if (outDrill) outDrill.textContent = formatCurrency(drillValue);
    if (outBonus) outBonus.textContent = formatCurrency(bonus);
    if (outTotal) outTotal.textContent = formatCurrency(totalValue);
  };

  calcBtn.addEventListener('click', calculate);
  calculate();
}

function initEligibilityCheck() {
  const wrapper = document.getElementById('eligibility-questions');
  if (!wrapper) return;

  const answers = {};
  const updateResult = () => {
    const result = document.getElementById('eligibility-result');
    if (!result) return;
    const values = Object.values(answers);
    if (values.length < 3) {
      result.classList.add('hidden');
      return;
    }
    const passed = values.every(value => value === 'yes');
    result.classList.remove('hidden');
    result.classList.toggle('border-green-400', passed);
    result.classList.toggle('border-orange-400', !passed);
    result.innerHTML = passed
      ? '<h3 class="text-green-300 font-black uppercase mb-2">Likely Eligible</h3><p class="text-gray-200">Great start. You look ready for a recruiter conversation and next-step screening.</p>'
      : '<h3 class="text-orange-300 font-black uppercase mb-2">Needs Recruiter Review</h3><p class="text-gray-200">You may still have options. Talk to a recruiter for waivers, timing, and pathway guidance.</p>';
  };

  wrapper.querySelectorAll('.eligibility-question').forEach(question => {
    const key = question.dataset.key;
    const buttons = question.querySelectorAll('.eligibility-btn');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        answers[key] = button.dataset.value;
        updateResult();
      });
    });
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function initBenefitsCalculator() {
  const calcBtn = document.getElementById('calculate-benefits');
  if (!calcBtn) return;

  const calculate = () => {
    const tuition = Number.parseFloat(document.getElementById('calc-tuition')?.value || 0);
    const years = Number.parseFloat(document.getElementById('calc-years')?.value || 0);
    const monthlyDrill = Number.parseFloat(document.getElementById('calc-drill')?.value || 0);
    const bonus = Number.parseFloat(document.getElementById('calc-bonus')?.value || 0);

    const tuitionValue = Math.max(0, tuition * years);
    const drillValue = Math.max(0, monthlyDrill * 12);
    const totalValue = tuitionValue + drillValue + Math.max(0, bonus);

    const outTuition = document.getElementById('calc-out-tuition');
    const outDrill = document.getElementById('calc-out-drill');
    const outBonus = document.getElementById('calc-out-bonus');
    const outTotal = document.getElementById('calc-out-total');
    if (outTuition) outTuition.textContent = formatCurrency(tuitionValue);
    if (outDrill) outDrill.textContent = formatCurrency(drillValue);
    if (outBonus) outBonus.textContent = formatCurrency(bonus);
    if (outTotal) outTotal.textContent = formatCurrency(totalValue);
  };

  calcBtn.addEventListener('click', calculate);
  calculate();
}

function initEligibilityCheck() {
  const wrapper = document.getElementById('eligibility-questions');
  if (!wrapper) return;

  const answers = {};
  const updateResult = () => {
    const result = document.getElementById('eligibility-result');
    if (!result) return;
    const values = Object.values(answers);
    if (values.length < 3) {
      result.classList.add('hidden');
      return;
    }
    const passed = values.every(value => value === 'yes');
    result.classList.remove('hidden');
    result.classList.toggle('border-green-400', passed);
    result.classList.toggle('border-orange-400', !passed);
    result.innerHTML = passed
      ? '<h3 class="text-green-300 font-black uppercase mb-2">Likely Eligible</h3><p class="text-gray-200">Great start. You look ready for a recruiter conversation and next-step screening.</p>'
      : '<h3 class="text-orange-300 font-black uppercase mb-2">Needs Recruiter Review</h3><p class="text-gray-200">You may still have options. Talk to a recruiter for waivers, timing, and pathway guidance.</p>';
  };

  wrapper.querySelectorAll('.eligibility-question').forEach(question => {
    const key = question.dataset.key;
    const buttons = question.querySelectorAll('.eligibility-btn');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        answers[key] = button.dataset.value;
        updateResult();
      });
    });
  });
}

function startQuiz() {
  quizIndex = 0;
  quizAnswers = [];
  document.getElementById('quiz-start')?.classList.add('hidden');
  document.getElementById('quiz-result')?.classList.add('hidden');
  document.getElementById('quiz-question')?.classList.remove('hidden');
  showQuizQuestion();
}

function showQuizQuestion() {
  const questionEl = document.getElementById('q-text');
  const optionsEl = document.getElementById('q-options');
  const progressEl = document.getElementById('q-progress');
  const current = quizQuestions[quizIndex];
  if (!current || !optionsEl || !questionEl || !progressEl) return;

  questionEl.innerText = current.question;
  progressEl.innerText = `Question ${quizIndex + 1} of ${quizQuestions.length}`;
  optionsEl.innerHTML = current.options.map(option => `
    <button class="w-full rounded-3xl border border-white/10 bg-zinc-900/80 px-6 py-4 text-left font-bold hover:border-[#ffd700] transition-all" onclick="chooseQuizAnswer('${option.value}')">
      ${option.label}
    </button>
  `).join('');
}

function chooseQuizAnswer(value) {
  quizAnswers.push(value);
  quizIndex += 1;
  if (quizIndex >= quizQuestions.length) {
    const recommendation = quizAnswers.reduce((acc, answer) => ({ ...acc, [answer]: (acc[answer] || 0) + 1 }), {});
    const top = Object.entries(recommendation).sort((a, b) => b[1] - a[1])[0]?.[0] || 'combat';
    const match = allCareers.find(m => m.cat === top) || allCareers[0] || { cat: 'combat', desc: 'Explore infantry and combat roles.' };

    document.getElementById('result-cat').innerText = `${match.cat.toUpperCase()} HERO`;
    document.getElementById('result-desc').innerText = match.desc;
    document.getElementById('quiz-result')?.classList.remove('hidden');
    document.getElementById('quiz-question')?.classList.add('hidden');
    showToast('✅ Quiz complete. Here is your top MOS recommendation.', 'success');
    return;
  }
  showQuizQuestion();
}

function resetQuiz() {
  document.getElementById('quiz-result')?.classList.add('hidden');
  document.getElementById('quiz-question')?.classList.add('hidden');
  document.getElementById('quiz-start')?.classList.remove('hidden');
}

async function initPortal() {
  await loadCareersWithFallback();
  await loadArmories();
  await loadFavorites();

  currentLanguage = loadLanguagePreference();
  setLanguage(currentLanguage);
  populateSelectors(allCareers);
  filterAndRenderCareers();
  updateFavoritesUI();
  updateCardFavorites();
  renderDrillList();
  initThemeToggle();
  initArmoriesMap();
  initZipArmoryFinder();
  initApplyFormDraft();
  initBenefitsCalculator();
  initEligibilityCheck();
  initScrollReveal();
  updateScrollProgress();
  initThemeToggle();
  initArmoriesMap();
  initBenefitsCalculator();
  initEligibilityCheck();
  initScrollReveal();
  updateScrollProgress();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMosModal();
      document.getElementById('apply-modal')?.classList.add('hidden');
      document.body.style.overflow = '';
    }
  });

  document.getElementById('mos-search')?.addEventListener('input', throttle((e) => {
    currentSearch = e.target.value;
    filterAndRenderCareers();
  }, 200));

  document.getElementById('apply-modal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const feedback = document.getElementById('modal-feedback');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    
    // Get form data
    const firstName = document.getElementById('modal-firstname').value.trim();
    const lastName = document.getElementById('modal-lastname').value.trim();
    const email = document.getElementById('modal-email').value.trim();
    const phone = document.getElementById('modal-phone').value.trim();
    const message = document.getElementById('modal-message').value.trim();
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';
    
    try {
      // Send to Convex
      // Simulate sending inquiry (Convex removed)
      console.log('Inquiry submitted:', { firstName, lastName, email, phone, message });
      
      // Show success
      if (feedback) {
        feedback.classList.remove('hidden');
        feedback.innerText = languageStrings[currentLanguage].modal.sentMessage;
        feedback.classList.remove('text-red-400');
        feedback.classList.add('text-green-400');
      }
      
      // Clear form
      e.target.reset();
      localStorage.removeItem(APPLY_FORM_DRAFT_KEY);
      
      // Close modal after delay
      setTimeout(() => {
        document.getElementById('apply-modal')?.classList.add('hidden');
        if (feedback) feedback.classList.add('hidden');
      }, 1900);
      
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      if (feedback) {
        feedback.classList.remove('hidden');
        feedback.innerText = '❌ Failed to send message. Please try again.';
        feedback.classList.remove('text-green-400');
        feedback.classList.add('text-red-400');
      }
    } finally {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
    }
  });

  const particleCanvas = document.createElement('canvas');
  particleCanvas.id = 'particles-canvas';
  particleCanvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: -1;';
  document.body.prepend(particleCanvas);
  particleCanvas.__particleSystem = new ParticleSystem(particleCanvas);

  document.body.addEventListener('mousemove', (e) => {
    const canvas = document.getElementById('particles-canvas');
    if (canvas && canvas.__particleSystem) {
      canvas.__particleSystem.mouse = { x: e.clientX, y: e.clientY };
    }
  });

  window.addEventListener('scroll', () => {
    updateScrollProgress();
  });

  if (window.lucide?.createIcons) window.lucide.createIcons();
  console.log('🚀 NJANG Portal Enhanced - Map/Particles/Tilt Ready!');
}
  if (window.lucide?.createIcons) window.lucide.createIcons();
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
})
;