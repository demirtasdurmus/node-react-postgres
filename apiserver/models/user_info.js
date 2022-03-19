"use strict";

const Sequelize = require("sequelize");
const { sampledb } = require("./db");


module.exports = sampledb.define(
    "user_info",
    {
        first_name: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        last_name: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        password: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
    }
);
