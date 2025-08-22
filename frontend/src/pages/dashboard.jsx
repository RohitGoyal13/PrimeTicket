import { useState, useEffect, useMemo, useRef } from "react";
import "../styles/dashboard.css";
import { FaTrain } from "react-icons/fa";
import { MdSwapHoriz } from "react-icons/md";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import axios from "axios";

const images = [
  "images/train1.jpg",
  "images/train2.jpg",
  "images/train3.jpg",
  "images/train4.jpg",
  "images/train5.jpg",
];

const STATIONS = [
  {   name: "Delhi" },
  {   name: "Nagpur" },
  {   name: "Lucknow" },
  {   name: "Kanpur" },
  {   name: "Bhopal" },
  {   name: "Mumbai" },
  {   name: "Howrah" },
];

const API_BASE = "http://localhost:5050";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function Dashboard() {
  const [current, setCurrent] = useState(0);

  // search state
  const [from, setFrom] = useState({ name: "Delhi" });
  const [to, setTo] = useState({ name: "Nagpur" });
  const [date, setDate] = useState(getToday());

  // station picker modal
  const [openPicker, setOpenPicker] = useState(null); // "from" | "to" | null
  const [query, setQuery] = useState("");
  const cardRef = useRef(null);

  const filteredStations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STATIONS.slice(0, 25);
    return STATIONS.filter(
      s => s.name.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [query]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onKey(e){ if (e.key === "Escape") setOpenPicker(null); }
    function onDoc(e){
      if (openPicker && cardRef.current && !cardRef.current.contains(e.target)) setOpenPicker(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [openPicker]);

  function swapStations() {
    setFrom(to);
    setTo(from);
  }

  async function onSearch() {
    if (!from?.name || !to?.name || !date) {
      alert("Please fill all the fields");
      return;
    }
    try {
      const payload = {
        departure: from.name,
        arrival: to.name,
        date,
      };

      console.log("Payload:", payload);

      const res = await axios.post(`${API_BASE}/api/trains/search`, payload);

    console.table(JSON.parse(JSON.stringify(res.data.data)));

       console.log("✅ Full API response:", res.data);

    // If train list is in res.data.data
    if (res.data?.data) {
      console.log("🚆 Train list:", res.data.data);
    } else {
      console.log("⚠️ No train list found in response");
    }

      

      localStorage.setItem("trainResults", JSON.stringify(res.data?.data || []));

      setTimeout(() => {
        window.location.href = `/results?from=${from.name}&to=${to.name}&date=${date}`;  
      }, );
    } 
    catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Search failed");
    }
  }

  return (
    <div className="page">
      {/* Navbar */}
      <header className="navbar">
       <div className="logo"> <h2 ><img src="images/applogo.png" alt="" className="applogo" /></h2></div>
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
            {/* FROM */}
            <div className="source" onClick={() => { setOpenPicker("from"); setQuery(""); }}>
              <FaTrain size={50} color="green" />
              <div className="label-container cursor-pointer">
                <label htmlFor="source-station">From</label>
                <span>{from.name}</span>
              </div>
            </div>

            {/* SWAP */}
            <button className="swap-btn" type="button" onClick={swapStations} aria-label="Swap">
              <MdSwapHoriz size={28} />
            </button>

            {/* TO */}
            <div className="destination" onClick={() => { setOpenPicker("to"); setQuery(""); }}>
              <FaTrain size={50} color="green" />
              <div className="label-container cursor-pointer">
                <label htmlFor="dest-station">To</label>
                <span>{to.name}</span>
              </div>
            </div>

            {/* DATE */}
            <div className="date-container">
              <FaRegCalendarAlt size={50} color="green" />
              <div className="label-container cursor-pointer">
                <label htmlFor="journey-date">Departure Date</label>
                <input
                  id="journey-date"
                  type="date"
                  value={date}
                  min={getToday()}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* SEARCH */}
            <div className="train-search">
              <button className="train-search-button" type="button" onClick={onSearch}>
                Search
              </button>
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
        <h2>Why Book IRCTC Train Ticket on PrimeTicket</h2>
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
        <div className="footer-top">
          <div className="footer-section">
            <h3>PrimeTicket</h3>
            <p>Your trusted partner for IRCTC train ticket booking, live train status, and hassle-free travel planning.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Book Train Tickets</a></li>
              <li><a href="#">Check PNR Status</a></li>
              <li><a href="#">Live Train Status</a></li>
              <li><a href="#">Cancel Ticket</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="socials">
              <a href="#"><FaFacebook size={22} /></a>
              <a href="#"><FaTwitter size={22} /></a>
              <a href="#"><FaInstagram size={22} /></a>
              <a href="#"><FaLinkedin size={22} /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 PrimeTicket. All Rights Reserved.</p>
          <p>Made with ❤️ in India | Trusted by 10 Crore+ users</p>
        </div>
      </footer>

      {/* Station Picker Modal */}
      {openPicker && (
        <div className="picker-overlay">
          <div className="picker-card" ref={cardRef}>
            <div className="picker-header">
              <input
                autoFocus
                placeholder={`Search ${openPicker === "from" ? "origin" : "destination"} (name)`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="picker-close" onClick={() => setOpenPicker(null)}>✕</button>
            </div>

            <div className="picker-list">
              {filteredStations.map((s) => (
                <div
                  key={s.name}
                  className="picker-item"
                  onClick={() => {
                    if (openPicker === "from") setFrom(s);
                    else setTo(s);
                    setOpenPicker(null);
                  }}
                >
                  <div className="name">{s.name}</div>
                </div>
              ))}
              {filteredStations.length === 0 && <div className="empty">No matches</div>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
