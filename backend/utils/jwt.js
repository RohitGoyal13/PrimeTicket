const jwt = require("jsonwebtoken");

exports.generateToken = function(payload) {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: "8h"
        }
    );
}

exports.verifyToken = function(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}