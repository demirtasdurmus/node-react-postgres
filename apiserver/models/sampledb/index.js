module.exports = (db, Sequelize) => {
    const User = require("./user")(db, Sequelize)
    const Skill = require("./skill")(db, Sequelize)
    const LocationOption = require("./locationOption")(db, Sequelize)
    const Role = require("./role")(db, Sequelize)

    //table relationships
    User.hasMany(Skill);
    Skill.belongsTo(User);

    Role.hasMany(User);
    User.belongsTo(Role);

    Skill.hasMany(LocationOption);
    LocationOption.belongsTo(Skill);

    return {
        User,
        Skill,
        LocationOption,
        Role
    }
};

