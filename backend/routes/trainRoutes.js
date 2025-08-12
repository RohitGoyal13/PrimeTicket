const express = require("express");
const {allTrains} = require("../controllers/trainController");

const router = express.Router();



router.get("/all", allTrains);




module.exports = router;