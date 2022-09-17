const Sequelize = require("sequelize");

// creating the db instance
const sampledb = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    logging: false,
    define: {
        underscored: true, // use snake_case for all fields in the database
        // freezeTableName: true, //stop the auto-pluralization performed by Sequelize
        timestamps: false // don't add timestamps to tables by default (createdAt, updatedAt)
    },
});

// import the models and append them to the db instance
var db = {}
const models = require("./sampledb")(sampledb, Sequelize)
db = { ...models }
db.sampledb = sampledb;

module.exports = db;
