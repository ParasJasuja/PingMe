const cookieParser = require("cookie-parser");
const { responseGenrator } = require("./structuredResponseGenrator");

const sendCookieToken = (res, user) => {
    const jwtToken = user.getJwtToken();
    const options = {
        expires: new Date(Date.now() + 60 * 60 * 1000),
        httpOnly: true
    }
    return res.status(200).cookie('token', jwtToken, options).send(responseGenrator(null, "Login successful", null))
}


module.exports = sendCookieToken;