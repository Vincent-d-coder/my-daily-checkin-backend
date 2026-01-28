const express = require("express");
const cors = require("cors");

const app = express();


//middleware

app.use(cors());
app.use(express.json());

//test route for post man

app.get("/api/health", (req, res) => {
    res.json({ status: "API is running" });
});


app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/checkin", require("./routes/checkin.routes"));

//central error handler
const errorHandler = require("./middleware/error.middleware");
app.use(errorHandler);

module.exports = app;
