module.exports = (db, Sequelize) => {
    const User = require("./user")(db, Sequelize)
    const Skill = require("./skill")(db, Sequelize)
    const LocationOption = require("./locationOption")(db, Sequelize)
    const Role = require("./role")(db, Sequelize)

    //table relationships
    User.hasMany(Skill);
    Skill.belongsTo(User,
        // {
        //     foreignKey: {
        //         name: 'user_info_id',
        //         field: 'user_info_id',
        //     }
        // }
    );

    Role.hasMany(User);
    User.belongsTo(Role,
        // {
        //     foreignKey: {
        //         name: 'role_id',
        //         field: 'role_id',
        //     }
        // }
    );

    Skill.hasMany(LocationOption);
    LocationOption.belongsTo(Skill,
        // {
        //     foreignKey: {
        //         name: 'skill_id',
        //         field: 'skill_id',
        //     }
        // }
    );

    return {
        User,
        Skill,
        LocationOption,
        Role
    }
};

