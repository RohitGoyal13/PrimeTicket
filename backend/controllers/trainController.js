const pool = require("../config/connect.js");

exports.allTrains = async (req, res) => {
    try{
        req = req.body;
        console.log(req);

        const result = await pool.query("SELECT * FROM TRAINS ORDER BY TRAINID ASC");

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}