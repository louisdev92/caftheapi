const jwt = require('jsonwebtoken');

// Création du middleware
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({error: "Token introuvable"});
    }

    jwt.verify(token.split("")[1], process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).json({message: "token invalide"});
        }
        req.client=decoded;
        next();
    });
};
