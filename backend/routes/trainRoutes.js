const express = require("express");
const {allTrains , searchTrains, addTrain} = require("../controllers/trainController");

const router = express.Router();



router.get("/all", allTrains);
router.post("/search", searchTrains);
router.post("/add", addTrain);


module.exports = router;