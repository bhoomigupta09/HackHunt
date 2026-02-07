const express = require("express");
const cors = require("cors");

// Import database connection to ensure MongoDB is connected
require("./database/user");

const { userRouter } = require("./routes/user");
const { adminRouter } = require("./routes/admin");

const app = express();

// CORS middleware to allow frontend requests
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// middleware to read JSON body
app.use(express.json());

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});

// routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);

// start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
    console.log("Health check: http://localhost:3000/api/v1/health");
});

