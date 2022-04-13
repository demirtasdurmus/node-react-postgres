const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');


router
    .get("/:id", userController.getUserById)
    .patch("/", userController.uploadImage.single('profileImg'), userController.updateUserById)
    .delete("/:id", userController.deleteUserById)


module.exports = router;