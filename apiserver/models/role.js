"use strict";

const Sequelize = require("sequelize");
const { sampledb } = require("./db");


module.exports = sampledb.define(
    "role",
    {
        description: {
            type: Sequelize.ENUM('user', 'admin', 'superAdmin'),
            allowNull: false,
        },
        code: {
            type: Sequelize.STRING(50),
            allowNull: false,
        }
    }
);
