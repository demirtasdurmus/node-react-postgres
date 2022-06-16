module.exports = (db, Sequelize) => {
    const Role = db.define("role",
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
    return Role;
};

