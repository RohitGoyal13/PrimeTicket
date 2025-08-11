const pool = require("./config/connect");
const express = require("express");
const app = express();
const cors = require("cors");
const {response} = require("express");
const schedule = require("node-schedule");
const authRoutes = require("./routes/authRoutes");
const {protectAdmin} = require("./middleware/adminMiddleware");
 const adminRoutes = require("./routes/adminRoutes");

app.use(cors());
app.use(express.json());

// login routes

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.listen(process.env.PORT || 5050,  () => {
     console.log(`✅ Server started on port ${process.env.PORT || 5050}`);
    });

