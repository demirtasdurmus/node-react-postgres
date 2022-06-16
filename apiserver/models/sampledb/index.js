module.exports = (db, Sequelize) => {
    const UserInfo = require("./user_info")(db, Sequelize)
    const Skill = require("./skill")(db, Sequelize)
    const LocationOption = require("./location_option")(db, Sequelize)
    const Role = require("./role")(db, Sequelize)

    //table relationships
    UserInfo.hasMany(Skill);
    Skill.belongsTo(UserInfo);

    Role.hasMany(UserInfo);
    UserInfo.belongsTo(Role);

    Skill.hasMany(LocationOption);
    LocationOption.belongsTo(Skill);

    return {
        UserInfo,
        Skill,
        LocationOption,
        Role
    }
};

