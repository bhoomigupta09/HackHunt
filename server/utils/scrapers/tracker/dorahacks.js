/**
 * DoraHacks JSON API — from hackathon-tracker.
 */
const https = require("https");

function fetchJSON(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json"
        }
      },
      (res) => {
        let data = "";
        res.on("data", (c) => {
          data += c;
        });
        res.on("end", () => {
          const trimmed = data.trim();
          if (trimmed.startsWith("<!") || trimmed.startsWith("<html")) {
            return reject(new Error("DoraHacks returned HTML (bot check)"));
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

async function scrapeDoraHacks() {
  console.log("[tracker] Scraping DoraHacks API...");
  try {
    const data = await fetchJSON(
      "https://dorahacks.io/api/hackathon/list/?limit=30&status=open"
    );
    let items =
      data?.data?.list ||
      data?.data?.results ||
      data?.data?.hackathons ||
      data?.results ||
      data?.list ||
      (Array.isArray(data) ? data : []);
    if (!Array.isArray(items)) items = [];
    const arr = items;
    console.log(`[tracker] DoraHacks: ${arr.length} hackathons`);
    return arr.map((h) => {
      const id = h.id ?? h.hackathon_id ?? h.slug;
      return {
        title: h.title || h.name || "Untitled",
        url:
          id != null
            ? `https://dorahacks.io/hackathon/${id}/detail`
            : "https://dorahacks.io/",
        deadline: h.voting_end_time || h.end_time || h.deadline || "N/A",
        prize: h.prize_pool ? `$${h.prize_pool}` : "N/A",
        participants: h.hacker_count || 0,
        thumbnail: h.logo || h.cover_img || h.banner || "",
        source: "DoraHacks",
        themes: []
      };
    });
  } catch (e) {
    console.warn("[tracker] DoraHacks error:", e.message);
    return [];
  }
}

module.exports = scrapeDoraHacks;
