const pool = require("../config/connect.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (userId, email) => {
    return jwt.sign({
        userId,
        email
    },
     process.env.JWT_SECRET,
     {
        expiresIn: "8h"
    });
};

// REGISTER 

exports.register = async (req, res) => {
    const {firstName,lastName,email,contactno,password} = req.body;

    if(!firstName || !lastName || !email || !contactno || !password){
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields"
        })
    }

    try{
       const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

       if(existingUser.rows.length > 0){
            return res.status(401).json({
                success: false,
                message: "User already exists"
            })
       }

       const hashedPassword = await bcrypt.hash(password, 10);

       await pool.query("INSERT INTO USERS (firstname, lastname , email, contactno, password) VALUES ($1, $2, $3, $4, $5)",
         [firstName.toLowerCase(), lastName.toLowerCase(), email, contactno, hashedPassword]);

       return res.status(200).json({
           success: true,
           message: "User registered successfully"
       })

    }catch(err){
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

// LOGIN

exports.login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields"
        })
    }

    try{
        const userresult = await pool.query("SELECT * FROM USERS WHERE EMAIL= $1", [email.toLowerCase()]);

        if(userresult.rows.length === 0){
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        const user = userresult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json(
                {
                    success: false,
                    message: "Incorrect password"
                }
            )
        }

        const token = generateToken(user.userid, user.email);

        return res.status(200).json({
            success: true,
            token,
            userid: user.userid,
            message: "Login successful",
        })
    }
    catch(err){
        console.error(err);
        return res.status(401).json({
            success: false,
            message: "Server Error"
        })
    }
}

// Change Password

exports.changePassword = async (req, res) => {

const {oldPassword, newPassword} = req.body;

const userId = req.user.userId;

console.log("Decoded token payload:", req.user);

if(!oldPassword || !newPassword){
    return res.status(400).json({
        success: false,
        message: "Please fill all the fields"
    })
}

try{
    const userresult = await pool.query("SELECT * FROM USERS WHERE USERID = $1", [userId]);

    if(userresult.rows.length === 0){
        return res.status(404).json(
            {
                success: false,
                message: "User not found"
            }
        )
    }

    const user = userresult.rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if(!isMatch){
        return res.status(401).json(
            {
                success: false,
                message: "Incorrect password"
            }
        )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE USERS SET PASSWORD = $1 WHERE USERID = $2", [hashedPassword, userId]);

    return res.status(200).json({
        success: true,
        message: "Password changed successfully"
    })
}
catch(err){
    console.error(err);
    return res.status(500).json({
        success: false,
        message: "Server Error"
    })
}
}