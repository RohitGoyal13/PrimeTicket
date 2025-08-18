import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { FaTrain } from "react-icons/fa";   // Train icon
import { MdSwapHoriz } from "react-icons/md"; // Swap icon
import { FaRegCalendarAlt } from "react-icons/fa"; // Calendar icon


const images = [
  "images/train1.jpg",
  "images/train2.jpg",
  "images/train3.jpg",
  "images/train4.jpg",
  "images/train5.jpg",
];

function Dashboard() {
  const [current, setCurrent] = useState(0);

  // Auto scroll images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      {/* Navbar */}
      <header className="navbar">
        <h2 className="logo">🌍PrimeTicket</h2>
        <nav>
          <a href="#">Flights</a>
          <a href="#">Hotels</a>
          <a href="#">Support</a>
          <a href="#">Trips</a>
          <a href="#">Wallet</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="booking-box">
          <div className="booking-box-title">
          <h1>Train Ticket Booking</h1>
          <p>Easy IRCTC Login</p>
          </div>

          <div className="search-form">
             <div className = "source">
              <FaTrain size={50} color="green" />
              <div className = "label-container cursor-pointer">
                <label for="source-station">From</label>
                <span>NDLS  - Delhi</span>
              </div>
             </div>

              <div className = "destination">
              <FaTrain size={50} color="green" />
              <div className = "label-container cursor-pointer">
                <label for="source-station">From</label>
                <span>NGP - Nagpur</span>
              </div>
             </div>

             <div className = "date-container">
              <FaRegCalendarAlt size={50} color="green" />
              <div className = "label-container cursor-pointer">
              <label for="source-station">Departure Date</label>
              <input type="date" name="" id="" />
              </div>
             </div>
             <div className="train-search">
                <div className = "train-search-button">
                 <p>Search</p>
                </div>
             </div>
          </div>
        </div>

        {/* Image Carousel */}
        <div className="carousel">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`slide-${index}`}
              className={index === current ? "active" : ""}
            />
          ))}

          <div className="dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={index === current ? "dot active" : "dot"}
                onClick={() => setCurrent(index)}
              ></span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Book Section */}
      <section className="features">
        <h2>Why Book IRCTC Train Ticket on ConfirmTkt</h2>
        <div className="grid">
          <div className="card">✅ Get Train Tickets</div>
          <div className="card">💳 UPI Enabled Secured Payment</div>
          <div className="card">❌ Free Cancellation</div>
          <div className="card">📞 24x7 Support</div>
          <div className="card">💰 Instant Refund</div>
          <div className="card">🚉 Live Train Status</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Trusted by 10 Crore+ Users | Highest rated train booking app</p>
        <p>⭐ 4.7 (8,16,434 ratings)</p>
        <p>Download on <b>Google Play</b> | <b>App Store</b></p>
        <p>© 2025 ConfirmTkt Clone</p>
      </footer>
    </div>
  );
}

export default Dashboard;