import "./App.css";
import {BrowserRouter as Router,Routes, Route } from "react-router-dom";
import Results from "./pages/results.jsx"
import Dashboard from "./pages/dashboard.jsx";

function App() {
  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/results" element={<Results />} />
      </Routes>
      </Router>
    </>
  );
}

export default App;