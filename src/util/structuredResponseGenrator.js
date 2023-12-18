exports.responseGenrator = (data, message, error) => {
    return {
        data: data ? data : null,
        message: message ? message : null,
        error: error ? error : null,
    }
}
exports.errorResponseGenrator = (message, error) => {
    return {
        data: null,
        message,
        error
    }
}