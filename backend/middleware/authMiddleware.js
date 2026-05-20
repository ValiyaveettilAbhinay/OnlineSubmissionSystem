const jwt = require("jsonwebtoken");
// This function takes allowed roles as arguments and returns an Express middleware
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Safety check: Make sure authMiddleware ran first
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. Please log in first." });
        }

        // Check if the user's role is included in the allowedRoles array
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Forbidden: Your role (${req.user.role}) is not authorized to access this resource.` 
            });
        }

        // Everything looks good! Move to the final controller
        next();
    };
};

const authMiddleware = (req,res,next) =>{
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(404).json({
                message : "No Token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,process.env.JWT_SECRET
        );

        req.user = decoded;
        next();
    }
    catch(e){
        return res.status(404).json({
                message : "Error occured"
        })
    }
}

module.exports = { authMiddleware, authorizeRoles };