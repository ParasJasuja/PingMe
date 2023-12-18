const asynHandler = (controller) =>
    (req, res, next) =>
        Promise.resolve(controller(req, res, next))
            .catch(next(error));

module.exports = asynHandler;