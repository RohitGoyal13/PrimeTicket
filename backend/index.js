
require("dotenv").config();
const pool = require("./config/connect");
const express = require("express");
const app = express();
const cors = require("cors");
const {response} = require("express");
const schedule = require("node-schedule");
const authRoutes = require("./routes/authRoutes");
const {protectAdmin} = require("./middleware/adminMiddleware");
const adminRoutes = require("./routes/adminRoutes");
const trainRoutes = require("./routes/trainRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");


const allowed = ["https://prime-ticket.vercel.app",
                 "http://localhost:5173",
                 "https://primeticket.onrender.com"
                ];
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowed.includes(origin))
}));

app.use(express.json());



// login routes

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(process.env.PORT || 5050,  () => {
     console.log(`✅ Server started on port ${process.env.PORT || 5050}`);
    });

