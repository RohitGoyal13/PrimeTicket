const express = require("express");
const {allTrains , searchTrains} = require("../controllers/trainController");

const router = express.Router();



router.get("/all", allTrains);
router.post("/search", searchTrains);


module.exports = router;