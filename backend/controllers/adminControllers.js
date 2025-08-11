const pool = require("../config/connect.js");
const bcrypt = require("bcrypt");
const {generateToken} = require("../utils/jwt.js");


exports.adminLogin = async (req, res) => {

    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            })
        }

        const adminLog = await pool.query(
            "SELECT * from admins where adminemail = $1", [email.toLowerCase()]
        );

        if(adminLog.rows.length === 0){
            return res.status(401).json({
                status: false,
                message: "User not found"
            })
        };

        const admin = adminLog.rows[0];

        const isMatch = await bcrypt.compare(password, admin.password);

        if(!isMatch){
            return res.status(401).json({
                status: false,
                message: "Incorrect password"
            })
        }

        const token = generateToken({
             id: admin.adminid,
             email: admin.adminemail,
             role: "admin"
            });
        res.status(200).json({
            success: true,
            message: "Admin logged in successfully",
            token
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            success : false,
            message: "Internal Server Error"
        })
    }
};


