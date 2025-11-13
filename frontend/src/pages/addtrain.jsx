import React, { useState } from "react";
import axios from "axios";
import "../styles/addtrain.css";
import BASE_URL from "../api";

function AddTrain(){
  const [trainName, setTrainName] = useState("");
  const [runson, setRunson] = useState("");
  const [totalseats, setTotalSeats] = useState("");
  const [starttime, setStartTime] = useState("");
  const [routes, setRoutes] = useState([{ station: "", timeFromStart: "" }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Add a new route row
  const addRoute = () => {
    setRoutes([...routes, { station: "", timeFromStart: "" }]);
  };

  // 🔹 Remove a route row
  const removeRoute = (index) => {
    const updated = routes.filter((_, i) => i !== index);
    setRoutes(updated);
  };

  // 🔹 Update station/time in route
  const handleRouteChange = (index, field, value) => {
    const updated = [...routes];
    updated[index][field] = value;
    setRoutes(updated);
  };

  // 🔹 Submit train data
const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");
  setLoading(true);

  // Basic field validation
  if (!trainName || !runson || !totalseats || !starttime) {
    setMessage("❌ Please fill all required fields!");
    setLoading(false);
    return;
  }

  // Route validation
  if (routes.length < 2) {
    setMessage("⚠️ Please add at least a source and destination station!");
    setLoading(false);
    return;
  }

  // Empty station/time validation
  for (let r of routes) {
    if (!r.station.trim() || !r.timeFromStart) {
      setMessage("⚠️ Please fill all station names and times!");
      setLoading(false);
      return;
    }
  }

  try {
    const res = await axios.post(
      `${BASE_URL}/api/trains/add`, // your backend URL
      {
        trainName,
        runson,
        totalseats: parseInt(totalseats),
        starttime,
        routes: routes.map((r) => ({
          station: r.station.trim(),
          timeFromStart: parseInt(r.timeFromStart),
        })),
      }
    );

    if (res.data.success) {
      setMessage("✅ Train added successfully!");
      setTrainName("");
      setRunson("");
      setTotalSeats("");
      setStartTime("");
      setRoutes([{ station: "", timeFromStart: "" }]);
    } else {
      setMessage("⚠️ " + res.data.message);
    }
  } catch (err) {
    console.error(err);
    setMessage("❌ Server error! Check console or backend logs.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="add-train-container">
      <h2>Add New Train</h2>

      <form className="train-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Train Name:</label>
          <input
            type="text"
            value={trainName}
            onChange={(e) => setTrainName(e.target.value)}
            placeholder="e.g., Ravi Express"
          />
        </div>

        <div className="form-group">
          <label>Runs On (day):</label>
          <input
            type="text"
            value={runson}
            onChange={(e) => setRunson(e.target.value)}
            placeholder="e.g., mon"
          />
        </div>

        <div className="form-group">
          <label>Total Seats:</label>
          <input
            type="number"
            value={totalseats}
            onChange={(e) => setTotalSeats(e.target.value)}
            placeholder="e.g., 720"
          />
        </div>

        <div className="form-group">
          <label>Start Time:</label>
          <input
            type="time"
            value={starttime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <h3>Train Route Stations</h3>
        {routes.map((r, index) => (
          <div key={index} className="route-row">
            <input
              type="text"
              placeholder="Station name"
              value={r.station}
              onChange={(e) =>
                handleRouteChange(index, "station", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Time from start (minutes)"
              value={r.timeFromStart}
              onChange={(e) =>
                handleRouteChange(index, "timeFromStart", e.target.value)
              }
            />
            {routes.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeRoute(index)}
              >
                ✖
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addRoute} className="add-route-btn">
          ➕ Add Station
        </button>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Train"}
        </button>
      </form>

      {message && <p className="status-msg">{message}</p>}
    </div>
  );
};

export default AddTrain;
