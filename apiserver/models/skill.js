"use strict";

const Sequelize = require("sequelize");
const { sampledb } = require("./db");


module.exports = sampledb.define(
    "skill",
    {
        category: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        tag_line: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        travel_fee: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
        },
    }
);
