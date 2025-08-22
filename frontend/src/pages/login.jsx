import "../styles/login.css";

const Login = () => {
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
            <a href="/register" style={{ color: "rgb(71, 255, 86)", fontWeight: "bold" }}>
                Signup
            </a>
            </span>


          {/* <Link to="/register">
            <button>Create Account</button>
          </Link> */}
        </div>
        <div className="right">
          <h1>Login</h1>
          <form>
            <input type="text" placeholder="Enter Your Email" name="email" />
            <input type="password" placeholder="Enter Your Password" name="password" />
            <button>Login</button>   {/* ✅ Updated */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
