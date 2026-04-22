// pages/eligibility.js - Eligibility Checker Module

const SCORING = {
  age: (age) => Math.min(age >= 17 && age <= 35 ? 100 : Math.max(0, 100 - (Math.abs(age - 26) * 5)), 100),
  education: { 'none': 0, 'hs': 100, 'ged': 80, 'college': 100 },
  citizen: { 'no': 0, 'pr': 70, 'citizen': 100 },
  asvab: (score) => Math.min((score - 80) * 2, 100),
  fitness: (height, weight) => {
    const bmi = (weight / (height * height)) * 703;
    return bmi >= 19 && bmi <= 27.5 ? 100 : Math.max(0, 100 - (Math.abs(bmi - 23.25) * 10));
  }
};

function calculateEligibility() {
  const age = parseInt(document.getElementById('eligibility-age')?.value || 25);
  const education = document.getElementById('eligibility-education')?.value || 'hs';
  const citizen = document.getElementById('eligibility-citizen')?.value || 'citizen';
  const asvab = parseInt(document.getElementById('eligibility-asvab')?.value || 105);
  
  const feet = parseInt(document.getElementById('height-feet')?.value || 5) || 5;
  const inches = parseInt(document.getElementById('height-inches')?.value || 9) || 9;
  const weight = parseInt(document.getElementById('eligibility-weight')?.value || 170) || 170;
  
  const heightInches = feet * 12 + inches;
  
  const scores = {
    age: SCORING.age(age),
    education: SCORING.education[education] || 0,
    citizen: SCORING.citizen[citizen] || 0,
    asvab: SCORING.asvab(asvab),
    fitness: SCORING.fitness(heightInches, weight)
  };
  
  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  const overall = Math.round(avg);
  
  displayResults(overall, scores);
}

function displayResults(overall, scores) {
  const resultsDiv = document.getElementById('eligibility-results');
  const scoreDiv = document.getElementById('eligibility-score');
  const statusDiv = document.getElementById('eligibility-status');
  const msgDiv = document.getElementById('eligibility-msg');
  
  if (!resultsDiv) return;
  
  let status = '';
  let message = '';
  
  if (overall >= 80) {
    status = '✅ YOU\'RE LIKELY ELIGIBLE!';
    message = 'Great! You appear to meet the basic requirements. Next step: Talk to a recruiter to confirm all details and explore MOS options.';
  } else if (overall >= 60) {
    status = '⚠️ POSSIBLE WITH WAIVERS';
    message = 'You may be eligible with waivers or remedial training. Recruiters can discuss options and requirements.';
  } else {
    status = '❌ DOESN\'T MEET BASELINE';
    message = 'You may need to improve in specific areas. Chat with a recruiter about pathways or timing.';
  }
  
  if (scoreDiv) scoreDiv.textContent = overall + '%';
  if (statusDiv) statusDiv.textContent = status;
  if (msgDiv) msgDiv.textContent = message;
  
  resultsDiv.classList.remove('hidden');
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function initFormListeners() {
  // Age slider
  const ageSlider = document.getElementById('eligibility-age');
  if (ageSlider) {
    ageSlider.addEventListener('input', () => {
      const output = document.getElementById('age-value');
      if (output) output.textContent = ageSlider.value;
    });
  }
  
  // ASVAB slider
  const asvabSlider = document.getElementById('eligibility-asvab');
  if (asvabSlider) {
    asvabSlider.addEventListener('input', () => {
      const output = document.getElementById('asvab-value');
      if (output) output.textContent = asvabSlider.value;
    });
  }
  
  // Form submission
  const form = document.getElementById('eligibility-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateEligibility();
    });
  }
  
  // Initialize icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

window.eligibilityModule = {
  init() {
    console.log('🚀 Initializing eligibility module');
    initFormListeners();
    console.log('✅ Eligibility module ready');
  }
};
