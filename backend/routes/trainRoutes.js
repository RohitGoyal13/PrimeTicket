const express = require("express");
const {allTrains , searchTrains, addTrain, getRoute, deleteTrain, healthCheck} = require("../controllers/trainController");

const router = express.Router();

router.get("/all", allTrains);
router.post("/search", searchTrains);
router.post("/add", addTrain);
router.post("/route", getRoute);
router.post("/delete", deleteTrain);
router.get("/health", healthCheck);

module.exports = router;