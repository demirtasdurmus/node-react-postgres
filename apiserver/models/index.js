const UserInfo = require("./user_info");
const Skill = require("./skill");
const LocationOption = require("./location_option");
const Role = require("./role");

// table relationships
UserInfo.hasMany(Skill);
Skill.belongsTo(UserInfo);

Role.hasMany(UserInfo);
UserInfo.belongsTo(Role);

Skill.hasMany(LocationOption);
LocationOption.belongsTo(Skill);

module.exports = { UserInfo, Skill, LocationOption, Role };
