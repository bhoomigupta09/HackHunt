# Hackathon tracker folder

The scraping logic from `hackathon-tracker/backend/` has been **merged into the main server**:

- **Location:** `server/utils/scrapers/tracker/` (`devpost.js`, `unstop.js`, `dorahacks.js`)
- **API:** `GET /api/v1/hackathons/live` (used by the React page `/hackathons`)

You can keep this folder as a reference or delete the duplicate `backend/node_modules` to save disk space. The standalone `backend/server.js` (port 3000) is **not** required for HackHunt; use the root app + `server/` on port 5000.
