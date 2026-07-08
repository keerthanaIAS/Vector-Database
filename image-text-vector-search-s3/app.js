require("dotenv").config();
const express = require("express");
const cors = require("cors");
const uploadRoutes = require("./routes/uploadRoutes");
const searchRoutes = require("./routes/searchRoutes");
const textSearchRoutes = require("./routes/textSearchRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", uploadRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/search/text", textSearchRoutes);

module.exports = app;