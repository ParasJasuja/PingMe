const { errorResponseGenrator } = require("../util/structuredResponseGenrator")


const customErrorHandler = (err, req, res, next) => {
    if (err.name == "TokenExpiredError") {
        return res.status(401).json(errorResponseGenrator("Token Expired", err))
    }
    if (!err.status) {
        err.message = "Something went wrong"
        return res.status(500).json(errorResponseGenrator("Something went wrong please try again later", err))

    }
    return res.status(err.status).json(errorResponseGenrator(err.message, err))
    next(err)
}





module.exports = customErrorHandler