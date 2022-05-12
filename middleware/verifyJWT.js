const jwt = require("jsonwebtoken");

const verifyJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(403);

    const token = authHeader.split(" ")[1];

    await jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded) => {
        if (err) return res.sendStatus(403);

        req.user = decoded.UserInfo.username;
        req.roles = decoded.UserInfo.roles;
        next();
    });
};

module.exports = verifyJWT;
