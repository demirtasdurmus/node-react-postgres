const Sequelize = require("sequelize");

// creating the auth url
const url = `postgres://${process.env.SAMPLEDB_USER}:${process.env.SAMPLEDB_PASSWORD}@${process.env.SAMPLEDB_ADDRESS}:${process.env.SAMPLEDB_PORT}/${process.env.SAMPLEDB_NAME}`;
// creating the db instance
const sampledb = new Sequelize(url, {
    logging: false,
    dialect: 'postgres',
    define: {
        underscored: true,
        freezeTableName: true,
        timestamps: false
    },
});

module.exports = { sampledb };
// requring models to create if necessary
require("./index");