// contact.js - Contact form functionality
let currentStep = 1;

function showStep(step) {
    document.querySelectorAll('.contact-step').forEach(s => s.classList.add('hidden'));
    const stepEl = document.getElementById(`contact-form-step-${step}`);
    if (stepEl) {
        stepEl.classList.remove('hidden');
    }
    currentStep = step;
}

function prevStep() {
    if (currentStep > 1) showStep(currentStep - 1);
}

document.addEventListener('DOMContentLoaded', () => {
    const personalForm = document.getElementById('contact-personal-form');
    const interestsForm = document.getElementById('contact-interests-form');

    if (personalForm) {
        personalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showStep(2);
        });
    }

    if (interestsForm) {
        interestsForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const firstName = document.getElementById('contact-firstname')?.value || '';
            const lastName = document.getElementById('contact-lastname')?.value || '';
            const email = document.getElementById('contact-email')?.value || '';
            const phone = document.getElementById('contact-phone')?.value || '';
            const zip = document.getElementById('contact-zip')?.value || '';
            const interest = document.getElementById('contact-interest')?.value || '';
            const message = document.getElementById('contact-message')?.value || '';

            const formData = { firstName, lastName, email, phone, zip, interest, message };

            if (window.shared && window.shared.submitContactForm) {
                window.shared.submitContactForm(formData).then(success => {
                    if (success) {
                        document.querySelectorAll('.contact-step').forEach(s => s.classList.add('hidden'));
                        const successDiv = document.getElementById('contact-success');
                        if (successDiv) {
                            successDiv.classList.remove('hidden');
                        }
                    }
                });
            }
        });
    }
});
