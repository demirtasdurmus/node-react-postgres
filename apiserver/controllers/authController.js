const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const AppError = require("../utils/AppError");
const catchAsync = require('../utils/catchAsync');
const cookies = require("../services/cookies");
const jwToken = require('../services/jwToken');
const setBaseUrl = require("../utils/setBaseUrl");
const { UserInfo, Role } = require('../models/index');


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
    await UserInfo.create({
        first_name: firstName,
        last_name: lastName,
        email: email,
        roleId: 1,
        password: password,
        is_verified: false,
    });
    res.status(201).send({
        status: "success",
        message: "User registered successfully! Please check your email to verify your account!",
    });
});

// verify and login the new user for the first time
exports.verify = catchAsync(async (req, res, next) => {
    const { token } = req.params;

    // verify token & extract user data
    const decoded = await jwToken.verify(token);
    // fetch user from db
    const user = await UserInfo.findOne({
        where: {
            id: decoded.id
        },
        attributes: ["id", "is_verified"],
        include: [Role]
    });

    // update user data
    if (user && user.verify !== true) {
        user.is_verified = true;
        await user.save();

        // sign a session token and embed it in the cookie
        const token = jwToken.sign({ id: user.id, role: user.role.code });
        const sessionCookie = cookies.encyript(token);

        // create a cookie expiry date
        const cookieExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // assign the cookie to the response
        res.cookie("__session", sessionCookie, {
            expires: cookieExpiry,
            httpOnly: process.env.NODE_ENV === "development" ? false : true,
            secure: process.env.NODE_ENV === "development" ? false : true,
            //sameSite: "strict"
        });
    };
    res.redirect(`${setBaseUrl()}`);
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
    const token = signJwtToken(user.id);

    // encyript jwt token and set it for the cookie
    const sessionCookie = cookies.encyript(token);

    // create a cookie expiry date
    const cookieExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // assign the cookie to the response
    res.cookie("__session", sessionCookie, {
        expires: cookieExpiry,
        //httpOnly: true,
        //secure: true,
        //sameSite: "strict"
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
    if (__session && __session.length > 42) {

        // decode jwt token from cookie session and verify
        const token = cookies.decyript(__session);

        // verify decyripted token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // clear cookie and send errors accordingly
                res.clearCookie("__session");
                if (err.name === 'TokenExpiredError') {
                    return next(new AppError(401, "Session expired!"));
                };
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
                    // clear cookie and throw an internal server error
                    res.clearCookie("__session");
                    return next(new AppError(500, err.message, err.name, false, err.stack));
                });
        });
    } else {
        // clear cookie and send errors accordingly
        res.clearCookie("__session");
        return next(new AppError(401, 'Unauthorized'));
    };
});

// logout user
exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie("__session");
    res.status(200).json({ status: 'success' });
});