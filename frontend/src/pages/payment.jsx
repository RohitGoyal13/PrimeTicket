import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/payment.css";
import BASE_URL from "../api";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state?.bookingData;

  console.log(bookingData);

  useEffect(() => {
    if (!bookingData) {
      alert("No booking data found, redirecting...");
      navigate("/");
      return;
    }

    if (!bookingData.price) {
      alert("No price found in booking data!");
      navigate("/");
      return;
    }

    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (
          document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
          )
        ) {
          return resolve(true);
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const startPayment = async () => {
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Check your connection.");
        return;
      }

      try {
        // 👉 Create Order on backend
        const orderRes = await axios.post(
          `${BASE_URL}/api/payment/create-order`,
          {
            amount: bookingData.price,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
          }
        );

        console.log("Order response:", orderRes.data);
        console.log("Booking Data before verification:", bookingData);

        const { order, key_id } = orderRes.data;

        // 👉 Configure Razorpay
        const options = {
          key: key_id,
          amount: order.amount,
          currency: order.currency,
          name: "Train Booking System",
          description: "Ticket Booking Payment",
          order_id: order.id,
          handler: async function (response) {
            try {
              // ✅ Fix missing/null fields with safe defaults
              const safeBookingData = {
                ...bookingData,
                userId: bookingData?.userId || 1, // fallback demo user
                sourceStation: bookingData?.sourceStation || "Delhi",
                destinationStation: bookingData?.destinationStation || "Mumbai",
              };

              console.log("Booking Data being sent (safe):", safeBookingData);

              // 👉 Verify Payment
              const verifyRes = await axios.post(
                `${BASE_URL}/api/payment/verify-payment`,
                {
                  ...response,
                  bookingData: safeBookingData,
                }
              );

              if (verifyRes.data.success) {
                localStorage.removeItem("selectedTrain");
                localStorage.removeItem("trainResults");
                navigate("/mybookings");
              } else {
                alert("❌ Payment Verification Failed!");
              }
            } catch (err) {
              console.error(err);
              alert("Server error during verification");
            }
          },
          prefill: {
            name: bookingData.passengers[0]?.name || "User",
            email: bookingData.email,
            contact: bookingData.contactno,
          },
          notes: {
            bookingFor: "Train Ticket",
          },
          theme: {
            color: "#3399cc",
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (err) {
        console.error(err.response?.data || err.message)
      }
    };

    startPayment();
  }, [bookingData, navigate]);

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>💳 Processing Payment</h2>
        <p>Please wait while we redirect you to Razorpay...</p>
      </div>
    </div>
  );
};

export default Payment;
