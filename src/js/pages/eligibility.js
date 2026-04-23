// eligibility.js - Eligibility checker functionality
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eligibility-form');
    const resultsDiv = document.getElementById('eligibility-results');
    const ageInput = document.getElementById('eligibility-age');
    const asvabInput = document.getElementById('eligibility-asvab');

    if (!form) return;

    ageInput?.addEventListener('input', (e) => {
        document.getElementById('age-value').textContent = e.target.value;
    });

    asvabInput?.addEventListener('input', (e) => {
        document.getElementById('asvab-value').textContent = e.target.value;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const age = parseInt(ageInput?.value) || 25;
        const education = document.getElementById('eligibility-education')?.value || 'hs';
        const citizenship = document.getElementById('eligibility-citizen')?.value || 'pr';
        const asvab = parseInt(asvabInput?.value) || 105;
        const weight = parseInt(document.getElementById('eligibility-weight')?.value) || 170;
        const feet = parseInt(document.getElementById('height-feet')?.value) || 5;
        const inches = parseInt(document.getElementById('height-inches')?.value) || 9;

        let score = 0;
        const issues = [];

        if (age >= 17 && age <= 35) score += 25;
        else if (age >= 16 && age < 17) score += 10;
        else { issues.push('Age outside standard range (17-35)'); score += 5; }

        if (education === 'college') score += 20;
        else if (education === 'hs' || education === 'ged') score += 20;
        else { issues.push('High school diploma or GED required'); score += 5; }

        if (citizenship === 'citizen') score += 15;
        else if (citizenship === 'pr') score += 12;
        else { issues.push('U.S. Citizenship or PR required'); score += 0; }

        if (asvab >= 110) score += 25;
        else if (asvab >= 100) score += 18;
        else if (asvab >= 85) score += 12;
        else { issues.push('Target ASVAB score: 85 minimum'); score += 5; }

        if (form.querySelector('#has-tattoos')?.checked) {
            score -= 5;
            issues.push('Visible tattoos require recruiter review');
        }

        score = Math.max(0, Math.min(100, score));

        let status = 'ELIGIBLE';
        let statusClass = 'text-green-300';
        let msg = 'You meet the core requirements to enlist! Contact a recruiter to discuss your next steps.';

        if (score < 50) {
            status = 'NEEDS REVIEW';
            statusClass = 'text-yellow-300';
            msg = 'Some requirements need attention. Contact a recruiter for waivers and options.';
        }

        document.getElementById('eligibility-score').textContent = score + '%';
        document.getElementById('eligibility-status').textContent = status;
        document.getElementById('eligibility-status').className = `text-3xl font-black uppercase mb-4 ${statusClass}`;
        document.getElementById('eligibility-msg').textContent = msg;

        const mosGrid = document.getElementById('recommended-mos');
        if (mosGrid && window.shared) {
            const careers = await window.shared.loadCareers();
            const recommended = careers.filter(c => {
                const [, gt] = c.asvab.match(/(\d+)/) || [0, 85];
                return parseInt(gt) <= asvab;
            }).sort(() => Math.random() - 0.5).slice(0, 3);

            mosGrid.innerHTML = recommended.map(mos => `
                <div class="bg-zinc-800/50 border border-white/20 p-4 rounded-xl cursor-pointer hover:border-[#ffd700] transition-all" onclick="window.shared.openMosModal(${JSON.stringify(mos).replace(/"/g, '&quot;')})">
                    <h4 class="font-black uppercase text-sm mb-2 text-[#ffd700]">${mos.mos}</h4>
                    <p class="text-sm text-white">${mos.title}</p>
                </div>
            `).join('');
        }

        if (resultsDiv) {
            resultsDiv.classList.remove('hidden');
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
});
