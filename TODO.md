# Fix Careers and Split Training Not Showing

## Steps:
- [ ] 1. Install dependencies: `npm install`
- [ ] 2. Start Convex dev server: `cd convex && npx convex dev` (or from root)
- [ ] 3. Seed careers data: `npx convex run convex/seedCareers.ts`
- [x] 4. Add fallback to script.js (load careers.json if Convex fails)
- [ ] 5. Test: Refresh index.html, verify #careers shows MOS cards, #split-training visible
- [ ] 6. Check browser console for errors
- [ ] Complete: attempt_completion
