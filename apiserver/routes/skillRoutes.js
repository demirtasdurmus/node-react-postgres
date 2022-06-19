const router = require('express').Router();
const skillController = require('../controllers/skillController');


router
    .get("/", skillController.getSkillsByUserId)
    .get("/:skillId", skillController.getSkillById)
    .post("/", skillController.createSkill)
    .put("/:skillId", skillController.updateSkillById)
    .delete("/:skillId", skillController.deleteSkillById)


module.exports = router;