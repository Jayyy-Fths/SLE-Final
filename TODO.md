# SLE-Final Website Restructure TODO

## Status: [2/12] Steps Completed ✅

### Phase 1: Backup & Cleanup (2/2) ✅
- [x] 1. Create backups of current files (tar czf backup.tar.gz .)
- [x] 2. Delete duplicate/messy dirs (rm -rf assets components pages images; rm *.bak)

### Phase 2: Create src/ Structure (5/5) ✅
- [x] 3. Create src/ folders: mkdir -p src/{css,js,data,images,components,pages}
- [x] 4. Move canonical files to src/ (style.css → src/css/, bootstrap.js → src/js/, etc.)
- [x] 5. Move data: careers.json, armories.json → src/data/
- [x] 6. Move images: knuckles.jpg → src/images/
- [x] 7. Move components: navbar.html, footer.html → src/components/

### Phase 3: Rewrite & Update Pages (4 steps)
- [ ] 8. Rewrite root index.html as entry pointing to src/pages/index.html
- [ ] 9. Update all src/pages/*.html with new relative paths (../css/style.css, ../js/bootstrap.js, etc.)
- [ ] 10. Ensure dynamic nav/footer loads from ../components/
- [ ] 11. Fix JS module loads in src/js/shared.js for pages/*.js

### Phase 4: Finalize & Test (1 step)
- [ ] 12. Test all functionality, update README.md, cleanup

**Next step: Phase 1.1 - Backup**

