import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import BASE_URL from "../api";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const [overlay, setOverlay] = useState(false);
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  // for forgot-password flow
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // new overlays for token + password success
  const [tokenOverlay, setTokenOverlay] = useState("");
  const [passwordOverlay, setPasswordOverlay] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 🔹 Login handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url =
        role === "admin"
          ? `${BASE_URL}/api/admin/login`
          : `${BASE_URL}/api/auth/login`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userID", data.userid || data.id);
      sessionStorage.setItem("role", role);

      setOverlay(true);

      setTimeout(() => {
        navigate(role === "admin" ? "/admin-dashboard" : "/results");
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  // 🔹 Forgot password handler
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setError("Please enter your email");
      return;
    }
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgotPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, role })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to send reset token");
      } else {
        // Show overlay instead of alert
        setTokenOverlay(data.token);
        setResetMode(true);
      }
    } catch (err) {
      setError("Error sending reset request.");
    }
  };

  // 🔹 Reset password handler
  const handleResetPassword = async () => {
    if (!resetToken || !newPassword) {
      setError("Please fill all fields");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/auth/resetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword, role })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
      } else {
        // show nice overlay instead of alert
        setPasswordOverlay(true);
        setTimeout(() => {
          setForgotMode(false);
          setResetMode(false);
          setPasswordOverlay(false);
        }, 2000);
      }
    } catch (err) {
      setError("Error resetting password.");
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
          <h1>{forgotMode ? "Forgot Password" : "Login"}</h1>

          {/* 🔹 Role toggle */}
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

          {!forgotMode && (
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

              <p
                onClick={() => setForgotMode(true)}
                className="forgot-link"
              >
                Forgot password?
              </p>
            </form>
          )}

          {/* 🔹 Forgot Password Form */}
          {forgotMode && !resetMode && (
            <div className="forgot-form">
              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              {error && <p className="error">{error}</p>}
              <button type="button" onClick={handleForgotPassword}>
                Send Reset Token
              </button>
              <p className="back-link" onClick={() => setForgotMode(false)}>
                ← Back to Login
              </p>
            </div>
          )}

          {/* 🔹 Reset Password Form */}
          {forgotMode && resetMode && (
            <div className="reset-form">
              <input
                type="text"
                placeholder="Enter reset token"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
              />
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {error && <p className="error">{error}</p>}
              <button type="button" onClick={handleResetPassword}>
                Reset Password
              </button>
              <p className="back-link" onClick={() => setForgotMode(false)}>
                ← Back to Login
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Login Success Overlay */}
      {overlay && (
        <div className="overlay">
          <div className="overlay-card">
            <h2>✅ Login Successful!</h2>
            <p>
              Redirecting you to {role === "admin" ? "Admin Dashboard" : "Bookings"}...
            </p>
          </div>
        </div>
      )}

      {/* 🎟️ Reset Token Overlay */}
      {tokenOverlay && (
        <div className="overlay">
          <div className="overlay-card token-card">
            <h2>🔐 Reset Token Generated!</h2>
            <p className="token-value">{tokenOverlay}</p>
            <p>Use this token to reset your password within 15 minutes.</p>
            <button onClick={() => setTokenOverlay("")}>Got it</button>
          </div>
        </div>
      )}

      {/* 🔑 Password Reset Success Overlay */}
      {passwordOverlay && (
        <div className="overlay">
          <div className="overlay-card success-card">
            <h2>✅ Password Reset Successful!</h2>
            <p>You can now log in with your new password.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
