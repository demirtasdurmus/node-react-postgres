const { BaseError } = require("sequelize");
const httpStatus = require('http-status');
const AppError = require('../utils/AppError');

const sendErrorDev = (err, res) => {
    console.log(`-------------------------${err.name}---------------------------`);
    console.log("errorMessage=>", err.message);
    console.log("errorStack=>", err.stack);
    console.log(`---------------------------------------------------------------------------`);
    res.status(err.statusCode).send({
        status: err.status,
        error: err,
        name: err.name,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).send({
            status: err.status,
            message: err.message
        });
        // Programming or other unknown error: don't leak error details
    } else {
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        res.status(500).send({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};
// converting non-Express errors to AppError
const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof AppError)) {
        const statusCode =
            error.statusCode || error instanceof BaseError ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        error = new AppError(statusCode, message, error.name, false, err.stack);
    }
    next(error);
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // logging error regardless of the NODE_ENV if headers sent
    if (res.headersSent) {
        console.log("---headers-sent---");
        console.log(err.stack);
    };
    // configuring error handling based on NODE_ENV
    if (process.env.NODE_ENV === 'production') {
        !res.headersSent && sendErrorProd(err, res);
    } else {
        !res.headersSent && sendErrorDev(err, res);
    }
};

module.exports = {
    errorConverter,
    errorHandler,
};