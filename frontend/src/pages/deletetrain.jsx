import React, { useState } from "react";
import axios from "axios";
import "../styles/deletetrain.css";

function DeleteTrain() {
  const [trainId, setTrainId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5050/api/trains/delete", {
        tid: parseInt(trainId),
      });

        if (res.data.success) {
    setMessage(`✅ ${res.data.message}`);
    setTrainId("");
    } else {
    setMessage(`⚠️ ${res.data.message}`);
    }

    } catch (err) {
      console.error(err);
      setMessage("❌ Server error! Please check backend logs.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (!trainId) {
      setMessage("⚠️ Please enter the Train ID to delete.");
      return;
    }

    // open custom modal
    setShowConfirm(true);
  };

  return (
    <div className="delete-page-wrapper">
      <div className="delete-train-container">
        <h2>Delete Train</h2>

        <form className="delete-train-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Train ID:</label>
            <input
              type="number"
              placeholder="Enter Train ID"
              value={trainId}
              onChange={(e) => setTrainId(e.target.value)}
            />
          </div>

          <button type="submit" className="delete-btn" disabled={loading}>
            {loading ? "Deleting..." : "Delete Train"}
          </button>
        </form>

        {message && <p className="status-msg">{message}</p>}
      </div>

      {/* 🔹 Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete Train ID{" "}
              <strong>{trainId}</strong>?<br />
              This action cannot be undone.
            </p>
            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteTrain;
