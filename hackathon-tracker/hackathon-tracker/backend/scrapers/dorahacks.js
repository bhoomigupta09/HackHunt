const https = require("https");
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" } }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on("error", reject);
  });
}
async function scrapeDoraHacks() {
  console.log("Scraping DoraHacks...");
  try {
    const data = await fetchJSON("https://dorahacks.io/api/hackathon/list/?limit=20&status=open");
    const items = data?.data || data?.list || (Array.isArray(data) ? data : []);
    console.log(`DoraHacks: ${items.length} hackathons`);
    return items.map(h => ({
      title: h.title || h.name || "Untitled",
      url: `https://dorahacks.io/hackathon/${h.id || h.slug}/detail`,
      deadline: h.voting_end_time || h.end_time || "N/A",
      prize: h.prize_pool ? `$${h.prize_pool}` : "N/A",
      participants: h.hacker_count || 0, thumbnail: h.logo || h.cover_img || "",
      source: "DoraHacks", themes: []
    }));
  } catch(e) { console.log("DoraHacks error:", e.message); return []; }
}
module.exports = scrapeDoraHacks;
