const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');


router
    .get("/", userController.getUsers)
    .get("/:id", userController.getUserById)
    .post("/", userController.createUser)
    .patch("/:id", userController.updateUserById)
    .delete("/:id", userController.deleteUserById)


module.exports = router;