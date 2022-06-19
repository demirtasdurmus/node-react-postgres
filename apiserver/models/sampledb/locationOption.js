module.exports = (db, Sequelize) => {
    const LocationOption = db.define("locationOption",
        {
            option: {
                type: Sequelize.ENUM('choose', 'instructor', 'online'),
                allowNull: false,
            }
        }
    );
    return LocationOption;
};
