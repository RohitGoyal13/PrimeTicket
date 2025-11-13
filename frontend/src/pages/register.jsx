import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";
import BASE_URL from "../api";
import { Link } from "react-router-dom";


const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");

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
      const url =
        role === "admin"
          ? `${BASE_URL}/api/admin/register`
          : `${BASE_URL}/api/auth/register`;

      let bodyData;
      if (role === "admin") {
        bodyData = {
          email: formData.email,
          password: formData.password,
        };
      } else {
        bodyData = { ...formData };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Registration failed");
        return;
      }

      setOverlay(true);
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
              <Link
              to="/login"
              style={{ color: "rgb(71, 255, 86)", fontWeight: "bold" }}
            >
              Login
            </Link>

          </span>
        </div>

        <div className="right">
          <h1>Register</h1>

          {/* 🔹 Role Toggle */}
          <div className="role-toggle">
            <button
              type="button"
              className={role === "user" ? "active" : ""}
              onClick={() => setRole("user")}
            >
              User
            </button>
            <button
              type="button"
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {role === "user" ? (
              <>
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
              </>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Admin Email"
                  name="email"
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  placeholder="Admin Password"
                  name="password"
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {error && <p className="error">{error}</p>}
            <button type="submit">Register</button>
          </form>
        </div>
      </div>

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
