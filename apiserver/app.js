// built in Nodemodules
const path = require("path");
// libraries and frameworks
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const compression = require('compression');
const cors = require('cors');
const helmet = require("helmet");
// const httpStatus = require('http-status');
const morgan = require("morgan");
// internal modules/utils/middlewares/services
const api = require("./api");
const cookieService = require("./services/cookieService");
const jwtService = require("./services/jwtService");
const errorConverter = require('./middleware/errors/errorConverter');
const errorHandler = require('./middleware/errors/errorHandler');


// parsing cookies for auth
app.use(cookieParser())

// adding userId to the request object if exists w/o verifying the token
app.use((req, res, next) => {
    const { __session } = req.cookies;
    req.userId = "Guest";
    if (__session) {
        // decode jwt token from cookie session and verify
        const token = cookieService.decrypt(__session);
        const payload = jwtService.decode(token);
        if (payload) {
            req.userId = payload.id;
        }
    };
    next();
});

// setting up logger
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
};

// opening cors for development
app.use(cors());

// setting security HTTP headers
app.use(helmet());

// parsing incoming requests with JSON body payloads
app.use(express.json());

// parsing incoming requests with urlencoded body payloads
app.use(express.urlencoded({ extended: true }));

// serving the static files
app.use(express.static(path.join(__dirname, "../", "client/", "build")));
app.use(express.static(path.join(__dirname, "images")));

// handling gzip compression
app.use(compression());

// redirecting incoming requests to api.js
app.use(`/api/${process.env.API_VERSION}`, api);

// returning the main index.html, so react-router render the route in the client
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../", "client/", "build", "index.html",));
});

// setting up a 404 error handler
app.all("*", (req, res, next) => {
    res.status(404).end();
});

// converting error to AppError, if needed
app.use(errorConverter);

// handling error
app.use(errorHandler);

module.exports = app;