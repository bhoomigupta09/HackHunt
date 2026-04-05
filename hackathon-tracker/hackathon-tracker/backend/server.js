require("dotenv").config(); // Loads variables from .env
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const refreshData = require("./scheduler");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));

const MONGO_URI = process.env.MONGO_URI;

// Define a flexible Schema to accept data from your scrapers
const hackathonSchema = new mongoose.Schema({}, { strict: false });
const Hackathon = mongoose.models.Hackathon || mongoose.model("Hackathon", hackathonSchema, "hackathons");

app.get("/api/hackathons", async (req, res) => {
  console.log("API: Fetching hackathons data from MongoDB");
  try {
    const data = await Hackathon.find({});
    
    if (!data || data.length === 0) {
      console.log("API: No data found, returning empty");
      return res.json({ hackathons: [], total: 0 });
    }
    
    console.log(`API: Returning ${data.length} hackathons`);
    // Reconstructing the JSON structure that your frontend expects
    res.json({
      updatedAt: new Date().toISOString(),
      total: data.length,
      hackathons: data
    });
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    res.status(500).json({ error: "Failed to fetch data from database" });
  }
});

app.get("/api/refresh", async (req, res) => {
  console.log("API: Refreshing data...");
  await refreshData();
  console.log("API: Data refresh completed");
  res.json({ message: "Refreshed!" });
});

// Check if MONGO_URI is properly loaded before trying to connect
if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined. Please check your .env file.");
  process.exit(1); 
}

// Connect to MongoDB, then start the server
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB successfully");
    app.listen(3000, async () => {
      console.log("Server running at http://localhost:3000");
      // Optional: automatically refresh data when the server starts
      await refreshData();
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });