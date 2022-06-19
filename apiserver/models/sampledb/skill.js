module.exports = (db, Sequelize) => {
    const Skill = db.define("skill",
        {
            category: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            tagLine: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            travelFee: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
        });
    return Skill;
};
