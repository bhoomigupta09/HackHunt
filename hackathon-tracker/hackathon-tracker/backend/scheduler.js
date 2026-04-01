const fs = require("fs");
const path = require("path");
const scrapeDevpost = require("./scrapers/devpost");
const scrapeUnstop = require("./scrapers/unstop");
const scrapeDoraHacks = require("./scrapers/dorahacks");
const DATA_FILE = path.join(__dirname, "data/hackathons.json");
async function refreshData() {
  console.log("Refreshing data...");
  if (!fs.existsSync(path.join(__dirname, "data"))) fs.mkdirSync(path.join(__dirname, "data"));
  const [devpost, unstop, dorahacks] = await Promise.all([scrapeDevpost(), scrapeUnstop(), scrapeDoraHacks()]);
  const all = [...devpost, ...unstop, ...dorahacks];
  fs.writeFileSync(DATA_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), total: all.length, hackathons: all }, null, 2));
  console.log(`Done! ${all.length} hackathons saved (Devpost: ${devpost.length}, Unstop: ${unstop.length}, DoraHacks: ${dorahacks.length})`);
}
module.exports = refreshData;
