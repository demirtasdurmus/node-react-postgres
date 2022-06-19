module.exports = (db, Sequelize) => {
    const Skill = db.define("skill",
        {
            category: {
                type: Sequelize.STRING(50),
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "Category is required"
                    },
                    len: {
                        args: [1, 50],
                        msg: "First name must be between 1 and 50 characters"
                    }
                }
            },
            tagLine: {
                type: Sequelize.TEXT,
                allowNull: false,
                validate: {
                    notNull: {
                        msg: "TagLine is required"
                    }
                }
            },
            travelFee: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                validate: {
                    isNumeric: {
                        msg: "Only numeric values are allowed for travel fee!",
                    }
                }
            },
        });
    return Skill;
};
