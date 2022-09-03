const dotenv = require('dotenv')
dotenv.config({ path: './.config.env' })

// handle uncaught exceptions
process.on("uncaughtException", err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
    console.log(err.name, err.stack)
    process.exit(1)
})

// connect and sync db
const { sampledb } = require("./models")
sampledb.authenticate()
    .then(() => console.log(`connected to ${sampledb.config.database} successfully!`))
    .catch(err => console.log(`unable to connect ${sampledb.config.database}!`, err.message))
sampledb.sync({ force: false })
    .then(() => console.log(`synced ${sampledb.config.database} successfully!`))
    .catch(err => console.log(`unable to sync ${sampledb.config.database}!`, err.message))

// set up the express server
const app = require('./app')
const { PORT = 8000 } = require("./config")
const server = app.listen(PORT, () => {
    console.log(`Server is awake on port ${PORT}:${process.env.NODE_ENV}`)
})

// handle unhandled rejections
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...')
    console.log(err.name, err.stack)
    sampledb.close()
    server.close(() => {
        process.exit(1)
    })
})

// ensure graceful shutdown in case sigterm received
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully')
    sampledb.close()
    server.close(() => {
        console.log('💥 Process terminated!')
    })
})