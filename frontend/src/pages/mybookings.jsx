import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/mybookings.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Use fallback userId for demo
    const userId = localStorage.getItem("userID") || 1;

    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5050/api/bookings/user/${userId}?`
        );
        setBookings(res.data);
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
            <div className="booking-header">
              <h2>🚆 Train ID: {booking.trainId}</h2>
              <p>
                From <strong>{booking.sourceStation}</strong> → To{" "}
                <strong>{booking.destinationStation}</strong>
              </p>
              <p>Total Paid: ₹{booking.price}</p>
            </div>

            <div className="passenger-list">
              <h3>👥 Passengers</h3>
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
                      <td>{p.name}</td>
                      <td>{p.age}</td>
                      <td>{p.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="contact-info">
              <p>
                📧 Email: <strong>{booking.email}</strong>
              </p>
              <p>
                📞 Contact: <strong>{booking.contactno}</strong>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyBookings;
