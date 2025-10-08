import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
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
      const res = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ Save JWT token to localStorage (optional but recommended)
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userID", data.userid);

      console.log(`Userid : ${data.userid}`);

      // ✅ Show success overlay
      setOverlay(true);

      // Redirect after 2 sec
      setTimeout(() => {
        navigate("/results");
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Welcome to PrimeTicket</h1>
          <p>
            Book your train tickets easily and securely with PrimeTicket.
            Sign in to continue your journey, save your favorite routes,
            manage upcoming trips, and enjoy a safe, reliable travel experience every time.
          </p>
          <span>
            Don't have an account?{" "}
            <a
              href="/register"
              style={{ color: "rgb(71, 255, 86)", fontWeight: "bold" }}
            >
              Signup
            </a>
          </span>
        </div>

        <div className="right">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter Your Email"
              name="email"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Enter Your Password"
              name="password"
              onChange={handleChange}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Login</button>
          </form>
        </div>
      </div>

      {/* ✅ Overlay */}
      {overlay && (
        <div className="overlay">
          <div className="overlay-card">
            <h2>✅ Login Successful!</h2>
            <p>Redirecting you to booking...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
