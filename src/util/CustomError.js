module.exports = class CustomError extends Error {
    /**
     * @desc Takes status code and error message as params and raise a error
     * @param {number} code 
     * @param {string} message 
     */
    constructor(code, message) {
        super(message)
        this.status = code
    }
}
