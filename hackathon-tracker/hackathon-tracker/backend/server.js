process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const refreshData = require("./scheduler");
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));
const DATA_FILE = path.join(__dirname, "data/hackathons.json");
app.get("/api/hackathons", (req, res) => {
  console.log("API: Fetching hackathons data");
  if (!fs.existsSync(DATA_FILE)) {
    console.log("API: Data file not found, returning empty");
    return res.json({ hackathons: [], total: 0 });
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  console.log(`API: Returning ${data.length} hackathons`);
  res.json(data);
});
app.get("/api/refresh", async (req, res) => {
  console.log("API: Refreshing data...");
  await refreshData();
  console.log("API: Data refresh completed");
  res.json({ message: "Refreshed!" });
});
app.listen(3000, async () => {
  console.log("Server running at http://localhost:3000");
  await refreshData();
});
