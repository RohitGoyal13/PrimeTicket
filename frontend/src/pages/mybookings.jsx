import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/mybookings.css";
import BASE_URL from "../api";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [overlayMsg, setOverlayMsg] = useState("");

  useEffect(() => {
    const userId = sessionStorage.getItem("userID") || 1;

    const fetchBookings = async () => {
      try {
        const res = await axios.post(`${BASE_URL}/api/booking/search`, {
          uid: userId,
        });

        if (res.data.success) {
          setBookings(res.data.bookings);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // ✅ Handle Cancel Button
  const handleCancelClick = (ticketId) => {
    setSelectedTicket(ticketId);
    setShowConfirm(true);
  };

  // ✅ Confirm cancellation
  const confirmCancel = async () => {
    if (!selectedTicket) return;

    try {
      const res = await axios.post(`${BASE_URL}/api/booking/delete`, {
        tid: selectedTicket,
      });

      if (res.data.success) {
        setBookings((prev) => prev.filter((b) => b.ticketId !== selectedTicket));
        setOverlayMsg("🎟️ Ticket cancelled successfully!");
      } else {
        setOverlayMsg("⚠️ Failed to cancel ticket. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setOverlayMsg("❌ Error cancelling ticket. Server issue.");
    } finally {
      setShowConfirm(false);
      setSelectedTicket(null);

      // hide message after 2s
      setTimeout(() => setOverlayMsg(""), 2000);
    }
  };

  if (loading) {
    return (
      <div className="mybookings-container">
        <h2>Loading your bookings...</h2>
      </div>
    );
  }

  return (
    <div className="mybookings-container">
      <h1>📑 My Bookings</h1>

      {bookings.length === 0 ? (
        <p className="no-bookings">❌ No bookings found</p>
      ) : (
        bookings.map((booking, index) => (
          <div key={index} className="booking-card">
            {/* Train Info */}
            <div className="booking-header">
              <div className="train-info">
                <h2>
                  {booking.trainName.toUpperCase()} (Train ID: {booking.trainId})
                </h2>
                <button
                  className="cancel-button"
                  onClick={() => handleCancelClick(booking.ticketId)}
                >
                  Cancel Ticket
                </button>
              </div>
              <p>
                <strong>Route:</strong> {booking.departureStation.toUpperCase()} →{" "}
                {booking.arrivalStation.toUpperCase()}
              </p>
              <p>
                🗓️ <strong>{booking.departureDate}</strong> at {booking.departureTime} →{" "}
                <strong>{booking.arrivalDate}</strong> at {booking.arrivalTime}
              </p>
              <p>
                ⏱️ Duration: {booking.durationHours}h {booking.durationMinutes}m | Runs On:{" "}
                {booking.runsOn}
              </p>
              <p>
                💰 Total Paid: <strong>₹{booking.price}</strong>
              </p>
              <p>
                🎟️ Ticket ID: <strong>{booking.ticketId}</strong>
              </p>
            </div>

            {/* Passenger Details */}
            <div className="passenger-list">
              <h3>👥 Passengers ({booking.noOfPassengers})</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.passengers.map((p, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{p.name.toUpperCase()}</td>
                      <td>{p.age}</td>
                      <td>{p.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Contact Info */}
            <div className="contact-info">
              <p>
                📧 <strong>{booking.email}</strong>
              </p>
              <p>
                📞 <strong>{booking.contactno}</strong>
              </p>
            </div>
          </div>
        ))
      )}

      {/* ✅ Confirmation Overlay */}
      {showConfirm && (
        <div className="overlay">
          <div className="overlay-card">
            <h2>Are you sure?</h2>
            <p>Do you really want to cancel this ticket?</p>
            <div className="overlay-buttons">
              <button className="yes" onClick={confirmCancel}>
                Yes, Cancel
              </button>
              <button className="no" onClick={() => setShowConfirm(false)}>
                No, Keep it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Status Message Overlay */}
      {overlayMsg && (
        <div className="overlay">
          <div className="overlay-card success">
            <h2>{overlayMsg}</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
