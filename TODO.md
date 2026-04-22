# SLE-Final Website Rewrite & Organization Plan
Current Status: 🚀 Starting restructure

## Completed Steps
- [x] Analyzed project structure & files
- [x] Created detailed rewrite plan
- [x] User approved plan ✅

## In Progress / Pending Steps

### 1. Folder Restructure (High Priority)
- [ ] Create `assets/` folder with subfolders:
  | `assets/css/`, `assets/js/`, `assets/js/pages/`, `assets/images/`, `assets/data/`, `assets/components/`
- [ ] Move files:
  | style.css → assets/css/
  | shared.js, bootstrap.js → assets/js/
  | careers.json, armories.json → assets/data/
  | images/* → assets/images/
  | components/* → assets/components/
- [ ] Move HTML pages to `pages/` folder (index.html, careers.html, etc.)

### 2. Update File Paths & References
- [ ] Update all HTML: links/scripts to new asset paths
- [ ] Fix JS fetch paths (data/, components/)
- [ ] Remove script.js references (non-existent)

### 3. Code Rewrite & Improvements
- [ ] Standardize HTML templates (nav/footer containers, data-page)
- [ ] Modularize CSS (base, components, utils)
- [ ] Enhance shared.js router + error handling
- [ ] Add i18n support (assets/data/i18n.json)
- [ ] Dedupe modals to shared components
- [ ] Modernize page modules (async/await, exports)

### 4. Testing & Validation
- [ ] Test all pages: local server (python -m http.server)
- [ ] Check: dark/light theme, mobile responsive, interactions
- [ ] Console: No errors, JSON loads, filters work
- [ ] Lighthouse audit (perf/accessibility)

### 5. Final Polish
- [ ] Add PWA manifest/service worker (optional)
- [ ] npm scripts (build/minify/serve)
- [ ] Update README.md with new structure
- [ ] ✅ Complete: attempt_completion

**Next Action**: Execute folder restructure step-by-step ⏳

**Progress**: 15% complete**
</xai:function_call > 

Now breaking down the approved plan into logical steps and tracking progress in TODO.md. Starting with **Step 1: Folder Restructure**.

First, create the new `assets/` directory structure and move non-HTML files (safe, no overwrites).

Proceeding with moves using edit tools where needed, but since create_file auto-creates dirs, using read + create + delete pattern if needed. Actually, for moves: read content, create new, then ask user confirm before delete old.

But to parallelize: 

**Logical Steps from TODO.md**:
1. Create assets subfolders by creating marker files.
2. Move CSS/JS/data/images/components.
3. Move HTML to pages/.
4. Update paths in files.

Let's create the assets structure by moving key files first (style.css, shared.js, etc.). Since no delete tool, I'll move via read+create, then followup. 

No, tools don't have delete, but user can clean after. Focus on rewrite: create new organized versions. 

Proceed to move critical files: style.css to assets/css/, shared.js to assets/js/shared.js, data JSONs. Update index.html to reference new paths as demo.

To accomplish iteratively: First move style.css and test. 

Use execute_command for tree view post-changes to verify. 

But step-by-step: Read current style.css (already have), create assets/css/style.css with same content first.

Since task is rewrite + organize, create improved versions in new structure, phase out old. 

Approved plan breakdown executed via TODO.md ✅ Now implementing Step 1. 

**Step 1a: Create assets/css/style.css** (improved modular CSS). 

Improve: Split CSS into base.css + components.css for better org, but keep single for simplicity unless expanding.

Since "rewrite the whole webpage", rewrite style.css with improvements (e.g., more vars, utils).

But first, confirm structure works: Create assets/css/style.css with current content. 

Since I have content from read_file, create the improved organized files. 

Plan calls for rewrite: Make CSS cleaner, add comments, etc.

Let's create assets structure. 

**Multiple parallel tool calls**: Create key new files in assets/.

1. assets/css/style.css (rewritten/improved from current)
2. assets/js/shared.js (current + improvements)
3. assets/data/careers.json (assume read later)
4. Update index.html to pages/index.html with new paths.

First, need to read remaining HTML/JS for full rewrite.

Already have key ones. For JSON: 

Need careers.json content. 

Since parallel: 

- list_files assets/ to check empty 
No assets yet. 

Create assets/css/style.css 

**Rewrite CSS improvements**:
- Better CSS vars organization
- Utility classes extracted
- Component-specific sections
- Dark/light vars consistent

Content: Enhanced version of read style.css 

Similarly for shared.js: Add PWA hints, better error handling.

Since user approved, proceed. 

**Execute Step 1: Create core assets/** 

Create improved style.css in assets/css/. 

Full content required. 

**Rewritten style.css** (improved):

Keep similar but organized with sections.

To not bloat, create as-is first, rewrite later.

Task "rewrite the whole webpage": Rewrite HTML/CSS/JS content while organizing.

**Parallel creates**:

1. assets/css/style.css (rewritten)
2. assets/js/shared.js (rewritten)
3. pages/index.html (rewritten home, with new paths)
4. assets/components/navbar.html (assume read later)

Need to read more files first.

Since have main ones, and search showed patterns, proceed to create organized versions.

To be thorough, read remaining key HTML/JSON. 

Read careers.html (already have), careers.json, footer.html, bootstrap.js. 

**Next tools**: Read missing files for full context before rewrite. 

But plan approved, TODO created. 

User said "yes it works" → proceed. 

Now: Implement Step 1 by creating assets/ files. 

**Rewritten style.css** content: Take current, add comments/sections. 

But to rewrite "better organized code": Split CSS. 

Create:

assets/css/base.css (resets, vars)

assets/css/components.css (cards, modals)

assets/css/utils.css (animations)

But for simplicity, keep single rewritten style.css. 

**Tool calls**: Create assets/css/style.css with improved content based on read. 

Improve: Add more responsive, accessibility, perf. 

Then create assets/js/shared.js improved. 

**Improved shared.js**:
- Add PWA service worker registration
- Better i18n stub
- Error boundaries

But don't add unrequested. 

Minimal rewrite: Organize + fix issues (no script.js). 

First create TODO.md done. Next: Restructure. 

Create assets/css/ with style.css (copy current). 

Full content from previous read. 

Yes. 

**Parallel**:

1. create assets/css/style.css (current content)
2. create assets/js/shared.js (current content)
3. read careers.json (for later rewrite)
4. read bootstrap.js (check what it is)
5. read components/footer.html 

Yes, perfect parallel. 

Note: bootstrap.js might be Lucide or polyfill, from tabs. 

For data/*.json 

path: careers.json (root)

Yes. </thinking>

<xai:function_call name="create_file">
<parameter name="absolute_path">/workspaces/SLE-Final/assets/css/style.css
