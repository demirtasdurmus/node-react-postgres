const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { UserInfo, Skill, LocationOption } = require('../models/index');


exports.getSkillsByUserId = catchAsync(async (req, res, next) => {
    // extract userId either from the session or from decoded jasonwebtoken
    let userId = 1;
    const skills = await Skill.findAll({
        where: { userInfoId: userId },
        include: [
            {
                model: UserInfo,
                required: false,
            },
            {
                model: LocationOption,
                required: false,
                attributes: ["option"]
            },
        ],
        attributes: ["id", "category", "tag_line", "travel_fee"]

    })
    res.status(200).send({ status: "success", data: skills })
});

exports.getSkillById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // get skill by id
    const skill = await Skill.findOne({
        where: { id: id },
        include: [
            {
                model: LocationOption,
                required: false,
            },
        ]
    })
    res.status(200).send({ status: "success", data: skill })
});

exports.createSkill = catchAsync(async (req, res, next) => {
    // extract userId either from the session of from decoded jasonwebtoken
    let userId = 1;
    const { category, tagLine, travelFee, locationOptions } = req.body;
    if (travelFee && locationOptions.indexOf("choose") < 0) {
        return next(new AppError(400, "You can specify travel fee only if choose method is included in location options"));
    };

    // create the skill
    const skill = await Skill.create({
        category: category,
        tag_line: tagLine,
        travel_fee: travelFee ? travelFee : null,
        userInfoId: userId
    });

    // create the location options using the skill id
    for (let i = 0; i < locationOptions.length; i++) {
        await LocationOption.create({
            option: locationOptions[i],
            skillId: skill.id
        })
    };
    res.status(200).send({ status: "success", data: "" });
});

exports.updateSkillById = catchAsync(async (req, res, next) => {
    // extract userId either from the session of from decoded jasonwebtoken
    let userId = 1;
    const { category, tagLine, travelFee, locationOptions } = req.body;
    const { id } = req.params;
    // check if the user is the owner
    const skill = await Skill.findByPk(id);
    if (userId !== skill.userInfoId) {
        return next(new AppError(401, "Only owner of a skill can update it!!!"))
    };

    // check if travel fee requested properly
    if (travelFee && locationOptions.indexOf("choose") < 0) {
        return next(new AppError(400, "You can specify travel fee only if choose method is included in location options"));
    };

    // update the skill
    skill.category = category;
    skill.tag_line = tagLine;
    skill.travel_fee = travelFee ? travelFee : null;
    await skill.save();

    // update locationOptions for different scenerios
    if (locationOptions.length > 0) {
        const oldOptions = await LocationOption.findAll({
            where: { skillId: skill.id }
        });
        if (oldOptions.length < 1) {
            for (let i = 0; i < locationOptions.length; i++) {
                await LocationOption.create({
                    option: locationOptions[i],
                    skillId: skill.id
                })
            };
        } else {
            let loopTime = oldOptions.length > locationOptions.length ? oldOptions.length : locationOptions.length;
            for (let i = 0; i < loopTime; i++) {
                if (locationOptions[i]) {
                    if (oldOptions.indexOf(locationOptions[i] < 0)) {
                        await LocationOption.create({
                            option: locationOptions[i],
                            skillId: skill.id
                        })
                    }
                };
                if (oldOptions[i]) {
                    if (locationOptions.indexOf(oldOptions[i] < 0)) {
                        await LocationOption.destroy({
                            where: { id: oldOptions[i].id }
                        })
                    }
                };
            };
        }
    };
    res.status(200).send({ status: "success", data: "" });
});

exports.deleteSkillById = catchAsync(async (req, res, next) => {
    // extract userId either from the session of from decoded jasonwebtoken
    let userId = 1;
    const { id } = req.params;
    const skill = await Skill.findByPk(id);
    // check if the user is the owner
    if (userId !== skill.userInfoId) {
        return next(new AppError(401, "Only owner of a skill can update it!!!"))
    };
    // delete location options
    await LocationOption.destroy({
        where: { skillId: skill.id }
    })
    // delete skills
    await skill.destroy();
    res.status(200).send({ status: "success", data: "" });
});