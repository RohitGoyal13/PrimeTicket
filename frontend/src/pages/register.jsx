import "../styles/register.css";


const Register = () => {

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Welcome to PrimeTicket</h1>
          <p>
            Book your train tickets easily and securely with PrimeTicket.
            Sign in to continue your journey, save your favorite routes,
            manage upcoming trips, and enjoy a safe, reliable travel experience every time.
          </p>
          <span>
            Already have an account?{" "}
            <a href="/login" style={{ color: "rgb(71, 255, 86)", fontWeight: "bold" }}>
                Login
            </a>
            </span>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form>
            <input type="text" placeholder="Username" name= "username"  />
            <input type="email" placeholder="Email" name= "email"  />
            <input type="password" placeholder="Password" name= "password" />
            <input type="text" placeholder="Name" name= "name" />
            <button>Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
