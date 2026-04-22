// pages/eligibility.js - Eligibility Checker + Quiz Module

const quizQuestions = [
  // Full quiz from script.js
];

function startQuiz() { /* ... */ }
function checkEligibility() { /* ... */ }
function calculateBenefits() { /* ... */ }

window.eligibilityModule = {
  init() {
    document.getElementById('start-quiz')?.addEventListener('click', startQuiz);
    document.getElementById('check-eligibility')?.addEventListener('click', checkEligibility);
    document.getElementById('calculate-benefits')?.addEventListener('click', calculateBenefits);
  }
}