const asyncHandler = require("../util/asyncHandler");
const { responseGenrator } = require("../util/structuredResponseGenrator");

exports.notFound = asyncHandler((req, res, next) => {
    res.status(404).json(responseGenrator(null, "Invalid Route: Route not found"))
}) 