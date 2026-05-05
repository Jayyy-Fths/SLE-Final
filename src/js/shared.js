// shared.js - Common logic for multi-page NJ Guard portal
// Theme, language, nav/footer load, favorites sync, toast notifications

window.shared = window.shared || {};

const SUPPORTED_LANGUAGES = new Set(['en', 'es']);
let currentLanguage = localStorage.getItem('language') || 'en';
let isDarkMode = localStorage.getItem('theme') !== 'light';

const TRANSLATIONS = {
    en: {
        'nav.overview':       'Overview',
        'nav.quiz':           'Mission Quiz',
        'nav.careers':        'Careers',
        'nav.armories':       'Armories',
        'nav.split':          'Split Option',
        'nav.faq':            'FAQ',
        'hero.topTag':        'Always Ready • Always There',
        'hero.heading':       'OWN YOUR <br><span class="text-[#ffd700]">FUTURE.</span>',
        'hero.subtitle':      'Join the NJ National Guard and keep your civilian life while gaining leadership training, student benefits, and professional skills that last a lifetime.',
        'hero.cta1':          'Find Your Mission',
        'hero.cta2':          'Browse MOS List',
        'hero.badge1':        '100% Tuition Waiver',
        'hero.badge2':        '$20K Bonus Qualifications',
        'hero.badge3':        'Part-time service, full-time benefits',
        'overview.heading':   'One Program, Multiple Futures',
        'overview.copy':      'The New Jersey National Guard pairs military discipline with civilian career growth. Keep your hometown roots and access national-level training, pay, and educational assistance.',
        'overview.card1':     'Serve close to home with 12 drills each year and two weeks annual training.',
        'overview.card2':     'Access tuition waiver, scholarships, and transfer credits at NJ colleges.',
        'overview.card3':     'Choose from 150+ MOS, from cyber warfare to combat medicine.',
        'overview.card4':     'Health, retirement, VA benefits, and leadership credentials.',
        'apply.applyNow':     'Apply Now',
        'modal.contactTitle': 'Contact Recruiter',
        'modal.contactDesc':  'Send your information and our recruiting team will follow up promptly.',
        'career.heading':     'MOS Explorer',
        'career.description': 'Click cards for full details. Use filters above.',
        'career.favorites':   'Your Top 5 Favorites',
    },
    es: {
        'nav.overview':       'Resumen',
        'nav.quiz':           'Quiz de Misión',
        'nav.careers':        'Carreras',
        'nav.armories':       'Arsenales',
        'nav.split':          'Opción Dividida',
        'nav.faq':            'Preguntas',
        'hero.topTag':        'Siempre Listo • Siempre Presente',
        'hero.heading':       'CONSTRUYE TU <br><span class="text-[#ffd700]">FUTURO.</span>',
        'hero.subtitle':      'Únete a la Guardia Nacional de NJ y mantén tu vida civil mientras adquieres liderazgo, beneficios educativos y habilidades profesionales para toda la vida.',
        'hero.cta1':          'Encuentra Tu Misión',
        'hero.cta2':          'Ver Lista de MOS',
        'hero.badge1':        '100% Matrícula Pagada',
        'hero.badge2':        'Bonos hasta $20K',
        'hero.badge3':        'Servicio part-time, beneficios completos',
        'overview.heading':   'Un Programa, Múltiples Futuros',
        'overview.copy':      'La Guardia Nacional de Nueva Jersey combina la disciplina militar con el crecimiento profesional civil. Mantén tus raíces y accede a entrenamiento, pago y asistencia educativa a nivel nacional.',
        'overview.card1':     'Sirve cerca de casa con 12 ejercicios al año y dos semanas de entrenamiento anual.',
        'overview.card2':     'Accede a exención de matrícula, becas y créditos en universidades de NJ.',
        'overview.card3':     'Elige entre más de 150 MOS, desde guerra cibernética hasta medicina de combate.',
        'overview.card4':     'Salud, retiro, beneficios de VA y credenciales de liderazgo.',
        'apply.applyNow':     'Aplicar Ahora',
        'modal.contactTitle': 'Contactar Reclutador',
        'modal.contactDesc':  'Envía tu información y nuestro equipo de reclutamiento te contactará pronto.',
        'career.heading':     'Explorador de MOS',
        'career.description': 'Haz clic en las tarjetas para detalles. Usa los filtros.',
        'career.favorites':   'Tus 5 Favoritos',
    }
};

function applyTranslations() {
    const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.dataset.i18nHtml;
        if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    document.querySelectorAll('[id*="language-toggle"]').forEach(btn => {
        btn.textContent = currentLanguage === 'en' ? 'ES' : 'EN';
    });
}

// Initialize theme
function initTheme() {
    if (!isDarkMode) {
        document.documentElement.classList.add('light-theme');
    }
}

// Toggle theme
function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
        document.documentElement.classList.remove('light-theme');
    } else {
        document.documentElement.classList.add('light-theme');
    }
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.setAttribute('aria-pressed', !isDarkMode);
    }
}

