const pool = require("../config/connect.js");


function getTime(dh, dm) {
    let time = "";
    time += (dh < 10 ? "0" : "") + dh + ":";
    time += (dm < 10 ? "0" : "") + dm + ":00";
    return time;
}


async function createTicket({
  userId,
  routeId,
  trainId,
  sourceStation,
  destinationStation,
  price,
  email,
  contactno,
  passengers,
}) {
  if (
    !userId ||
    !routeId ||
    !trainId ||
    !sourceStation ||
    !destinationStation ||
    !price ||
    !email ||
    !contactno ||
    !passengers ||
    !Array.isArray(passengers) ||
    passengers.length === 0
  ) {
    throw new Error("Missing required fields");
  }

  // Insert ticket
  const newTicket = await pool.query(
    `INSERT INTO Tickets (UserID, RouteID, TrainID, SourceStation, DestinationStation, Price, Email, ContactNo, NoOfPassenger)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING TicketId;`,
    [
      userId,
      routeId,
      trainId,
      sourceStation.toLowerCase(),
      destinationStation.toLowerCase(),
      price,
      email,
      contactno,
      passengers.length,
    ]
  );

  const ticketId = parseInt(newTicket.rows[0].ticketid);

  // Insert passengers
  for (let p of passengers) {
    await pool.query(
      `INSERT INTO Passengers (TicketID, Name, Age, Gender)
       VALUES ($1, $2, $3, $4);`,
      [ticketId, p.name.toLowerCase(), p.age, p.gender]
    );
  }

  // Update remaining seats
  await pool.query(
    `UPDATE Routes
     SET RemainingSeats = RemainingSeats - $1
     WHERE TimefromStart >= (
        SELECT TimefromStart FROM Routes
        WHERE CurrentStation = $2
          AND TrainID = $4
          AND RouteID = $5
     )
     AND TimefromStart < (
        SELECT TimefromStart FROM Routes
        WHERE CurrentStation = $3
          AND TrainID = $4
          AND RouteID = $5
     )
     AND TrainID = $4
     AND RouteID = $5;`,
    [
      passengers.length,
      sourceStation.toLowerCase(),
      destinationStation.toLowerCase(),
      trainId,
      routeId,
    ]
  );

  return {
    success: true,
    message: "Ticket booked successfully",
    ticketId,
  };
}

// -------- CONTROLLER (Express handler) --------
exports.bookTicket = async (req, res) => {
  try {
    const result = await createTicket(req.body);
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to book ticket",
    });
  }
};

