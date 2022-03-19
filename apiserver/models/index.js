const UserInfo = require("./user_info");
const Skill = require("./skill");
const LocationOption = require("./location_option");

// table relationships
UserInfo.hasMany(Skill);
Skill.belongsTo(UserInfo);

Skill.hasMany(LocationOption);
LocationOption.belongsTo(Skill);

module.exports = { UserInfo, Skill, LocationOption };
