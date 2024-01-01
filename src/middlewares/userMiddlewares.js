const User = require("../models/userModel");
const jwt = require("jsonwebtoken")
const CustomError = require("../util/CustomError");
const asyncHandler = require("../util/asyncHandler");

exports.isLoggedIn = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.token || req.body.token || req.header('Authorization')?.replace("Bearer ", "");
    if (!token) {
        return next(new CustomError(401, "Cookie token not found"))
    }
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.id);
    if (!user) {
        return next(new CustomError(401, "Invalid token."))
    }

    req.user = user;
    next();
})