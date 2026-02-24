let allCareers = [];

async function initPortal() {
    try {
        const response = await fetch('careers.json');
        allCareers = await response.json();
        renderCareers(allCareers);
        populateSelectors(allCareers);
        lucide.createIcons();
    } catch (err) {
        console.error("Failed to load MOS data", err);
    }
}

function renderCareers(data) {
    const grid = document.getElementById('career-grid');
    grid.innerHTML = data.map(m => `
        <div class="bg-zinc-900 p-8 border border-white/5 rounded-xl group hover:border-[#ffd700]/50 transition-all cursor-default" data-category="${m.cat}">
            <div class="flex justify-between items-start mb-4">
                <span class="text-[#ffd700] font-mono text-xs font-bold uppercase tracking-widest">MOS ${m.mos}</span>
                ${m.bonus ? '<span class="bg-[#ffd700] text-black text-[8px] font-black px-2 py-0.5 rounded-full">BONUS</span>' : ''}
            </div>
            <h3 class="text-xl font-black uppercase mb-2 group-hover:text-[#ffd700] transition-colors">${m.title}</h3>
            <p class="text-gray-400 text-sm leading-relaxed">${m.desc}</p>
        </div>
    `).join('');
}

function populateSelectors(data) {
    const s1 = document.getElementById('compare-1');
    const s2 = document.getElementById('compare-2');
    
    [s1, s2].forEach(select => {
        data.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.mos;
            opt.innerText = `${m.mos} - ${m.title}`;
            select.appendChild(opt);
        });

        select.addEventListener('change', (e) => {
            const match = data.find(m => m.mos === e.target.value);
            const detailDiv = select.nextElementSibling;
            if(match) {
                detailDiv.style.opacity = "1";
                detailDiv.innerHTML = `
                    <div class="bg-zinc-950 p-4 rounded border-l-4 border-[#ffd700]">
                        <h4 class="text-[10px] text-gray-500 uppercase font-black mb-1">Entry Requirement</h4>
                        <p class="text-sm font-bold uppercase">${match.asvab}</p>
                    </div>
                    <div class="bg-zinc-950 p-4 rounded border-l-4 border-white">
                        <h4 class="text-[10px] text-gray-500 uppercase font-black mb-1">Initial Training</h4>
                        <p class="text-sm font-bold uppercase">${match.training}</p>
                    </div>
                `;
            } else { detailDiv.style.opacity = "0"; }
        });
    });
}

let currentQ = 0;
let quizScores = { combat:0, intel:0, medical:0, engineer:0, aviation:0 };
const questions = [
    { text: "Where do you thrive?", opts: [{t: "Solving data puzzles", c:"intel"}, {t:"Physical field work", c:"combat"}, {t:"Repairing complex tech", c:"aviation"}] },
    { text: "Your main goal?", opts: [{t: "Protecting lives", c:"medical"}, {t:"Building infrastructure", c:"engineer"}, {t:"Strategic defense", c:"combat"}] }
];

function startQuiz() {
    document.getElementById('quiz-start').classList.add('hidden');
    document.getElementById('quiz-question').classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    const q = questions[currentQ];
    document.getElementById('q-text').innerText = q.text;
    document.getElementById('q-options').innerHTML = q.opts.map(o => `
        <button onclick="handleAnswer('${o.c}')" class="p-4 border border-white/10 hover:border-[#ffd700] hover:bg-zinc-800 transition-all font-bold uppercase text-xs">${o.t}</button>
    `).join('');
}

function handleAnswer(cat) {
    quizScores[cat]++;
    currentQ++;
    if(currentQ < questions.length) showQuestion();
    else finishQuiz();
}

function finishQuiz() {
    document.getElementById('quiz-question').classList.add('hidden');
    const winner = Object.keys(quizScores).reduce((a, b) => quizScores[a] > quizScores[b] ? a : b);
    document.getElementById('quiz-result').classList.remove('hidden');
    document.getElementById('result-cat').innerText = winner;
    
    document.getElementById('roadmap').classList.remove('hidden');
    const asvabFocus = { intel: ["AR","WK"], combat:["CO","GS"], medical:["ST","GS"], engineer:["MK","MC"] };
    document.getElementById('asvab-focus').innerHTML = (asvabFocus[winner] || ["GT"]).map(t => 
        `<span class="bg-[#ffd700] text-black px-2 py-1 text-[10px] font-black">${t}</span>`
    ).join('');
    
    lucide.createIcons();
    document.getElementById('roadmap').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('mos-search').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = allCareers.filter(m => m.title.toLowerCase().includes(val) || m.mos.toLowerCase().includes(val));
    renderCareers(filtered);
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'bg-[#ffd700]', 'text-black'));
        btn.classList.add('active', 'bg-[#ffd700]', 'text-black');
        const f = btn.dataset.filter;
        renderCareers(f === 'all' ? allCareers : allCareers.filter(m => m.cat === f));
    });
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });

document.querySelectorAll('.js-reveal').forEach(el => observer.observe(el));
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if(window.scrollY > 50) nav.classList.add('scrolled', 'bg-black/95', 'py-3');
    else nav.classList.remove('scrolled', 'bg-black/95', 'py-3');
});

initPortal();