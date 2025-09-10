import React, { useState } from "react";
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

  // submit form
const submitForm = (e) => {
  e.preventDefault();
  setError("");

  let userId = sessionStorage.getItem("userID");

  // quick validations
  if (!contactInfo.email || !contactInfo.contact) {
    setError("Please provide valid contact details");
    return;
  }
  if (formFields.some((f) => !f.name || !f.age || !f.gender)) {
    setError("Please fill all passenger details");
    return;
  }

  const train = location.state?.train;
  const basePrice = location.state?.price;

  let formData = {
    passengers: formFields.map(({ id, ...rest }) => rest), // remove id before sending
    email: contactInfo.email,
    contactno: contactInfo.contact,
    userId: userId,
    routeId: train.routeId,        // from state
    trainId: train.trainid, 
    sourceStation: searchparams.get("departure"),
    destinationStation: searchparams.get("arrival"),
    price: basePrice * formFields.length
  };

  // 👉 Show redirect overlay
  setRedirecting(true);

  // Navigate after 2s with formData
  setTimeout(() => {
    navigate("/payment", { state: { bookingData: formData } });
  }, 2000);
};


  return (
    <div className="bookaticket">
      <h2>Passenger Details</h2>
      <div>
        <form onSubmit={submitForm}>
          <div className="repeat-passenger-container">
            {formFields.map((form, index) => (
              <div key={form.id}>
                <div>
                  <h5>Passenger</h5>
                </div>
                <div className="repeat-passenger-flex">
                  <div className="repeat-passenger-flex-child">
                    <TextField
                      sx={{ width: 319 }}
                      required
                      name="name"
                      label="Name"
                      value={form.name}
                      onChange={(event) => handleFormChange(event, index)}
                    />
                  </div>
                  <div className="repeat-passenger-flex-child">
                    <TextField
                      sx={{ width: 319 }}
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
                      sx={{ width: 319 }}
                      required
                      name="gender"
                      value={form.gender}
                      label="Gender"
                      onChange={(event) => handleFormChange(event, index)}
                    >
                      <MenuItem value={"M"}>Male</MenuItem>
                      <MenuItem value={"F"}>Female</MenuItem>
                      <MenuItem value={"O"}>Others</MenuItem>
                    </Select>
                  </div>
                  <div className="repeat-passenger-flex-child">
                    {formFields.length > 1 && (
                      <Button
                        color="warning"
                        variant="contained"
                        onClick={() => removeFields(index)}
                      >
                        Remove Passenger
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div>
              <Button onClick={addFields} color="success" variant="contained">
                Add Passenger
              </Button>
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

          <Button
            sx={{ backgroundColor: "#4CAF50" }}
            type="submit"
            variant="contained"
          >
            Pay and Book Ticket
          </Button>
        </form>
      </div>

      {/* ✅ Overlay */}
     {/* Redirect Overlay */}
      {redirecting && (
        <div className="overlay">
          <div className="overlay-card">
            <h2>💳 Redirecting you to Payment Page...</h2>
            <p>Please wait while we set things up.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookaticket;