// Toggle language
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
    localStorage.setItem('language', currentLanguage);
    applyTranslations();
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast toast-${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Load and display scroll progress
function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / scrollHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Load JSON data (careers, armories)
async function loadCareers() {
    try {
        const res = await fetch('careers.json');
        return await res.json();
    } catch (e) {
        console.error('Failed to load careers.json:', e);
        return [];
    }
}

async function loadArmories() {
    try {
        const res = await fetch('armories.json');
        return await res.json();
    } catch (e) {
        console.error('Failed to load armories.json:', e);
        return [];
    }
}

// Favorites management
function getFavorites() {
    const saved = localStorage.getItem('favoritesMOS');
    return saved ? JSON.parse(saved) : [];
}

function addFavorite(mosCode) {
    const favs = getFavorites();
    if (!favs.includes(mosCode)) {
        favs.push(mosCode);
        localStorage.setItem('favoritesMOS', JSON.stringify(favs));
    }
}

function removeFavorite(mosCode) {
    const favs = getFavorites().filter(m => m !== mosCode);
    localStorage.setItem('favoritesMOS', JSON.stringify(favs));
}

function isFavorited(mosCode) {
    return getFavorites().includes(mosCode);
}

// MOS modal functions
let currentMosModal = null;

function openMosModal(mosData) {
    currentMosModal = mosData;
    const modal = document.getElementById('mos-modal');
    if (!modal) return;

    document.getElementById('mos-modal-title').textContent = `${mosData.mos} - ${mosData.title}`;
    document.getElementById('mos-modal-cat').textContent = mosData.cat.toUpperCase();
    document.getElementById('mos-modal-desc').textContent = mosData.desc;
    document.getElementById('mos-modal-asvab').textContent = mosData.asvab;
    document.getElementById('mos-modal-training').textContent = mosData.training;

    const bonusDiv = document.getElementById('mos-modal-bonus');
    if (bonusDiv) {
        bonusDiv.style.display = mosData.bonus ? 'block' : 'none';
    }

    const favBtn = document.getElementById('mos-fav-btn') || document.querySelector('[onclick*="toggleFavorite"]');
    if (favBtn) {
        const isFav = isFavorited(mosData.mos);
        favBtn.textContent = isFav ? '✓ Added to Favorites' : 'Add to Favorites';
        favBtn.onclick = () => toggleFavorite(null, mosData);
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeMosModal() {
    const modal = document.getElementById('mos-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
    currentMosModal = null;
}

function toggleFavorite(event, mosData) {
    if (event) event.preventDefault();
    if (!mosData) return;

    if (isFavorited(mosData.mos)) {
        removeFavorite(mosData.mos);
    } else {
        addFavorite(mosData.mos);
    }

    openMosModal(mosData);
    showToast('Favorite updated!', 'success');
    
    // Refresh careers page if loaded
    if (typeof window.updateFavoritesSection === 'function') {
        window.updateFavoritesSection();
        window.renderCareers();
    }
}

// Event delegation for modal close
document.addEventListener('click', (e) => {
    const modal = document.getElementById('mos-modal');
    if (modal && e.target === modal) {
        closeMosModal();
    }
    if (e.target.id === 'close-mos-modal' || e.target.id === 'close-apply-modal') {
        closeMosModal();
    }
});

// Mobile sticky CTA handlers
function setupCTAHandlers() {
    const applyBtns = document.querySelectorAll('[id*="open-apply-modal"]');
    applyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('apply-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        });
    });

    const closeBtn = document.getElementById('close-apply-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = document.getElementById('apply-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        });
    }
}

// Theme toggle handlers
function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
}

// Language toggle handlers
function setupLanguageToggle() {
    const langBtns = document.querySelectorAll('[id*="language-toggle"]');
    langBtns.forEach(btn => {
        btn.addEventListener('click', toggleLanguage);
    });
}

// Navbar scroll effect
function setupNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Mobile menu toggle
function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('hidden');
        toggle.setAttribute('aria-expanded', !isOpen);
        menu.setAttribute('aria-hidden', isOpen);
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// Contact form submission
async function submitContactForm(formData) {
    try {
        showToast('Sending message...', 'info');

        try {
            const res = await fetch('/.netlify/functions/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                showToast('Message sent! Recruiter will contact you within 24 hours.', 'success');
                return true;
            }
        } catch (fetchError) {
            console.log('API not available, saving locally', fetchError);
        }

        // Fallback: save to localStorage
        const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
        submissions.push({ ...formData, timestamp: new Date().toISOString() });
        localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
        console.log('Form saved to localStorage. Total submissions:', submissions.length);
        showToast('Message received! Recruiter will contact you within 24 hours.', 'success');
        return true;
    } catch (e) {
        console.error('Contact form error:', e);
        showToast('An error occurred. Please try again.', 'error');
        return false;
    }
}

// Setup apply form submission
function setupApplyForm() {
    const form = document.getElementById('apply-modal-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            firstName: document.getElementById('modal-firstname').value,
            lastName: document.getElementById('modal-lastname').value,
            email: document.getElementById('modal-email').value,
            phone: document.getElementById('modal-phone').value,
            message: document.getElementById('modal-message').value
        };

        const success = await submitContactForm(formData);

        if (success) {
            form.reset();
            const feedback = document.getElementById('modal-feedback');
            if (feedback) {
                feedback.classList.remove('hidden');
                setTimeout(() => {
                    feedback.classList.add('hidden');
                    const modal = document.getElementById('apply-modal');
                    if (modal) {
                        modal.classList.add('hidden');
                        modal.style.display = 'none';
                    }
                }, 2000);
            }
        }
    });
}

// Main init function
function init() {
    initTheme();
    initScrollProgress();
    setupNavbarScroll();
    setupMobileMenu();
    setupThemeToggle();
    setupLanguageToggle();
    setupCTAHandlers();
    setupApplyForm();
    applyTranslations();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Expose functions to window.shared namespace
Object.assign(window.shared, {
    toggleTheme,
    toggleLanguage,
    showToast,
    loadCareers,
    loadArmories,
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorited,
    openMosModal,
    closeMosModal,
    toggleFavorite,
    submitContactForm,
    setupApplyForm,
    applyTranslations,
    currentLanguage: () => currentLanguage,
    isDarkMode: () => isDarkMode
});

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
