const User = require("../models/userModel");
const CustomError = require("../util/CustomError");
const asyncHandler = require("../util/asyncHandler");
const sendCookieToken = require("../util/sendCookieToken");
const jwt = require("jsonwebtoken");
const { responseGenrator } = require("../util/structuredResponseGenrator");


exports.userSignup = asyncHandler(async (req, res, next) => {
    const { name, email, gender, password } = req.body;
    let user = await User.find({ email });
    if (user.length) {
        return next(new CustomError(401, "Email already registered"))
    }

    user = new User({
        name, email, gender, password
    })
    user = await user.save();

    return sendCookieToken(res, user);
})

exports.userLogin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new CustomError("Please provide Email and Password to login."))
    }

    const fetchUser = await User.find({ email }).select("+password")
    const user = fetchUser[0];
    if (!user) {
        return next(new CustomError(401, "No user found"))
    }

    const isPasswordCorrect = await user.verifyPassword(password, user.password)
    if (!isPasswordCorrect) {
        return next(new CustomError(401, "Invalid Password"))
    }

    return sendCookieToken(res, user);
})


exports.userLogout = asyncHandler(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json(responseGenrator({}, "Logout successfully"))
})