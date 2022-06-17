const httpStatus = require('http-status');
const AppError = require('../../utils/appError');
const { Error } = require("sequelize");
const { JsonWebTokenError, TokenExpiredError, NotBeforeError } = require('jsonwebtoken');


const convertSequelizeError = (err) => {
    if (err.name === 'SequelizeValidationError') {
        // create a custom message for Sequelize validation errors
        let concattedMessage = err.errors.map(er => er.message).join('. ');
        err.message = `Invalid input: ${concattedMessage}`;
    };
    return err;
};

// convert non-express errors to AppError
module.exports = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof AppError)) {
        // set initial statusCode to 400 if not already set
        error.statusCode = error.statusCode || httpStatus.BAD_REQUEST;

        // convert errors conditionally
        if (error instanceof JsonWebTokenError) {
            error.message = 'Invalid session. Please log in again.';
            error.statusCode = httpStatus.UNAUTHORIZED;
            res.clearCookie("__session");
        } else if (error instanceof TokenExpiredError) {
            error.message = 'Session expired. Please log in again.';
            error.statusCode = httpStatus.UNAUTHORIZED;
            res.clearCookie("__session");
        } else if (error instanceof NotBeforeError) {
            error.message = 'Session not active. Please log in again.';
            error.statusCode = httpStatus.UNAUTHORIZED;
            res.clearCookie("__session");
        } else if (error instanceof Error) {
            error = convertSequelizeError(error);
        } else {
            error.statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
            error.message = error.message || httpStatus[error.statusCode];
            error.isOperational = false;
        };

        // recreate the error object with the new arguments
        error = new AppError(error.statusCode, error.message, error.isOperational, error.name, error.stack);
    };
    // pass the error to the actual error handler middleware
    next(error);
};