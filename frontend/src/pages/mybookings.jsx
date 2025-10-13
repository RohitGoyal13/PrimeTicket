import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/mybookings.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = sessionStorage.getItem("userID") || 1;

    console.log("User ID:", userId);

    const fetchBookings = async () => {
      try {
        const res = await axios.post("http://localhost:5050/api/booking/search", {
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
              <h2>{booking.trainName.toUpperCase()} (Train ID: {booking.trainId})</h2>
            <div><button className="cancel-button">Cancel Ticket</button></div>
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
    </div>
  );
}

export default MyBookings;
