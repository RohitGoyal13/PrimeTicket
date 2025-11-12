
const pool = require("../config/connect.js");

const pricePerMinute = 1;

const weekday = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
};


function getNextDay(date = new Date(), day) {
    const dateCopy = new Date(date.getTime());
  
    const next = new Date(
      dateCopy.setDate(
        dateCopy.getDate() + ((7 - dateCopy.getDay() + day) % 7 || 7),
      ),
    );
  
    return next;
  }


function getTime(dh, dm) {
    let time = "";
    time += (dh < 10 ? "0" : "") + dh + ":";
    time += (dm < 10 ? "0" : "") + dm + ":00";
    return time;
}

exports.allTrains = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM TRAINS ORDER BY TRAINID ASC");
        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.searchTrains = async (req, res) => {
    const { departure, arrival, date } = req.body;

    if (!departure || !arrival || !date) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields"
        });
    }

    try {
        // Get matching train segments
        const trainresult = await pool.query(
            `SELECT 
                D.TRAINID AS TRAINID,
                D.ROUTEID AS ROUTEID,
                D.CURRENTSTATION AS CURRENTSTATION,
                A.CURRENTSTATION AS NEXTSTATION,
                TO_CHAR(D.CURRENTDATE , 'YYYY-MM-DD') AS DEPARTUREDATE,
                TO_CHAR(A.CURRENTDATE , 'YYYY-MM-DD') AS ARRIVALDATE,
                A.TIMEFROMSTART - D.TIMEFROMSTART AS DURATION,
                D.TIMEFROMSTART AS DEPARTURETIME,
                A.TIMEFROMSTART AS ARRIVALTIME
             FROM ROUTES AS D 
             INNER JOIN ROUTES AS A 
               ON D.TRAINID = A.TRAINID
              AND D.ROUTEID = A.ROUTEID
             WHERE LOWER(D.CURRENTSTATION) = LOWER($1)
               AND LOWER(A.CURRENTSTATION) = LOWER($2)
               AND A.TIMEFROMSTART > D.TIMEFROMSTART
               AND D.CURRENTDATE = $3`,
            [departure, arrival, date]
        );

        const trains = trainresult.rows;
        if (trains.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No trains found",
                data: []
            });
        }

        let trainDetails = [];

        for (let t of trains) {
            const traininfo = await pool.query(
                "SELECT * FROM TRAINS WHERE TRAINID = $1;",
                [t.trainid]
            );

            const remainingSeatsResults = await pool.query(
                `SELECT MIN(REMAININGSEATS) AS remaining
                   FROM ROUTES
                  WHERE TRAINID = $1 
                    AND ROUTEID = $2
                    AND TIMEFROMSTART >= $3
                    AND TIMEFROMSTART < $4`,
                [t.trainid, t.routeid, t.departuretime, t.arrivaltime]
            );

            const currentTrain = traininfo.rows[0];
            const remainingSeats = remainingSeatsResults.rows[0]?.remaining || 0;

            // Time calculations
            let [h, m] = currentTrain.starttime.split(":").map(num => parseInt(num));

            let dh = (h + Math.floor(t.departuretime / 60)) % 24;
            let dm = (m + (t.departuretime % 60)) % 60;
            dh += Math.floor((m + (t.departuretime % 60)) / 60);
            const departureTimeStr = getTime(dh, dm);

            let arrTotalMinutes = h * 60 + m + t.arrivaltime;
            let arrDays = Math.floor(arrTotalMinutes / (24 * 60)); // how many days passed
            let arrMinutesInDay = arrTotalMinutes % (24 * 60);

            let arrivalH = Math.floor(arrMinutesInDay / 60);
            let arrivalM = arrMinutesInDay % 60;

            let arrivalTimeStr = getTime(arrivalH, arrivalM);

            // increment arrivalDate if overflow
            let arrivalDateObj = new Date(t.arrivaldate);
            arrivalDateObj.setDate(arrivalDateObj.getDate() + arrDays);
            let arrivalDateStr = arrivalDateObj.toISOString().slice(0, 10);


            trainDetails.push({
                trainid: parseInt(t.trainid),
                departure: t.currentstation,
                arrival: t.nextstation,
                departureDate: t.departuredate,
                arrivalDate: arrivalDateStr,
                durationHours: Math.floor(t.duration / 60),
                durationMinutes: t.duration % 60,
                price: t.duration * pricePerMinute,
                trainName: currentTrain.trainname,
                runsOn: currentTrain.runson,
                remainingSeats: remainingSeats,
                arrivalTime: arrivalTimeStr,
                departureTime: departureTimeStr,
                routeId: parseInt(t.routeid)
            });
        }

        return res.status(200).json({
            success: true,
            data: trainDetails
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.addTrain = async (req, res) => {
    const { trainName, runson, totalseats, starttime, routes } = req.body;

    if (!trainName || !runson || !totalseats || !starttime || !routes) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields"
        });
    }

    const runsonLower = runson.toLowerCase();
    if (weekday[runsonLower] === undefined || typeof weekday[runsonLower] !== 'number') {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid day of the week (e.g., monday, tuesday...)"
        });
    }

    try {
        // Get max routeId
        const maxRouteIdResult = await pool.query(
            "SELECT COALESCE(MAX(routeid), 0) AS max FROM routes;"
        );
        let routeIdCounter = maxRouteIdResult.rows[0].max;

        // Insert train
        const newTrainResult = await pool.query(
            "INSERT INTO trains (trainname, runson, totalseats, starttime) VALUES($1, $2, $3, $4) RETURNING trainid;",
            [trainName.toLowerCase(), runsonLower, totalseats, starttime]
        );
        const newTrainId = newTrainResult.rows[0].trainid;

        // Get the next two service dates for the chosen day
        const d1 = getNextDay(new Date(), weekday[runsonLower]);
        const d2 = getNextDay(new Date(d1), weekday[runsonLower]);

        const serviceDates = [d1, d2];

        // Insert routes for each service date
        for (let serviceDate of serviceDates) {
            routeIdCounter++;
            for (let r of routes) {
                await pool.query(
                    "INSERT INTO routes (trainid, currentstation, remainingseats, timefromstart, currentdate, routeid) VALUES($1, $2, $3, $4, $5, $6);",
                    [newTrainId, r.station.toLowerCase(), totalseats, r.timeFromStart, serviceDate, routeIdCounter]
                );
            }
        }

        return res.status(201).json({
            success: true,
            message: "Train added successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.getRoute = async (req, res) => {
    let details = { flag: false };
    const haltmin = 10;

    try {
        const { tid } = req.body;
        if (!tid) {
            return res.status(400).json({
                success: false,
                message: "Please provide train ID"
            });
        }

        // Earliest routeid for the train
        const earliestRouteResult = await pool.query(
            "SELECT MIN(routeid) AS minrouteid FROM routes WHERE trainid = $1;",
            [tid]
        );
        const minrouteid = earliestRouteResult.rows[0]?.minrouteid;
        if (!minrouteid) {
            return res.status(404).json({ success: false, message: "No route found for this train" });
        }

        // Stations in that route
        const routeResult = await pool.query(
            "SELECT currentstation, timefromstart FROM routes WHERE trainid = $1 AND routeid = $2 ORDER BY timefromstart;",
            [tid, minrouteid]
        );
        if (routeResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No stations found for this train" });
        }

        const startStation = routeResult.rows[0].currentstation;
        const endStation = routeResult.rows[routeResult.rows.length - 1].currentstation;

        // Train details
        const trainResult = await pool.query(
            "SELECT * FROM trains WHERE trainid = $1;",
            [tid]
        );
        const train = trainResult.rows[0];
        if (!train) {
            return res.status(404).json({ success: false, message: "Train not found" });
        }

        details = {
            trainId: tid,
            trainName: train.trainname,
            startStation,
            destinationStation: endStation,
            runsOn: train.runson,
            stations: [],
            flag: true
        };

        let [h, m] = train.starttime.split(":").map(Number);

        for (let stop of routeResult.rows) {
            // Arrival time
            let totalMinutes = h * 60 + m + stop.timefromstart;
            let daysPassed = Math.floor(totalMinutes / (24 * 60));
            let minutesInDay = totalMinutes % (24 * 60);

            let ah = Math.floor(minutesInDay / 60);
            let am = minutesInDay % 60;

            let arrivalTime = getTime(ah, am);
            // if you want: you can also increment date by daysPassed like above


            // Departure time = arrival time + haltmin
            let departureDM = (dm + haltmin) % 60;
            let departureDH = (dh + Math.floor((dm + haltmin) / 60)) % 24;
            let departureTime = getTime(departureDH, departureDM);

            details.stations.push({
                stationName: stop.currentstation,
                arrivalTime,
                departureTime
            });
        }

        res.status(200).json(details);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.deleteTrain = async (req, res) => {
  try {
    const { tid } = req.body;

    if (!tid) {
      return res.status(400).json({
        success: false,
        message: "Train ID is required",
      });
    }

    // Check if train exists
    const check = await pool.query("SELECT * FROM trains WHERE trainid = $1;", [tid]);
    if (check.rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: `No train found with ID ${tid}`,
      });
    }

    // Delete related routes first
    await pool.query("DELETE FROM routes WHERE trainid = $1;", [tid]);
    await pool.query("DELETE FROM trains WHERE trainid = $1;", [tid]);

    return res.status(200).json({
      success: true,
      message: `Train ID ${tid} deleted successfully`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



