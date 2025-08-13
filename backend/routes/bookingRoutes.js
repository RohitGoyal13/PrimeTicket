const express = require("express");
const { bookTicket, searchTicket, allTickets, deleteTicket } = require("../controllers/bookingController");

const router = express.Router();


router.post("/book", bookTicket);
router.post("/search", searchTicket);
router.get("/all", allTickets);
router.post("/delete", deleteTicket);

module.exports = router;