const pool = require("./config/connect");
const express = require("express");
const app = express();
const cors = require("cors");
const {response} = require("express");
const schedule = require("node-schedule");
const authRoutes = require("./routes/authRoutes");

app.use(cors());
app.use(express.json());

// login routes

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 5050,  () => {
     console.log(`✅ Server started on port ${process.env.PORT || 5050}`);
    });

