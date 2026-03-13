let allCareers = [];
let favoriteMOS = [];
let achievements = [];
let callbacks = [];

const convex = new ConvexHttpClient("https://keen-condor-8.convex.cloud/gas");

const FALLBACK_CAREERS_URL = './careers.json';

async function loadCareersWithFallback() {
  try {
    allCareers = await convex.query("getCareers");
    if (allCareers.length === 0) {
      console.log('Convex careers empty, loading fallback JSON');
      const response = await fetch(FALLBACK_CAREERS_URL);
      allCareers = await response.json();
    }
    console.log(`Loaded ${allCareers.length} careers from ${allCareers.length > 0 && allCareers[0]._id ? 'Convex' : 'JSON fallback'}`);
  } catch (err) {
    console.warn('Convex failed, using fallback JSON:', err);
    try {
      const response = await fetch(FALLBACK_CAREERS_URL);
      allCareers = await response.json();
      console.log(`Loaded fallback careers: ${allCareers.length} items`);
    } catch (fallbackErr) {
      console.error('Fallback failed too:', fallbackErr);
      allCareers = [];
    }
  }
}

async function loadFavorites() {
    favoriteMOS = await convex.query("getFavorites").catch(() => []);
}

async function loadAchievements() {
    achievements = await convex.query("getAchievements").catch(() => []);
}

async function loadCallbacks() {
    callbacks = await convex.query("getCallbacks").catch(() => []);
}

async function awardAchievement(id, title, description) {
    try {
      await convex.mutation("awardAchievement", { id, title, description });
      await loadAchievements();
      renderAchievements();
    } catch (e) {
      console.warn('Achievement failed:', e);
    }
}

async function toggleFavorite(mos, title) {
    try {
      await convex.mutation("toggleFavorite", { mos, title });
      await loadFavorites();
    } catch (e) {
      // Fallback local toggle
      const index = favoriteMOS.findIndex(item => item.mos === mos);
      if (index === -1) {
        favoriteMOS.push({ mos, title });
      } else {
        favoriteMOS.splice(index, 1);
      }
    }
    updateFavoritesUI();
    updateCardFavorites();
    awardAchievement('favorite-star', 'Top 5 Star', 'Saved a MOS to your top 5 favorites.');
}

// ... (rest of functions unchanged - renderAchievements, updateFavoritesUI, etc. Copy from original)

async function initPortal() {
  await loadCareersWithFallback();
  await loadFavorites();
  await loadAchievements();
  await loadCallbacks();
  renderCareers(allCareers);
  populateSelectors(allCareers);
  updateFavoritesUI();
  updateCardFavorites();
  renderCallbackList();
  renderAchievements();
  lucide.createIcons();
  console.log('Portal initialized with careers loaded');
}

// Include all other functions from original script.js here (renderCareers, populateSelectors, etc.)

// Note: This is partial - full file would include all original code + above changes
