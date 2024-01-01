const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const CustomError = require("../util/CustomError");

exports.isLogedinHandshake = async (socket, next) => {
    const token = socket?.auth?.token || socket?.handshake?.headers?.authorization?.replace("Bearer ", "");
    if (!token) {
        return next(new CustomError(401, "User not authorized"))
    }
    let decodedToken
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        return next(new CustomError(401, err.message))
    }
    const user = await User.findById(decodedToken.id, "_id name email photo")
    if (!user) {
        return next(new CustomError("Invalid Token"))
    }
    socket.user = user;
    next();
}