const bcrypt = require("bcryptjs");
const AppError = require("../../utils/appError");
const jwtService = require("../../services/jwtService");
const EmailService = require("../../services/emailService");
const { API_URL } = require('../../config');


module.exports = (db, Sequelize) => {
    const UserInfo = db.define("user_info",
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
                unique: {
                    msg: 'This user is already registered!'
                },
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
                defaultValue: false,
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
            user.roleId = 1;
        } catch (err) {
            throw new AppError(500, err.message, err.name, false, err.stack);
        }
    });

    // send a verification email after creating a new user
    UserInfo.afterCreate(async (user) => {
        try {
            // send a verification email
            const token = await jwtService.sign({ id: user.id }, process.env.JWT_VERIFY_SECRET, process.env.JWT_VERIFY_EXPIRY);
            const verificationUrl = `${API_URL}/api/${process.env.API_VERSION}/auth/verify/${token}`;
            await new EmailService(user, { verificationUrl }).sendEmailVerification();
        } catch (err) {
            throw new AppError(500, err.message, err.name, false, err.stack);
        }
    });
    return UserInfo;
};
