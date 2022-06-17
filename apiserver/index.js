const dotenv = require("dotenv");

// handling uncaught exceptions
process.on("uncaughtException", err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.stack);
    process.exit(1);
});

// configuring dotenv so Node.js knows where to look
dotenv.config({ path: "./.config.env" });

// creating database instance and connecting
const { sampledb } = require("./models");
const dbs = [sampledb];
// connect and sync db
dbs.map((db) => {
    db.authenticate()
        .then(() => console.log(`connected to ${db.config.database} successfully!`))
        .catch(err => console.log(`unable to connect ${db.config.database}!`, err.message));
    db.sync({ force: false })
        .then(() => console.log(`synced ${db.config.database} successfully!`))
        .catch(err => console.log(`unable to sync ${db.config.database}!`, err.message));
})

// importing express app
const app = require('./app');

// declaring the port variable
const PORT = process.env.PORT || 8000;

// setting up the express server
const server = app.listen(PORT, () => {
    console.log(`Server is awake on port ${PORT}:${process.env.NODE_ENV}`);
});

// handling unhandled rejections
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.stack);
    server.close(() => {
        process.exit(1);
    });
});

// ensuring graceful shutdown in case sigterm received
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});