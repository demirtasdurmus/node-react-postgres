const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router
    .post("/register", authController.register)
    .post("/login", authController.login)
    .get("/check-auth", authController.checkAuth)
    .get("/logout", authController.logout)


module.exports = router;