const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (
        // Checking if user is loggedin by checking for JWT token sent by client
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        try {
            // Saving Token
            token = req.headers.authorization.split(" ")[1];

            // Decoding JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            res.status(401);
            throw new Error(error);
        }
    }
    if (!token) {
        res.status(401);
        throw new Error("Note authorised, couldn't find token");
    }
});

module.exports = protect