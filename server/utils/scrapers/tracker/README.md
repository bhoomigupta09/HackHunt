# Hackathon tracker scrapers (merged)

These modules were integrated from `hackathon-tracker/hackathon-tracker/backend/scrapers/` into the main HackHunt API.

| File | Source | Method |
|------|--------|--------|
| `devpost.js` | Devpost | `https://devpost.com/api/hackathons` (JSON) |
| `unstop.js` | Unstop | HTTP fetch + `__NEXT_DATA__` JSON walk + link fallback (no browser) |
| `dorahacks.js` | DoraHacks | `https://dorahacks.io/api/hackathon/list/` (JSON) |

The combined feed is exposed at **`GET /api/v1/hackathons/live`** (see `liveHackathonScraper.js`).

**Requirements:** `axios` + `cheerio` (already on the main server).

**Note:** If Unstop changes their Next.js JSON shape, update `collectHackathonLikeArrays` in `unstop.js`.
