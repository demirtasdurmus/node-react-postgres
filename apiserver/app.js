// built in Nodemodules
const path = require("path");
// libraries and frameworks
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
// const compression = require('compression');
const cors = require('cors');
// const helmet = require("helmet");
// const httpStatus = require('http-status');
const morgan = require("morgan");
// internal modules/utils/middlewares/services
const api = require("./api");
const { errorConverter, errorHandler } = require("./middleware/errors");
const AppError = require('./utils/AppError');

// setting up logger
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
};

// opening cors for development
app.use(cors());

// setting security HTTP headers
// app.use(helmet());

// parsing cookies for auth
app.use(cookieParser())

// parsing incoming requests with JSON body payloads
app.use(express.json());

// parsing incoming requests with urlencoded body payloads
app.use(express.urlencoded({ extended: true }));

// serving the static files
app.use(express.static(path.join(__dirname, "../", "client/", "build")));

// handling gzip compression
// app.use(compression());

// redirecting incoming requests to api.js
app.use("/api/v1", api);

// returning the main index.html, so react-router render the route in the client
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../", "client/", "build", "index.html",));
});

// converting error to AppError, if needed
app.use(errorConverter);

// handling error
app.use(errorHandler);

module.exports = app;