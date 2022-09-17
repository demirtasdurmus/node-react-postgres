const path = require("path")

const express = require("express")
const cookieParser = require('cookie-parser')
const compression = require('compression')
const cors = require('cors')
const helmet = require("helmet")
const morgan = require("morgan")

const api = require("./api")
const convertErrors = require('./middleware/convertErrors')
const handleErrors = require('./middleware/handleErrors')
const app = express()


// parsing cookies for auth
app.use(cookieParser())

// setting up logger
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
}

// opening cors for development
app.use(cors())

// setting security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: false,
}))

// parsing incoming requests with JSON body payloads
app.use(express.json())

// parsing incoming requests with urlencoded body payloads
app.use(express.urlencoded({ extended: true }))

// serving the static files
app.use(express.static(path.join(__dirname, "../", "client/", "build")))
app.use(express.static(path.join(__dirname, "images")))

// handling gzip compression
app.use(compression())

// redirecting incoming requests to api.js
app.use(`/api/${process.env.API_VERSION}`, api)

// returning the main index.html, so react-router render the route in the client
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../", "client/", "build", "index.html",))
})

// setting up a 404 error handler
app.all("*", (req, res, next) => {
    res.status(404).end()
})

// convert&handle errors
app.use(convertErrors)
app.use(handleErrors)

module.exports = app