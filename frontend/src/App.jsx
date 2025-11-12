import "./App.css";
import {BrowserRouter as Router,Routes, Route } from "react-router-dom";
import Results from "./pages/results.jsx"
import Dashboard from "./pages/dashboard.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Book from "./pages/book.jsx";
import Payment from "./pages/payment.jsx";
import MyBookings from "./pages/mybookings.jsx";
import AddTrain from "./pages/addtrain.jsx";
import DeleteTrain from "./pages/deletetrain.jsx";

function App() {
  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/results" element={<Results />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book" element ={<Book/>}></Route>
        <Route path="/payment" element={<Payment/>}></Route>
        <Route path="/mybookings" element={<MyBookings/>}></Route>
        <Route path="/addtrain" element={<AddTrain/>}></Route>
        <Route path="/deletetrain" element={<DeleteTrain/>}></Route>
      </Routes>
      </Router>
    </>
  );
}

export default App;