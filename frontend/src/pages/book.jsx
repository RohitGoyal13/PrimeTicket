import React, { useState, useEffect } from "react";
import "../styles/book.css";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { v4 as uuidv4 } from "uuid";


function Bookaticket() {
  const [formFields, setFormFields] = useState([
    { id: uuidv4(), name: "", age: "", gender: "" }
  ]);
  const [searchparams] = useSearchParams();
  const navigate = useNavigate();
  const [contactInfo, setContactInfo] = useState({ email: "", contact: "" });
  const [overlay, setOverlay] = useState(false);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const location = useLocation();

  // ✅ Restore train selection from location.state or localStorage
  const {train, price, from, to} = 
    location.state ||
    JSON.parse(localStorage.getItem("selectedTrain")) || {};

  const basePrice =
    location.state?.price ||
    (train ? train.price : 500); // fallback price

  // Save train to localStorage when available
  useEffect(() => {
    if (location.state) {
      const { train, from, to, price } = location.state;
      localStorage.setItem(
        "selectedTrain",
        JSON.stringify({ train, from, to, price })
      );
    }
  }, [location.state]);

  // handle passenger change
  const handleFormChange = (event, index) => {
    const { name, value } = event.target;
    let data = [...formFields];
    data[index][name] = value;
    setFormFields(data);
  };

  // handle contact change
  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  // add passenger
  const addFields = () => {
    setFormFields([...formFields, { id: uuidv4(), name: "", age: "", gender: "" }]);
  };

  // remove passenger
  const removeFields = (index) => {
    let data = [...formFields];
    data.splice(index, 1);
    setFormFields(data);
  };

  // submit form (kept identical)
  const submitForm = (e) => {
    e.preventDefault();
    setError("");

    let userId = sessionStorage.getItem("userID") || 1; // fallback demo

    // quick validations
    if (!contactInfo.email || !contactInfo.contact) {
      setError("Please provide valid contact details");
      return;
    }
    if (formFields.some((f) => !f.name || !f.age || !f.gender)) {
      setError("Please fill all passenger details");
      return;
    }

    // ❌ If train missing, redirect back
    if (!train) {
      alert("No train selected. Please go back and choose a train.");
      navigate("/results");
      return;
    }

    const formData = {
      passengers: formFields.map(({ id, ...rest }) => rest),
      email: contactInfo.email,
      contactno: contactInfo.contact,
      userId: userId,
      routeId: train.routeId || train.routeid,
      trainId: train.trainId || train.trainid,
      sourceStation: from || train?.departure || "Unknown",
      destinationStation: to || train?.arrival || "Unknown",
      price: (price || basePrice || 500) * formFields.length,
    };

    console.log("Form Data:", formData);

    setRedirecting(true);

    setTimeout(() => {
      navigate("/payment", { state: { bookingData: formData } });
    }, 2000);
  };


  // UI helpers (no logic change)
  const passengerCount = formFields.length;
  const computedPrice = (price || basePrice || 500) * passengerCount;

  return (
    <div className="bookaticket">
      <div className="book-top">
        <div className="selected-train-card">
          <div className="train-row">
            <div className="train-title">
              <h3>
               {(train?.trainName || train?.trainname || "Selected Train").toUpperCase()}</h3>
              <p className="small muted">{train?.trainid ? `Train ID: ${train.trainid}` : ""}</p>
            </div>
            <div className="route">
              <div className="station">{from || train?.departure || "Src"}</div>
              <div className="arrow">→</div>
              <div className="station">{to || train?.arrival || "Dst"}</div>
            </div>
            <div className="date-price">
              <div className="date">{location.state?.date || new Date().toISOString().slice(0,10)}</div>
              <div className="price">₹{computedPrice.toLocaleString()}</div>
            </div>
          </div>
          <div className="train-meta">
            <span className="pill">{passengerCount} Passenger{passengerCount>1?'s':''}</span>
            <span className="pill">{train?.remainingSeats ?? "—"} seats left</span>
            <span className="pill">Class: General</span>
          </div>
        </div>
      </div>

      <h2>Passenger Details</h2>
      <div>
        <form onSubmit={submitForm}>
          <div className="repeat-passenger-container">
            {formFields.map((form, index) => (
              <div key={form.id} className="passenger-card">
                <div className="passenger-header">
                  <h5>Passenger {index + 1}</h5>
                  {formFields.length > 1 && (
                    <Button
                      color="warning"
                      variant="outlined"
                      onClick={() => removeFields(index)}
                      size="small"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="repeat-passenger-flex">
                  <div className="repeat-passenger-flex-child">
                    <TextField
                      sx={{ width: "100%" }}
                      required
                      name="name"
                      label="Name"
                      value={form.name}
                      onChange={(event) => handleFormChange(event, index)}
                    />
                  </div>
                  <div className="repeat-passenger-flex-child">
                    <TextField
                      sx={{ width: "100%" }}
                      required
                      name="age"
                      type="number"
                      label="Age"
                      value={form.age}
                      onChange={(event) => handleFormChange(event, index)}
                    />
                  </div>
                  <div className="repeat-passenger-flex-child">
                    <Select
                      sx={{ width: "100%" }}
                      required
                      name="gender"
                      value={form.gender}
                      displayEmpty
                      onChange={(event) => handleFormChange(event, index)}
                    >
                      <MenuItem value={""} disabled>
                        Gender
                      </MenuItem>
                      <MenuItem value={"M"}>Male</MenuItem>
                      <MenuItem value={"F"}>Female</MenuItem>
                      <MenuItem value={"O"}>Others</MenuItem>
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            <div className="add-passenger-row">
              <Button onClick={addFields} color="success" variant="contained">
                + Add Passenger
              </Button>

              <div className="fare-summary">
                <div>
                  <div className="small muted">Fare per passenger</div>
                  <div className="big">₹{(price || basePrice || 500).toLocaleString()}</div>
                </div>
                <div>
                  <div className="small muted">Total (incl fees)</div>
                  <div className="big total">₹{computedPrice.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div>
              <h4>Contact Details</h4>
            </div>
            <div className="contact-details-flex">
              <div>
                <TextField
                  sx={{ width: 319 }}
                  required
                  name="email"
                  label="Email"
                  type="email"
                  value={contactInfo.email}
                  onChange={handleContactChange}
                />
              </div>
              <div>
                <TextField
                  sx={{ width: 319 }}
                  required
                  name="contact"
                  label="Contact No"
                  type="tel"
                  value={contactInfo.contact}
                  onChange={handleContactChange}
                />
              </div>
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="pay-row">
            <Button
              sx={{ backgroundColor: "#4CAF50" }}
              type="submit"
              variant="contained"
            >
              Pay and Book Ticket — ₹{computedPrice.toLocaleString()}
            </Button>

            <Button
              sx={{ marginLeft: 2 }}
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              ← Back
            </Button>
          </div>
        </form>
      </div>

      {/* Redirect Overlay */}
      {redirecting && (
        <div className="overlay">
          <div className="overlay-card">
            <h2>💳 Redirecting you to Payment Page...</h2>
            <p>Please wait while we set things up.</p>
            <div className="loader" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookaticket;
