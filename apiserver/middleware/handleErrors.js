const sendErrorDev = (err, res) => {
    // 1) log error to console
    console.log(`💥💥💥💥💥💥💥💥💥💥💥💥💥${err.name}💥💥💥💥💥💥💥💥💥💥💥💥💥`)
    console.log("headersSent: ?", res.headersSent)
    console.log("isOperational: ?", err.isOperational)
    console.log(err.message)
    console.log("-------------stack----------------")
    console.log(err.stack)
    console.log("💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥")

    // 2) send error message to client
    if (res.headersSent) return
    res.status(err.statusCode).send({
        status: err.status,
        error: err,
        name: err.name,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        // check if the headers is sent
        if (res.headersSent) {
            console.log(`💥💥💥💥💥💥💥💥💥💥💥💥💥${err.name}💥💥💥💥💥💥💥💥💥💥💥💥💥`)
            console.log("headersSent: ?", res.headersSent)
            console.log("isOperational: ?", err.isOperational)
            console.log(err.message)
            console.log("-------------stack----------------")
            console.log(err.stack)
            console.log("💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥")
        } else {
            res.status(err.statusCode).send({
                status: err.status,
                message: err.message
            })
        }
        // Programming or other unknown error: don't leak error details
    } else {
        // log error to db 
        console.log(`💥💥💥💥💥💥💥💥💥💥💥💥💥${err.name}💥💥💥💥💥💥💥💥💥💥💥💥💥`)
        console.log("headersSent: ?", res.headersSent)
        console.log("isOperational: ?", err.isOperational)
        console.log(err.message)
        console.log("-------------stack----------------")
        console.log(err.stack)
        console.log("💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥")
        // check if the headers is sent
        if (!res.headersSent) {
            // send generic message
            res.status(500).send({
                status: 'error',
                message: 'Something went very wrong!'
            })
        }
    }
}

module.exports = (err, req, res, next) => {
    // clear cookie if authorized
    if (err.statusCode === 401) res.clearCookie(process.env.SESSION_COOKIE_NAME)
    // handling errors acoording to node_env
    if (process.env.NODE_ENV === 'production') {
        sendErrorProd(err, res)
    } else {
        sendErrorDev(err, res)
    }
}