import "./App.css";
import {BrowserRouter as Router,Routes, Route } from "react-router-dom";
import Results from "./pages/results.jsx"
import Dashboard from "./pages/dashboard.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";

function App() {
  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/results" element={<Results />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      </Router>
    </>
  );
}

export default App;