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
  paymentId,
  orderId,
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
    `INSERT INTO Tickets (UserID, RouteID, TrainID, SourceStation, DestinationStation, Price, Email, ContactNo, NoOfPassenger,PaymentId, RazorpayOrderId)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
      paymentId || null,
      orderId || null
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
            (ARRIVAL.TimeFromStart - DEPARTURE.TimeFromStart) AS Duration, 
            ARRIVAL.TimeFromStart AS arrivaltime, 
            DEPARTURE.TimeFromStart AS departuretime
         FROM Routes AS DEPARTURE
         INNER JOIN Routes AS ARRIVAL
         ON (DEPARTURE.RouteID = ARRIVAL.RouteID AND DEPARTURE.TrainID = ARRIVAL.TrainID)
         WHERE DEPARTURE.CurrentStation = $1 
           AND ARRIVAL.CurrentStation = $2 
           AND ARRIVAL.RouteID = $3`,
        [ticket.sourcestation, ticket.destinationstation, ticket.routeid]
      );

      const stationDetails = stationDetailsResult.rows[0];

      // Fallback if stationDetails missing
      if (!stationDetails) {
        // skip this ticket (or handle as you prefer)
        continue;
      }

      // Parse train start time (HH:MM)
      const [startH, startM] = (train.starttime || "00:00").split(":").map(Number);

      // Convert departure/arrival offsets (they are minutes from train start)
      const depOffsetMin = Number(stationDetails.departuretime); // minutes from train start
      const arrOffsetMin = Number(stationDetails.arrivaltime); // minutes from train start

      // Absolute minutes from midnight for departure and arrival (relative to same reference start day)
      const depAbsMin = startH * 60 + startM + depOffsetMin;
      const arrAbsMin = startH * 60 + startM + arrOffsetMin;

      // Compute time-of-day for departure and arrival (wrap modulo 24*60)
      const depTodMin = ((depAbsMin % (24 * 60)) + (24 * 60)) % (24 * 60);
      const arrTodMin = ((arrAbsMin % (24 * 60)) + (24 * 60)) % (24 * 60);

      const depHour = Math.floor(depTodMin / 60);
      const depMinute = depTodMin % 60;
      const arrHour = Math.floor(arrTodMin / 60);
      const arrMinute = arrTodMin % 60;

      // Helper to format HH:MM:SS
      function formatTime(h, m) {
        const hh = (h < 10 ? "0" : "") + h;
        const mm = (m < 10 ? "0" : "") + m;
        return `${hh}:${mm}:00`;
      }

      const departureTime = formatTime(depHour, depMinute);
      const arrivalTime = formatTime(arrHour, arrMinute);

      // Determine how many days to add to departure date to get arrival date
      // Example: if depAbsMin = 360 (06:00) and arrAbsMin = 1740 (29:00 -> next day 05:00),
      // floor(1740/1440) - floor(360/1440) = 1 day difference.
      const depDayIndex = Math.floor(depAbsMin / (24 * 60));
      const arrDayIndex = Math.floor(arrAbsMin / (24 * 60));
      const extraDays = arrDayIndex - depDayIndex; // can be 0,1,2,...

      // Use departure date from DB as base (string 'YYYY-MM-DD')
      const departureDateStr = stationDetails.departuredate; // as provided by DB
      // compute arrival date by adding extraDays to departureDateStr
      const depDateObj = new Date(departureDateStr + "T00:00:00"); // treat as local date
      const arrDateObj = new Date(depDateObj);
      arrDateObj.setDate(depDateObj.getDate() + extraDays);

      // format back to YYYY-MM-DD
      function formatDateYYYYMMDD(d) {
        const y = d.getFullYear();
        const mm = (d.getMonth() + 1).toString().padStart(2, "0");
        const dd = d.getDate().toString().padStart(2, "0");
        return `${y}-${mm}-${dd}`;
      }

      const departureDate = formatDateYYYYMMDD(depDateObj);
      const arrivalDate = formatDateYYYYMMDD(arrDateObj);

      const passengersResult = await pool.query(
        `SELECT name, age, gender FROM Passengers WHERE TicketID = $1;`,
        [ticket.ticketid]
      );

      bookings.push({
        trainName: train.trainname,
        trainId: ticket.trainid,
        noOfPassengers: ticket.noofpassenger,
        departureStation: ticket.sourcestation,
        departureTime,
        departureDate,
        durationHours: Math.floor(Number(stationDetails.duration) / 60),
        durationMinutes: Number(stationDetails.duration) % 60,
        runsOn: train.runson,
        arrivalStation: ticket.destinationstation,
        arrivalTime,
        arrivalDate,
        ticketId: ticket.ticketid,
        email: ticket.email,
        contactno: ticket.contactno,
        passengers: passengersResult.rows,
        price: ticket.price,
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

// exports.createTicket = createTicket({
//    ...bookingData,
//    paymentId: razorpay_payment_id,
//    orderId: razorpay_order_id
// });