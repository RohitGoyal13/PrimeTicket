const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// import your booking controller
const bookingsController = require("../controllers/bookingController");

const router = express.Router();

// init razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

// 👉 Create Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, error: "Amount required" });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      order,
      key_id: process.env.RZP_KEY_ID, // public key for frontend
    });
  } catch (err) {
    console.error("create-order error:", err);
    res.status(500).json({ success: false, error: "Order creation failed" });
  }
});

// 👉 Verify Payment + Create Booking
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingData, // 👈 frontend must send this with userId, routeId, trainId, etc.
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, error: "Missing payment fields" });
    }

    // validate signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

            // ✅ Signature verified → Create booking directly
        let bookingResult;
       try {
        bookingResult = await bookingsController.createTicket({
          ...bookingData,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
        });
      } catch (err) {
        console.error("Booking creation failed after payment:", err);
        return res.status(500).json({ success: false, error: "Payment success but booking failed" });
      }

    return res.json({
      success: true,
      message: "Payment verified & booking created",
      booking: bookingResult,
    });
  } catch (err) {
    console.error("verify-payment error:", err);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
});

module.exports = router;
