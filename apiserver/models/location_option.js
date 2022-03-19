"use strict";

const Sequelize = require("sequelize");
const { sampledb } = require("./db");


module.exports = sampledb.define(
    "location_option",
    {
        option: {
            type: Sequelize.ENUM('choose', 'instructor', 'online'),
            allowNull: false,
        },
    }
);
