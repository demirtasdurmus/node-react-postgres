const sendErrorDev = (err, res) => {
    // 1) log error to console
    console.log(`-------------${err.name}------------`)
    console.log("headersSent: ?", res.headersSent)
    console.log("isOperational: ?", err.isOperational)
    console.log(err.message)
    console.log("-------------stack----------------")
    console.log(err.stack)
    console.log("----------------------------------")

    // 2) send error message to client
    res.status(err.statusCode).send({
        status: err.status,
        error: err,
        name: err.name,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, req, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        // check if the headers is sent
        if (!res.headersSent) {
            res.status(err.statusCode).send({
                status: err.status,
                message: err.message
            });
        } else {
            console.log("-------headers sent error----------")
            console.log(`-------------${err.name}------------`)
            console.log(err.message)
            console.log("-------------stack----------------")
            console.log(err.stack)
            console.log("----------------------------------")
        }
        // Programming or other unknown error: don't leak error details
    } else {
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message if header is not sent
        !res.headersSent && res.status(500).send({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

// handle errors and send response accordingly
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // handling errors acoording to node_env
    if (process.env.NODE_ENV === 'production') {
        sendErrorProd(err, req, res);
    } else {
        sendErrorDev(err, res);
    };
};