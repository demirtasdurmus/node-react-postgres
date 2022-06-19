const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { User, Skill, LocationOption } = require('../models/index');


exports.getSkillsByUserId = catchAsync(async (req, res, next) => {
    const skills = await Skill.findAll({
        where: { userId: req.userId },
        include: [
            {
                model: User,
                required: false,
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: LocationOption,
                required: false,
                attributes: ["option"]
            },
        ],
        attributes: ["id", "category", "tagLine", "travelFee"]
    })
    res.status(200).send({ status: "success", data: skills })
});

exports.getSkillById = catchAsync(async (req, res, next) => {
    const { skillId } = req.params;
    const skill = await Skill.findOne({
        where: { id: skillId },
        include: [
            {
                model: LocationOption,
                required: false,
                attributes: ["option"]
            },
        ]
    })
    res.status(200).send({ status: "success", data: skill })
});

exports.createSkill = catchAsync(async (req, res, next) => {
    const { category, tagLine, travelFee, locationOptions } = req.body;
    if (travelFee && locationOptions.indexOf("choose") < 0) {
        return next(new AppError(400, "Travel fee may be specified only if choose method is selected."));
    };
    // create the skill
    const skill = await Skill.create({
        category,
        tagLine,
        travelFee: travelFee || null,
        userId: req.userId
    });
    // create the location options using the skill id
    const optionsArray = locationOptions.map(option => { return { option, skillId: skill.id } });
    await LocationOption.bulkCreate(optionsArray);
    res.status(201).send({ status: "success", data: skill });
});

exports.updateSkillById = catchAsync(async (req, res, next) => {
    const { category, tagLine, travelFee, locationOptions } = req.body;
    const { skillId } = req.params;
    // check if the user is the owner
    const skill = await Skill.findByPk(skillId);
    if (req.userId !== skill.userId) {
        return next(new AppError(401, "Only owner of a skill can update it!!!"))
    };
    // check if travel fee requested properly
    if (travelFee && locationOptions.indexOf("choose") < 0) {
        return next(new AppError(400, "Travel fee may be specified only if choose method is selected."));
    };
    // update the skill
    skill.category = category;
    skill.tagLine = tagLine;
    skill.travelFee = travelFee ? travelFee : null;
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
    res.status(200).send({ status: "success", data: skill });
});

exports.deleteSkillById = catchAsync(async (req, res, next) => {
    const { skillId } = req.params;
    const skill = await Skill.findByPk(skillId);
    if (!skill) {
        return next(new AppError(404, "Skill not found!!!"));
    }
    // check if the user is the owner
    if (req.userId !== skill.userId) {
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