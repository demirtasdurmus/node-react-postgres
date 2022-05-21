const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');

const uploadSingleFile = require('../middleware/uploadSingleFile');
const uploadMutipleFiles = require('../middleware/uploadMutipleFiles');

const resizeSingleImage = require('../middleware/resizeSingleImage');
const resizeMultipleImages = require('../middleware/resizeMultipleImages');


router
    .get("/:id", userController.getUserById)
    .patch("/",
        //uploadSingleFile("profileImg", { storage: "memory" }),
        uploadMutipleFiles([{ name: "profileImg", maxCount: 5 }, { name: "coverImg", maxCount: 3 }], { storage: "memory" }),
        //resizeSingleImage({ width: 100, height: 100, quality: 90, format: "jpeg" }),
        resizeMultipleImages({ width: 100, height: 100, quality: 90, format: "jpeg" }),
        userController.updateUserById)
    .delete("/:id", userController.deleteUserById)

module.exports = router;