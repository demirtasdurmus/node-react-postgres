module.exports = (db, Sequelize) => {
    const LocationOption = db.define("location_option",
        {
            option: {
                type: Sequelize.ENUM('choose', 'instructor', 'online'),
                allowNull: false,
            },
        }
    );
    return LocationOption;
};
