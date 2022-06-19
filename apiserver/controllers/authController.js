const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { promisify } = require("util");
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');
const cookieService = require("../services/cookieService");
const jwtService = require('../services/jwtService');
const { User, Role } = require('../models');
const { CLIENT_URL } = require('../config');


// register the new user
exports.register = catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;
    // create the new user
    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        passwordConfirm
    });
    // send success response
    res.status(201).send({
        status: "success",
        data: { firstName: newUser.firstName, lastName: newUser.lastName }
    });
});

// verify and login the new user for the first time
exports.verify = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    // verify token & extract user data
    const decoded = await jwtService.verify(token, process.env.JWT_VERIFY_SECRET);
    // fetch user from db
    const user = await User.findOne({
        where: {
            id: decoded.id
        },
        attributes: ["id", "isVerified"],
        include: [Role]
    });
    // verify and login the user only if the user is not verified
    if (user && user.isVerified !== true) {
        user.isVerified = true;
        await user.save({ fields: ["isVerified"] });
        // sign a session token and embed it in the cookie
        const token = await jwtService.sign(
            {
                id: user.id,
                role: user.role.code
            },
            process.env.JWT_SESSION_SECRET,
            process.env.JWT_SESSION_EXPIRY);
        const sessionCookie = await cookieService.encrypt(token);

        // create a cookie expiry date
        const cookieExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // assign the cookie to the response
        res.cookie("__session", sessionCookie, {
            expires: cookieExpiry,
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: process.env.NODE_ENV === "development" ? "Lax" : "Strict"
        });
    };
    res.redirect(`${CLIENT_URL}`);
});

// login user
exports.login = catchAsync(async (req, res, next) => {
    const { email, password, remember } = req.body;
    // check if email and password exist
    if (!email || !password) {
        return next(new AppError(400, 'Please provide email and password!'));
    };
    // check if user exists
    const user = await User.findOne({
        where: { email },
        attributes: ["id", "password", "refreshToken", "isVerified"],
        include: [Role]
    });
    if (!user) {
        return next(new AppError(400, "Incorrect email or password!"));
    };
    // check if password is correct
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
        return next(new AppError(400, "Incorrect email or password!"));
    };
    // check if user is verified
    if (user.isVerified !== true) {
        return next(new AppError(400, "Please verify your email first!"));
    };
    // sign a session token and embed it in the cookie
    const sessionToken = await jwtService.sign(
        {
            id: user.id,
            role: user.role.code
        },
        process.env.JWT_SESSION_SECRET,
        process.env.JWT_SESSION_EXPIRY
    );
    const sessionCookie = await cookieService.encrypt(sessionToken);
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    // assign the cookie to the response
    res.cookie("__session", sessionCookie, {
        expires: sessionExpiry,
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: process.env.NODE_ENV === "development" ? "Lax" : "Strict"
    });
    // send a success message to the client
    res.status(200).send({
        status: "success",
        data: ""
    });
});

// check auth status
exports.checkAuth = catchAsync(async (req, res, next) => {
    const { __session } = req.cookies;
    // check if session cookie exists
    if (!__session) {
        return next(new AppError(401, 'Unauthorized'));
    };
    // decrypt session token from session cookie
    const sessionToken = cookieService.decrypt(__session);
    // verify session token
    const decoded = await promisify(jwt.verify)(sessionToken, process.env.JWT_SESSION_SECRET);
    // fetch user from db
    const user = await User.findOne({
        where: {
            id: decoded.id
        },
        attributes: ["id", "firstName", "lastName", "email", "profileImg"],
        include: [Role]
    });
    // check if user still exists
    if (!user) {
        res.clearCookie("__session");
        return next(new AppError(401, 'The user no longer exists!'));
    };
    // send success response along with user data
    const userData = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        email: user.email,
        profileImg: user.profileImg
    };
    return res.status(200).send({
        status: "success",
        data: userData
    });
});

// logout user
exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie("__session");
    res.status(200).json({ status: 'success', data: '' });
});