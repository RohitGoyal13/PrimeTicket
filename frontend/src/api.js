const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://primeticket.onrender.com";

export default BASE_URL;
