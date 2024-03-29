const bcrypt = require("bcryptjs");
const AppError = require("../../utils/appError");


module.exports = (db, Sequelize) => {
    const User = db.define("user",
        {
            firstName: {
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
            lastName: {
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
            passwordConfirm: {
                type: Sequelize.TEXT,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Password Confirm is required"
                    },
                    doPasswordsMatch: function (value) {
                        if (value !== this.password) {
                            throw new AppError(400, "Password fields don't match!");
                        }
                    }
                }
            },
            status: {
                type: Sequelize.ENUM('active', 'passive'),
                allowNull: false,
                defaultValue: 'passive',
            },
            isVerified: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            profileImg: {
                type: Sequelize.STRING(150),
                allowNull: true,
            },
            refreshToken: {
                type: Sequelize.TEXT,
                allowNull: true,
            }
        },
        {
            timestamps: true
        }
    );

    // hash password before creating a new user
    User.beforeCreate((user) => {
        user.password = bcrypt.hashSync(user.password, Number(process.env.PASSWORD_HASH_CYCLE))
        user.roleId = 1;
    });

    // set the password confirm field to static value
    User.afterCreate(async (user) => {
        try {
            user.passwordConfirm = 'confirmed';
            await user.save({ validate: false });
        } catch (err) {
            throw new AppError(500, err.message, err.name, false, err.stack);
        }
    });
    return User;
};
