const { responseGenrator } = require("../util/structuredResponseGenrator")

exports.home = (req, res, next) => {
    res.status(200).json(responseGenrator({
        message: "Welcome"
    }, "Welcome"))
}