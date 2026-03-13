# Connecting to Convex Database (Plain JavaScript)

## Setup Instructions

This setup uses plain JavaScript (no React) with Convex's browser client.

1. **Install Convex CLI** (if not already installed):
   ```
   npm install -g convex
   ```

2. **Initialize Convex in your project**:
   ```
   convex dev
   ```
   This will create a Convex project and give you a URL like `https://your-project.convex.cloud`.

3. **Update the Convex URL in `script.js`**:
   Replace `"https://your-convex-url.convex.cloud"` with your actual Convex URL.

4. **Seed the careers data**:
   In your Convex dashboard or via CLI, run the `seedCareers` mutation to populate the database with career data.

5. **Deploy your Convex functions**:
   Run `convex deploy` to deploy the backend functions.

## What was changed

- Added Convex client script to `index.html`.
- Created `convex/` directory with schema, queries, and mutations for:
  - Careers (seeded from JSON)
  - Favorites
  - Achievements
  - Callbacks (recruiter callbacks)
  - Inquiries (contact form submissions)
- Updated `script.js` to use Convex for data storage instead of localStorage and local JSON file.
- Favorites, achievements, callbacks, and inquiries are now stored in the cloud database.

## Notes

- For production, implement user authentication to replace the demo userId.
- The careers data is seeded via the `seedCareers` mutation.
- All data operations are now asynchronous.