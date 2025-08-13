const express = require("express");
const {allTrains , searchTrains, addTrain, getRoute} = require("../controllers/trainController");

const router = express.Router();



router.get("/all", allTrains);
router.post("/search", searchTrains);
router.post("/add", addTrain);
router.post("/route", getRoute);

module.exports = router;