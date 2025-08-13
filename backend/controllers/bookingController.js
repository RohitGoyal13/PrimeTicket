const pool = require("../config/connect.js");

exports.bookTicket = async (req, res) => {
    try {
        const { userId, routeId, trainId, sourceStation, destinationStation, price, email, contactno, passengers } = req.body;

        // Validation
        if (!userId || !routeId || !trainId || !sourceStation || !destinationStation || !price || !email || !contactno || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Insert ticket (store passenger count, not array)
        const newTicket = await pool.query(
            `INSERT INTO Tickets (UserID, RouteID, TrainID, SourceStation, DestinationStation, Price, Email, ContactNo, NoOfPassenger)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING TicketId;`,
            [userId, routeId, trainId, sourceStation.toLowerCase(), destinationStation.toLowerCase(), price, email, contactno, passengers.length]
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
            [passengers.length, sourceStation.toLowerCase(), destinationStation.toLowerCase(), trainId, routeId]
        );

        return res.status(201).json({
            success: true,
            message: "Ticket booked successfully",
            ticketId
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
