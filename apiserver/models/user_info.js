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
            validate: {
                notNull: {
                    msg: "First name is required"
                },
                len: {
                    args: [1, 50],
                    msg: "First name must be between 1 and 50 characters"
                },
            }
        },
        last_name: {
            type: Sequelize.STRING(50),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Last name is required"
                },
                len: {
                    args: [1, 50],
                    msg: "Last name must be between 1 and 50 characters"
                },
            }
        },
        email: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: "Please enter a valid email address",
                },
            }
        },
        password: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Password is required"
                },
            }
        },
        is_verified: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        profile_img: {
            type: Sequelize.STRING(150),
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
