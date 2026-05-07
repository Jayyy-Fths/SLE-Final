# SLE-Final Website Restructure TODO

## Status: In progress

### Phase 1: Review current structure
- [x] 1. Confirm current repo layout and compare against planned migrate-to-src structure
- [x] 2. Identify existing root page files and available assets
- [x] 3. Decide whether to keep root `index.html` or migrate to `src/pages/index.html`
- [x] 4. Update plan based on actual file locations and current site functionality

### Phase 2: Organize assets and data
- [x] 5. Move JSON data files into `src/data/` (`careers.json`, `armories.json`)
- [x] 6. Move images into `src/images/`
- [x] 7. Keep shared CSS and JS in `src/css/` and `src/js/`
- [x] 8. Create shared partials in `src/components/` for navbar/footer if needed
- [x] 9. Update all asset references and fetch paths to match `src/` layout

### Phase 3: Update page structure and shared logic
- [x] 10. Rewrite homepage entry if migrating to `src/pages/index.html`
- [x] 11. Update each page with new relative paths for CSS/JS/assets
- [x] 12. Ensure shared navbar/footer injection works on all pages
- [x] 13. Fix site JS and shared module loading in `src/js/shared.js`
- [x] 14. Make mobile menu auto-close after navigation and improve mobile tap targets

### Phase 4: Add UX improvements
- [x] 15. Add a homepage “How to use this site” or quick-start guide section
- [x] 16. Add FAQ preview on homepage with top 3 questions and link to full FAQ
- [x] 17. Add recruiter contact CTA or modal on homepage
- [x] 18. Add “Back to top” button for long pages
- [ ] 19. Add visible focus states for buttons/links and improve keyboard navigation
- [x] 20. Add a “What to expect next” enlistment timeline or roadmap graphic
- [x] 21. Add testimonials or quote section near hero/benefits
- [x] 22. Add sticky or fixed “Apply Now” CTA for mobile users
- [x] 23. Add toast or confirmation feedback for favorites and quiz actions

### Phase 5: Accessibility and polish
- [x] 24. Audit `aria-label`, `alt`, and text contrast on key interactive elements
- [x] 25. Add support for `prefers-reduced-motion` and improved motion-safe behavior
- [x] 26. Ensure skip-links and keyboard flow are active on each page
- [x] 27. Add responsive layout verification for mobile and tablet widths

### Phase 6: Finalize and test
- [x] 28. Test all functionality with static verification and site path checks
- [x] 29. Validate site performance by removing stale root assets and reducing broken references
- [x] 30. Update `README.md` with new structure, run instructions, and file paths
- [x] 31. Clean up old root assets and remove any stale unused files
- [x] 32. Add homepage gallery and NJ Army National Guard logo to navbar as final polish

