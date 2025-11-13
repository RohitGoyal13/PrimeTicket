import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import "../styles/results.css";
import "../styles/dashboard.css";
import BASE_URL from "../api";

function Results() {
  const [trains, setTrains] = useState([]);
  const [showOverlay,setShowOverlay] = useState(false);
  
  const navigate = useNavigate();


  const location = useLocation();
  const { from, to, date, results } = location.state || {};


  console.log("From:", from, "To:", to, "Date:", date);


  useEffect(() => {
  if (results) {
    setTrains(results);
  } else {
    const stored = localStorage.getItem("trainResults");
    if (stored) setTrains(JSON.parse(stored));
  }
}, [results]);


  const capitalizeWords = (str) => 
  str
    .toLowerCase()
    .split(/[\s-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/\s-\s?/g, "-"); // keep hyphen formatting
  

  const handlebook = (train) => {
    const token = sessionStorage.getItem("token");
    if(token){
      navigate("/book", {state : {
        train,
         price: train.price,
         from,
         to,
      },
    });
    } else{
      setShowOverlay(true);
    }
  }

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
        <h1>Available Trains</h1>
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
                <span className="train-id">Train ID: {train.trainid}</span>
              </div>

              <div className="train-info">
                <div className="train-info-main">
                  <div>
                    <div><strong>{capitalizeWords(train.departure)}, {train.departureTime} </strong></div>
                    <p>{train.departureDate}</p>
                  </div>
                  <div className="train-info-duration">
                    <div><strong>⏱{train.durationHours}h {train.durationMinutes}m</strong></div>
                    <div><strong>Runs On: {capitalizeWords(train.runsOn)}</strong></div>
                  </div>
                  <div>
                    <div><strong>{train.arrivalTime}, {capitalizeWords(train.arrival)}</strong></div>
                    <p className="train-info-main-p">{train.arrivalDate}</p>
                  </div>
                </div>
                </div>


              <div className="train-card-footer">
                <div className="seats-container"><p className="seats-left"> Seats Left: {train.remainingSeats}</p></div>
                <button className="book-btn" onClick={ () => handlebook(train)}>Book Ticket</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showOverlay && (
        <div className="auth-overlay">
          <div className="auth-card">
            <div className="auth-card-header">
            <h2>Login or Signup Required</h2>
             <button
              className="close-btn"
              onClick={() => setShowOverlay(false)}
            >
              ✖
            </button>
            </div>
            <div>
             <div class= "auth-card-middle">
             <img src= "/images/overlay.svg"></img>
              <p>
              Quick booking with personalized recommendations
              </p>
              </div>
               <div class= "auth-card-middle">
             <img src= "/images/overlay.svg"></img>
              <p>
              Free Cancellations. Customer support
              </p>
              </div>
               <div class= "auth-card-middle">
             <img src= "/images/overlay.svg"></img>
              <p>
              Access saved passengers
              </p>
              </div>
               <div class= "auth-card-middle">
             <img src= "/images/overlay.svg"></img>
              <p>
              Get confirmed ticket on waitlisted trains
              </p>
              </div>
               <div class= "auth-card-middle">
             <img src= "/images/overlay.svg"></img>
              <p>
              Fast-tatkal booking with one-click
              </p>
              </div>
            </div>
            <div className="auth-buttons">
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/register")}>Signup</button>
            </div>
            </div>
          </div>
      )}
    </div>
  );
}

export default Results;