// -------- KEEP OTHER CONTROLLERS SAME --------
exports.searchTicket = async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: "Please provide user ID",
    });
  }

  try {
    const ticketResult = await pool.query(
      `SELECT * FROM Tickets WHERE UserID = $1;`,
      [uid]
    );

    let bookings = [];

    for (let ticket of ticketResult.rows) {
      let trainResult = await pool.query(
        "SELECT TrainName, RunsOn, StartTime FROM Trains WHERE TrainID = $1",
        [ticket.trainid]
      );
      let train = trainResult.rows[0];

      let stationDetailsResult = await pool.query(
        `SELECT 
            to_char(DEPARTURE.CurrentDate, 'YYYY-MM-DD') AS DepartureDate, 
            to_char(ARRIVAL.CurrentDate, 'YYYY-MM-DD') AS ArrivalDate, 
            ARRIVAL.TimeFromStart - DEPARTURE.TimeFromStart AS Duration, 
            ARRIVAL.TimeFromStart AS ArrivalTime, 
            DEPARTURE.TimeFromStart AS DepartureTime
         FROM Routes AS DEPARTURE
         INNER JOIN Routes AS ARRIVAL
         ON (DEPARTURE.RouteID = ARRIVAL.RouteID AND DEPARTURE.TrainID = ARRIVAL.TrainID)
         WHERE DEPARTURE.CurrentStation = $1 
           AND ARRIVAL.CurrentStation = $2 
           AND ARRIVAL.RouteID = $3`,
        [ticket.sourcestation, ticket.destinationstation, ticket.routeid]
      );
      let stationDetails = stationDetailsResult.rows[0];

      let [h, m] = train.starttime.split(":").map(Number);

      let dh = (h + Math.floor(stationDetails.departuretime / 60)) % 24;
      let dm = (m + stationDetails.departuretime % 60) % 60;
      dh += Math.floor((m + stationDetails.departuretime % 60) / 60);
      let departureTime = getTime(dh, dm);

      dh = (h + Math.floor(stationDetails.arrivaltime / 60)) % 24;
      dm = (m + stationDetails.arrivaltime % 60) % 60;
      let arrivalTime = getTime(dh, dm);

      bookings.push({
        trainName: train.trainname,
        trainId: ticket.trainid,
        noOfPassengers: ticket.noofpassenger,
        departureStation: ticket.sourcestation,
        departureTime,
        departureDate: stationDetails.departuredate,
        durationHours: Math.floor(stationDetails.duration / 60),
        durationMinutes: stationDetails.duration % 60,
        runsOn: train.runson,
        arrivalStation: ticket.destinationstation,
        arrivalTime,
        arrivalDate: stationDetails.arrivaldate,
        ticketId: ticket.ticketid,
      });
    }

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.searchTicket = async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({
            success: false,
            message: "Please provide user ID"
        });
    }

    try {
        const ticketResult = await pool.query(
            `SELECT * FROM Tickets WHERE UserID = $1;`, [uid]
        );

        let bookings = [];

        for (let ticket of ticketResult.rows) {
            // Train details
            let trainResult = await pool.query(
                "SELECT TrainName, RunsOn, StartTime FROM Trains WHERE TrainID = $1",
                [ticket.trainid]
            );
            let train = trainResult.rows[0];

            // Route details
            let stationDetailsResult = await pool.query(
                `SELECT 
                    to_char(DEPARTURE.CurrentDate, 'YYYY-MM-DD') AS DepartureDate, 
                    to_char(ARRIVAL.CurrentDate, 'YYYY-MM-DD') AS ArrivalDate, 
                    ARRIVAL.TimeFromStart - DEPARTURE.TimeFromStart AS Duration, 
                    ARRIVAL.TimeFromStart AS ArrivalTime, 
                    DEPARTURE.TimeFromStart AS DepartureTime
                 FROM Routes AS DEPARTURE
                 INNER JOIN Routes AS ARRIVAL
                 ON (DEPARTURE.RouteID = ARRIVAL.RouteID AND DEPARTURE.TrainID = ARRIVAL.TrainID)
                 WHERE DEPARTURE.CurrentStation = $1 
                   AND ARRIVAL.CurrentStation = $2 
                   AND ARRIVAL.RouteID = $3`,
                [ticket.sourcestation, ticket.destinationstation, ticket.routeid]
            );
            let stationDetails = stationDetailsResult.rows[0];

            // Base train start time
            let [h, m] = train.starttime.split(':').map(Number);

            // Departure time
            let dh = (h + Math.floor(stationDetails.departuretime / 60)) % 24;
            let dm = (m + stationDetails.departuretime % 60) % 60;
            dh += Math.floor((m + stationDetails.departuretime % 60) / 60);
            let departureTime = getTime(dh, dm);

            // Arrival time
            dh = (h + Math.floor(stationDetails.arrivaltime / 60)) % 24;
            dm = (m + stationDetails.arrivaltime % 60) % 60;
            let arrivalTime = getTime(dh, dm);

            bookings.push({
                trainName: train.trainname,
                trainId: ticket.trainid,
                noOfPassengers: ticket.noofpassenger,
                departureStation: ticket.sourcestation,
                departureTime,
                departureDate: stationDetails.departuredate,
                durationHours: Math.floor(stationDetails.duration / 60),
                durationMinutes: stationDetails.duration % 60,
                runsOn: train.runson,
                arrivalStation: ticket.destinationstation,
                arrivalTime,
                arrivalDate: stationDetails.arrivaldate,
                ticketId: ticket.ticketid
            });
        }

        return res.status(200).json({
            success: true,
            bookings
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.allTickets = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM TICKETS ORDER BY ticketid DESC;`);

        console.log(result);
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


exports.deleteTicket = async (req, res) => {
    try {
        const { tid } = req.body;
        if (!tid) {
            return res.status(400).json({
                success: false,
                message: "Please provide ticket ID"
            });
        }

        const result = await pool.query(
            `DELETE FROM TICKETS WHERE TICKETID = $1;`, 
            [tid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ticket deleted successfully"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.createTicket = createTicket;