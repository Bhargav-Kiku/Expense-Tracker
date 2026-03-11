require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], 
  })
);

app.use(express.json());

connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Simple route for health checking
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Self-ping mechanism to keep the server awake
const selfPingInterval = 14 * 60 * 1000; // 14 minutes
setInterval(() => {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    console.log("BACKEND_URL is not set. Skipping self-ping.");
    return;
  }
  
  const protocol = backendUrl.startsWith('https') ? require('https') : require('http');
  protocol.get(`${backendUrl}/ping`, (res) => {
    if (res.statusCode === 200) {
      console.log("Self-ping successful");
    } else {
      console.error(`Self-ping failed with status code: ${res.statusCode}`);
    }
  }).on("error", (err) => {
    console.error("Self-ping Error: ", err.message);
  });
}, selfPingInterval);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
