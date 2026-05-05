// contact.js - Multi-step contact form with recruiter lookup
let currentStep = 1;

function setStep(step) {
    document.querySelectorAll('.contact-step').forEach(el => el.classList.add('hidden'));
    const el = document.getElementById(`contact-form-step-${step}`);
    if (el) el.classList.remove('hidden');
    currentStep = step;
    updateStepUI(step);
}

function updateStepUI(step) {
    [1, 2].forEach(n => {
        const dot = document.getElementById(`dot-${n}`);
        const label = document.getElementById(`label-${n}`);
        const line = document.getElementById(`line-${n}`);
        if (dot) dot.classList.toggle('active', n <= step);
        if (dot) dot.classList.toggle('completed', n < step);
        if (label) label.classList.toggle('active', n === step);
        if (line) line.classList.toggle('active', step >= 2);
    });
}

function prevStep() {
    if (currentStep > 1) setStep(currentStep - 1);
}
window.prevStep = prevStep;

// Haversine distance (miles)
function haversine(lat1, lng1, lat2, lng2) {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function zipToLatLng(zip) {
    const n = parseInt(zip);
    if (n >= 7001 && n <= 7999) return { lat: 40.75, lng: -74.2 };
    if (n >= 8001 && n <= 8099) return { lat: 40.1,  lng: -74.7 };
    if (n >= 8100 && n <= 8299) return { lat: 39.8,  lng: -74.9 };
    if (n >= 8300 && n <= 8499) return { lat: 39.5,  lng: -75.0 };
    return { lat: 40.3, lng: -74.5 };
}

async function showNearestRecruiter(zip) {
    if (!zip || zip.length !== 5 || !/^\d{5}$/.test(zip)) return;
    const armories = await window.shared?.loadArmories();
    if (!armories || armories.length === 0) return;

    const origin = zipToLatLng(zip);
    const nearest = armories
        .filter(a => a.lat && a.lng)
        .sort((a, b) =>
            haversine(origin.lat, origin.lng, a.lat, a.lng) -
            haversine(origin.lat, origin.lng, b.lat, b.lng)
        )[0];

    if (!nearest) return;

    const dist = Math.round(haversine(origin.lat, origin.lng, nearest.lat, nearest.lng));
    document.getElementById('recruiter-name').textContent = nearest.name;
    document.getElementById('recruiter-address').textContent = nearest.address;
    document.getElementById('recruiter-phone').textContent = nearest.phone;
    document.getElementById('recruiter-contact').textContent = `Recruiter: ${nearest.recruiter} · ~${dist} mi away`;

    const box = document.getElementById('recruiter-suggestion');
    if (box) {
        box.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setStep(1);

    // ZIP lookup on blur
    const zipInput = document.getElementById('contact-zip');
    if (zipInput) {
        zipInput.addEventListener('blur', () => showNearestRecruiter(zipInput.value.trim()));
        zipInput.addEventListener('input', () => {
            if (zipInput.value.trim().length === 5) showNearestRecruiter(zipInput.value.trim());
        });
    }

    // Step 1 → step 2
    const personalForm = document.getElementById('contact-personal-form');
    if (personalForm) {
        personalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            setStep(2);
        });
    }

    // Previous button
    const prevBtn = document.getElementById('prev-step-btn');
    if (prevBtn) prevBtn.addEventListener('click', prevStep);

    // Step 2 → submit
    const interestsForm = document.getElementById('contact-interests-form');
    if (interestsForm) {
        interestsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = interestsForm.querySelector('[type="submit"]');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

            const formData = {
                firstName: document.getElementById('contact-firstname')?.value || '',
                lastName:  document.getElementById('contact-lastname')?.value  || '',
                email:     document.getElementById('contact-email')?.value     || '',
                phone:     document.getElementById('contact-phone')?.value     || '',
                zip:       document.getElementById('contact-zip')?.value       || '',
                interest:  document.getElementById('contact-interest')?.value  || '',
                message:   document.getElementById('contact-message')?.value   || '',
            };

            const success = window.shared?.submitContactForm
                ? await window.shared.submitContactForm(formData)
                : false;

            if (success) {
                document.querySelectorAll('.contact-step').forEach(el => el.classList.add('hidden'));
                document.getElementById('step-progress')?.classList.add('hidden');
                document.querySelector('.bg-zinc-900\\/50')?.classList.add('hidden');
                const successDiv = document.getElementById('contact-success');
                if (successDiv) successDiv.classList.remove('hidden');
            } else {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message →'; }
            }
        });
    }
});
