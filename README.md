# SLE-Final Project

## Overview
A small static web app with pages for careers, eligibility, and a central landing page. Includes a JSON data store and JavaScript logic for form handling and interactivity.

## Current Features
- Structured content under `src/pages/` with a root `index.html` redirect to `src/pages/index.html`
- Local data files: `src/data/careers.json` and `src/data/armories.json`
- Shared UI components in `src/components/` for navbar/footer injection
- NJ-specific landing page copy with strong state branding and local recruiter outreach
- Home hero CTA for mission matching and recruiter contact
- Recruiter contact modal, sticky mobile CTA, FAQ preview, eligibility checklist, testimonials, and armory search experience
- Interactive behavior in `src/js/shared.js` and page-specific logic in `src/js/index.js`
- Styling in `src/css/style.css` (layout, responsive design, hover/focus states)

## Planned Additions
- Interactive job filtering by department/location
- “Apply now” form with submission endpoint (e.g., `/api/apply`)
- LocalStorage draft save for forms (auto-save user progress)
- Improved mobile responsiveness and accessibility (ARIA roles, screen-reader labels)
- UI animations (fade-in cards, loading skeletons)
- JavaScript unit tests (Jest or Vitest)

## Future Enhancements
- Replace static `careers.json` with real backend API
- Add user auth and saved application profiles
- Add admin interface for posting and managing jobs
- Add CI pipeline (linting + tests on PRs)
- Deployment script for Netlify/Vercel/GitHub Pages

## Contact
- Email: `jaydenazore918@gmail.com`
- Phone: `(862)462-0446`


