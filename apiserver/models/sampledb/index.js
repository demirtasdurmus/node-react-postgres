module.exports = (db, Sequelize) => {
    const UserInfo = require("./user_info")(db, Sequelize)
    const Skill = require("./skill")(db, Sequelize)
    const LocationOption = require("./location_option")(db, Sequelize)
    const Role = require("./role")(db, Sequelize)

    //table relationships
    UserInfo.hasMany(Skill);
    Skill.belongsTo(UserInfo,
        // {
        //     foreignKey: {
        //         name: 'user_info_id',
        //         field: 'user_info_id',
        //     }
        // }
    );

    Role.hasMany(UserInfo);
    UserInfo.belongsTo(Role,
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
        UserInfo,
        Skill,
        LocationOption,
        Role
    }
};

