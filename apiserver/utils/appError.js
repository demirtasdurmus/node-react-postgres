class AppError extends Error {
    constructor(statusCode, message, isOperational = true, name = "Error", stack = '') {
        super(message);

        this.statusCode = statusCode;
        this.name = name;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
};

module.exports = AppError;