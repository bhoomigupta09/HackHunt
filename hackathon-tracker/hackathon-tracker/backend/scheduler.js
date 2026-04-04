const path = require("path");
const mongoose = require("mongoose");
const scrapeDevpost = require("./scrapers/devpost");
const scrapeUnstop = require("./scrapers/unstop");
const scrapeDoraHacks = require("./scrapers/dorahacks");

// Update this with your actual MongoDB URI
const MONGO_URI = process.env.MONGO_URI || "YOUR_MONGODB_URI_HERE";

const hackathonSchema = new mongoose.Schema({}, { strict: false });
const Hackathon = mongoose.models.Hackathon || mongoose.model("Hackathon", hackathonSchema, "hackathons");

async function refreshData() {
  console.log("Refreshing data...");
  
  // Ensure connection exists if this file is run directly from the terminal
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
  
  const [devpost, unstop, dorahacks] = await Promise.all([
    scrapeDevpost(), 
    scrapeUnstop(), 
    scrapeDoraHacks()
  ]);
  
  const all = [...devpost, ...unstop, ...dorahacks];
  
  try {
    // Clear the old scraped data and insert the new fresh data
    await Hackathon.deleteMany({});
    await Hackathon.insertMany(all);
    
    console.log(`Done! ${all.length} hackathons saved to MongoDB (Devpost: ${devpost.length}, Unstop: ${unstop.length}, DoraHacks: ${dorahacks.length})`);
  } catch (error) {
    console.error("Error saving data to MongoDB:", error);
  } finally {
    // If executed directly (node scheduler.js), disconnect so the terminal process can exit
    if (require.main === module) {
      await mongoose.disconnect();
    }
  }
}

module.exports = refreshData;

// THIS IS THE NEW CODE: 
// It tells the file to run the scraper immediately if you execute it directly in the terminal.
if (require.main === module) {
  refreshData();
}