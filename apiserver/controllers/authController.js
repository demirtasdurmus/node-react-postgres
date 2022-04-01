const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const signJwtToken = require('../services/signJwtToken');
const { UserInfo } = require('../models/index');
const AppError = require("../utils/AppError");
const cookies = require("../services/cookies");


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
    console.log("first", token);
    const sessionCookie = cookies.encyript(token);

    const cookieExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    res.cookie("__session", sessionCookie, {
        expires: cookieExpiry,
        //httpOnly: true,
        //secure: true,
        //sameSite: "strict"
    });
    // set user password ro undefined for security
    user.password = undefined;

    res.status(200).send({
        status: "success",
        token,
        data: user
    });
});

// check auth status
exports.checkAuth = catchAsync(async (req, res, next) => {
    const { __session } = req.cookies;
    if (__session && __session.length > 42) {
        // decode jwt token from cookie session and verify
        const token = cookies.decyript(__session);
        console.log("second", token);
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // send errors accordingly
                res.clearCookie("__session");
                if (err.name === 'TokenExpiredError') {
                    return next(new AppError(401, "Session expired!"));
                }
                return next(new AppError(401, "Invalid session!"));
            };
            // get user info from the db and send it to the client
            UserInfo.findOne({
                where: { id: decoded.id },
                attributes: ["id", "first_name", "last_name"]
            })
                .then((currentUser) => {
                    if (!currentUser) {
                        res.clearCookie("__session");
                        return next(new AppError(401, 'User not found!'));
                    };
                    return res.status(200).send({
                        status: "success",
                        data: currentUser
                    });
                })
                .catch((err) => {
                    res.clearCookie("__session");
                    return next(new AppError(401, 'Unauthorized'));
                });
        });
    } else {
        res.clearCookie("__session");
        return next(new AppError(401, 'Unauthorized'));
    };
});

// logout user
exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie("__session");
    res.status(200).json({ status: 'success' });
});