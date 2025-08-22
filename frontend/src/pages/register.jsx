import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactno: "",
    password: ""
  });

  const [overlay, setOverlay] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5050/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Registration failed");
        return;
      }

      // ✅ Show success overlay
      setOverlay(true);

      // redirect after 2 sec
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Welcome to PrimeTicket</h1>
          <p>
            Book your train tickets easily and securely with PrimeTicket.
            Sign in to continue your journey, save your favorite routes,
            manage upcoming trips, and enjoy safe, reliable travel every time.
          </p>
          <span>
            Already have an account?{" "}
            <a
              href="/login"
              style={{ color: "rgb(71, 255, 86)", fontWeight: "bold" }}
            >
              Login
            </a>
          </span>
        </div>

        <div className="right">
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              onChange={handleChange}
              required
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Contact Number"
              name="contactno"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Register</button>
          </form>
        </div>
      </div>

      {/* ✅ Overlay */}
      {overlay && (
        <div className="overlay">
          <div className="overlay-card">
            <h2>🎉 Signup Successful!</h2>
            <p>Redirecting you to login...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
