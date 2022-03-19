const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');


router
    .get("/", skillController.getSkillsByUserId)
    .get("/:id", skillController.getSkillById)
    .post("/", skillController.createSkill)
    .put("/:id", skillController.updateSkillById)
    .delete("/:id", skillController.deleteSkillById)


module.exports = router;