const { verifyToken} = require("../utils/jwt.js");

exports.protectAdmin = (req, res, next) => {
    
    const authHeader = req.headers.authorization;


    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            success: false,
            message: "Unauthorized access: No token found"
        });
    }

    
    try{
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        if(decoded.role !== "admin"){
            return res.status(401).json({
                success: false,
                message: "Unauthorized access: User is not an admin"
            })
        };

        req.user = decoded;
        next();
    }
    catch(err){
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }
}