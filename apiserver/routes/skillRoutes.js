const router = require('express').Router();
const skillController = require('../controllers/skillController');


router
    .get("/", skillController.getAllSkills)
    .get("/:skillId", skillController.getSkillById)
    .post("/", skillController.createSkill)
    .patch("/:skillId", skillController.updateSkillById)
    .delete("/:skillId", skillController.deleteSkillById)


module.exports = router;