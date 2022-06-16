// "use strict";

// const Sequelize = require("sequelize");
// const { sampledb } = require("./db");


// module.exports = sampledb.define(
//     "location_option",
//     {
//         option: {
//             type: Sequelize.ENUM('choose', 'instructor', 'online'),
//             allowNull: false,
//         },
//     }
// );

module.exports = (db, Sequelize) => {
    const LocationOption = db.define(
        "location_option",
        {
            option: {
                type: Sequelize.ENUM('choose', 'instructor', 'online'),
                allowNull: false,
            },
        }
    );
    return LocationOption;
};
