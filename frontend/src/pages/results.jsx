import { useEffect, useState } from "react";
import "../styles/results.css";
import "../styles/dashboard.css";

function Results() {
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("trainResults");
    if (stored) {
      setTrains(JSON.parse(stored));
      console.log("Loaded trains:", JSON.parse(stored));
    }
  }, []);

  const capitalizeWords = (str) =>
  str
    .toLowerCase()
    .split(/[\s-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/\s-\s?/g, "-"); // keep hyphen formatting


  return (
    <div className="results-page">
         <header className="navbar">
        <h2 className="logo"><img src="images/applogo.png" alt="" className="applogo" /></h2>
        <nav>
          <a href="#">Flights</a>
          <a href="#">Hotels</a>
          <a href="#">Support</a>
          <a href="#">Trips</a>
          <a href="#">Wallet</a>
        </nav>
      </header>

      <section className="results-header">
        <h1></h1>
      </section>

      <div className="results-container">
        {trains.length === 0 ? (
          <p className="no-trains">❌ No trains found for your search</p>
        ) : (
          trains.map((train, index) => (
            <div key={index} className="train-card">
              <div className="train-card-header">
                {/* Train name in Title Case */}
                <h2>{capitalizeWords(train.trainName)}</h2>
                <span className="train-id">#{train.trainid}</span>
              </div>

              <div className="train-info">
                <p>
                  {/* Cities in Title Case */}
                  <strong>{capitalizeWords(train.departure)}</strong> ➝{" "}
                  <strong>{capitalizeWords(train.arrival)}</strong>
                </p>
                <p>
                  ⏱ Departure: {train.departureTime} | Arrival:{" "}
                  {train.arrivalTime}
                </p>
                <p>🪑 Seats Left: {train.remainingSeats}</p>
              </div>

              <div className="train-card-footer">
                <button className="book-btn">Book</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Results;
