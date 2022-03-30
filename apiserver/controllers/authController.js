const bcrypt = require("bcryptjs");
const jwtl = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const signJwtToken = require('../helpers/signJwtToken');
const { UserInfo } = require('../models/index');
const AppError = require("../utils/AppError");


// register the new user
exports.register = catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password, passwordAgain } = req.body;
    // validate user inputs
    if (!firstName || !lastName || !email || !password) {
        return next(new AppError(400, "Please fill all the required fields!"));
    };
    if (password !== passwordAgain) {
        return next(new AppError(400, "Password fields doesn't match!"));
    };
    // check if the user already exists
    const user = await UserInfo.findOne({
        where: {
            email: email,
        },
    });
    if (user) {
        return next(new AppError(400, "This user is already registered!"));
    };
    // create the new user
    const newUser = await UserInfo.create({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: bcrypt.hashSync(password, 8),
    });
    res.status(201).send({
        status: "success",
        data: { id: newUser.id, email: newUser.email }
    });
});

// login user
exports.login = catchAsync(async (req, res, next) => {
    const { email, password, remember } = req.body;

    // check if email and password exist
    if (!email || !password) {
        return next(new AppError(400, 'Please provide email and password!'));
    };

    // check if user exists
    const user = await UserInfo.findOne({ where: { email }, attributes: ["id", "password"] });
    if (!user) {
        return next(new AppError(400, "Incorrect email or password!"));
    };

    // check if password is correct
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
        return next(new AppError(400, "Incorrect email or password!"));
    };

    // sign and send token in cookie if everything is ok
    // encyript jwt token and set it for the cookie
    const token = signJwtToken(user.id);
    const encryptedToken = Buffer.from(token).toString('base64');

    const cookieExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    res.cookie("Tj0yWls", encryptedToken, {
        expires: cookieExpiry,
        //httpOnly: true,
        //secure: true,
        //sameSite: "strict"
    });
    // set user password ro undefined for security
    user.password = undefined;

    res.status(200).send({
        status: "success",
        encryptedToken,
        data: user
    });
});

// check auth status
exports.checkAuth = catchAsync(async (req, res, next) => {
    const { Tj0yWls } = req.cookies;
    let currentUser;
    if (Tj0yWls) {
        // validate token to extract user data
        const token = Buffer.from(Tj0yWls, 'base64').toString('ascii');
        const decoded = await promisify(jwtl.verify)(token, process.env.JWT_SECRET);
        currentUser = await UserInfo.findOne({ where: { id: decoded.id }, attributes: ["id", "first_name", "last_name"] });
        if (currentUser) {
            res.status(200).send({
                status: "success",
                data: currentUser
            });
        } else {
            res.clearCookie("Tj0yWls");
            return next(new AppError(401, 'Unauthorized'));
        }
    } else {
        res.clearCookie("Tj0yWls");
        return next(new AppError(401, 'Unauthorized'));
    };
});

// logout user
exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie("Tj0yWls");
    res.status(200).json({ status: 'success' });
});