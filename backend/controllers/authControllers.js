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

//forget passward 

const crypto = require("crypto");

exports.forgotPassword = async (req, res) => {
  const { email, role } = req.body; // role = 'user' or 'admin'

  if (!email || !role) {
    return res.status(400).json({ success: false, message: "Email and role required" });
  }

  const table = role === "admin" ? "admins" : "users";
  const column = role === "admin" ? "adminemail" : "email";

  try {
    const result = await pool.query(`SELECT * FROM ${table} WHERE ${column} = $1`, [
      email.toLowerCase(),
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    // Create reset token
    const token = crypto.randomBytes(20).toString("hex");

    // Store temporarily (could add reset_tokens table)
    await pool.query(
      `UPDATE ${table} SET reset_token = $1, reset_expires = NOW() + INTERVAL '15 MINUTE' WHERE ${column} = $2`,
      [token, email.toLowerCase()]
    );

    // In production, send via email — for now, just return token
    return res.status(200).json({
      success: true,
      message: "Reset token generated",
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// reset password

exports.resetPassword = async (req, res) => {
  const { token, role, newPassword } = req.body;
  const table = role === "admin" ? "admins" : "users";
  const column = role === "admin" ? "adminemail" : "email";

  if (!token || !newPassword || !role) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ${table} WHERE reset_token = $1 AND reset_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = result.rows[0];
    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE ${table} SET password = $1, reset_token = NULL, reset_expires = NULL WHERE ${column} = $2`,
      [hashed, user[column]]
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
