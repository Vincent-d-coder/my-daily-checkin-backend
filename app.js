require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

//middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("HIT:", req.method, req.path);
  next();
});



//test route for post man

app.get("/api/health", (req, res) => {
    res.json({ status: "API is running" });
});


const authRoutes = require("./routes/auth.routes");
const checkinRoutes = require("./routes/checkin.routes");
const authMiddleware = require("./middleware/auth.middleware");

// PUBLIC routes
app.use("/api/auth", authRoutes);

// PROTECTED routes
app.use("/api/checkin", authMiddleware, checkinRoutes);


//central error handler
const errorHandler = require("./middleware/error.middleware");
app.use(errorHandler);

module.exports = app;
