const pool = require("../config/connect.js");

const pricePerMinute = 1;

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

            dh = (h + Math.floor(t.arrivaltime / 60)) % 24;
            dm = (m + (t.arrivaltime % 60)) % 60;
            dh += Math.floor((m + (t.arrivaltime % 60)) / 60); // FIXED
            const arrivalTimeStr = getTime(dh, dm);

            trainDetails.push({
                trainid: parseInt(t.trainid),
                departure: t.currentstation,
                arrival: t.nextstation,
                departureDate: t.departuredate,
                arrivalDate: t.arrivaldate,
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



