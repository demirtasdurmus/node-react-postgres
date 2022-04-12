"use strict";
const bcrypt = require("bcryptjs");
const Sequelize = require("sequelize");
const { sampledb } = require("./db");
const AppError = require("../utils/appError");
const jwToken = require("../services/jwToken");
const sendEmail = require("../services/sendEmail");
const setBaseUrl = require("../utils/setBaseUrl");


const UserInfo = sampledb.define(
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
        is_verified: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        profile_img: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        refresh_token: {
            type: Sequelize.TEXT,
            allowNull: true,
        }
    }
);

// hash password before creating a new user
UserInfo.beforeCreate((user) => {
    try {
        user.password = bcrypt.hashSync(user.password, Number(process.env.PASSWORD_HASH_CYCLE))
    } catch (err) {
        throw new AppError(500, err.message, err.name, false, err.stack);
    }
});

// send a verification email after creating a new user
UserInfo.afterCreate(async (user) => {
    try {
        const token = jwToken.sign({ id: user.id }, process.env.JWT_VERIFY_SECRET, process.env.JWT_VERIFY_EXPIRY);
        const verificationUrl = `${setBaseUrl()}/api/v1/auth/verify/${token}`;
        const name = user.first_name;
        const email = user.email;
        await sendEmail(email, { "name": name, "verificationUrl": verificationUrl }, process.env.SENDGRID_VERIFICATION_TEMPLATE_ID);
    } catch (err) {
        throw new AppError(500, err.message, err.name, false, err.stack);
    }
});

module.exports = UserInfo;
