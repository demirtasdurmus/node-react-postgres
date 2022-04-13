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
    const decoded = await jwToken.verify(token, process.env.JWT_VERIFY_SECRET);
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
        const token = jwToken.sign(
            {
                id: user.id,
                role: user.role.code
            },
            process.env.JWT_SESSION_SECRET,
            process.env.JWT_SESSION_EXPIRY);
        const sessionCookie = cookies.encrypt(token);

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
    const user = await UserInfo.findOne({
        where: { email },
        attributes: ["id", "password", "refresh_token", "is_verified"],
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
    if (user.is_verified !== true) {
        return next(new AppError(400, "Please verify your email first!"));
    };

    // sign a session token and embed it in the cookie
    const token = jwToken.sign(
        {
            id: user.id,
            role: user.role.code
        },
        process.env.JWT_SESSION_SECRET,
        process.env.JWT_SESSION_EXPIRY
    );
    const sessionCookie = cookies.encrypt(token);

    // create a cookie expiry date
    const cookieExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // assign the cookie to the response
    res.cookie("__session", sessionCookie, {
        expires: cookieExpiry,
        httpOnly: process.env.NODE_ENV === "development" ? false : true,
        secure: process.env.NODE_ENV === "development" ? false : true,
        //sameSite: "strict"
    });

    // sign a refresh token and encrypt it
    const refreshToken = jwToken.sign(
        {
            id: user.id,
            role: user.role.code,
            remember: remember
        },
        process.env.JWT_REFRESH_SECRET,
        process.env.JWT_REFRESH_EXPIRY
    );
    const refreshCookie = cookies.encrypt(refreshToken);

    // save the refresh token to the db
    user.refresh_token = refreshCookie;
    await user.save();

    // send a success message to the client
    res.status(200).send({
        status: "success",
        data: { token: refreshCookie }
    });
});

// check auth status
exports.checkAuth = catchAsync(async (req, res, next) => {
    const { __session } = req.cookies;
    if (__session) {
        // decode jwt token from cookie session and verify
        const sessionToken = cookies.decrypt(__session);
        // verify decrypted session token
        jwt.verify(sessionToken, process.env.JWT_SESSION_SECRET, (err, decoded) => {
            if (err) {
                // if it is expired, check the refresh token
                if (err.name === 'TokenExpiredError') {
                    const { authorization } = req.headers;
                    if (authorization && authorization.startsWith("Bearer")) {
                        // decrypt and verify refresh token
                        const refreshToken = cookies.decrypt(authorization.split(" ")[1]);
                        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (error, data) => {
                            if (error) {
                                res.clearCookie("__session");
                                return next(new AppError(401, "Session expired!"));
                            };
                            // check if remember is true
                            if (data.remember === true) {
                                // get user info from the db and send it to the client
                                UserInfo.findOne({
                                    where: { id: data.id },
                                    attributes: ["id", "first_name", "last_name", "refresh_token"],
                                    include: [Role]
                                })
                                    .then((currentUser) => {
                                        // if user is not found, send 401 and clear cookie
                                        if (!currentUser) {
                                            res.clearCookie("__session");
                                            return next(new AppError(401, 'User not found!'));
                                        };

                                        // if token is not the same as the one in the db, send 401 and clear cookie
                                        if (currentUser.refresh_token !== authorization.split(" ")[1]) {
                                            res.clearCookie("__session");
                                            return next(new AppError(401, 'Unathorized'));
                                        };

                                        // if everything is ok;
                                        // 1) sign a new session token and embed it in the cookie
                                        const sessionToken = jwToken.sign(
                                            {
                                                id: currentUser.id,
                                                role: currentUser.role.code
                                            },
                                            process.env.JWT_SESSION_SECRET,
                                            process.env.JWT_SESSION_EXPIRY
                                        );
                                        const sessionCookie = cookies.encrypt(sessionToken);

                                        // create a cookie expiry date
                                        const cookieExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

                                        // assign the cookie to the response
                                        res.cookie("__session", sessionCookie, {
                                            expires: cookieExpiry,
                                            httpOnly: process.env.NODE_ENV === "development" ? false : true,
                                            secure: process.env.NODE_ENV === "development" ? false : true,
                                            //sameSite: "strict"
                                        });

                                        // 2) send the user info to the client
                                        const userData = {
                                            id: currentUser.id,
                                            firstName: currentUser.first_name,
                                            lastName: currentUser.last_name,
                                            role: currentUser.role.code
                                        };
                                        return res.status(200).send({
                                            status: "success",
                                            data: userData
                                        });
                                    })
                                    .catch((err) => {
                                        // clear cookie and throw an internal server error
                                        res.clearCookie("__session");
                                        return next(new AppError(500, err.message, err.name, false, err.stack));
                                    });
                            } else {
                                res.clearCookie("__session");
                                return next(new AppError(401, "Session expired!"));
                            }
                        });
                    } else {
                        res.clearCookie("__session");
                        return next(new AppError(401, "Session expired!"));
                    }
                } else {
                    res.clearCookie("__session");
                    return next(new AppError(401, "Invalid session!"));
                };
            } else {
                // get user info from the db and send it to the client
                UserInfo.findOne({
                    where: { id: decoded.id },
                    attributes: ["id", "first_name", "last_name"],
                    include: [Role]
                })
                    .then((currentUser) => {
                        if (!currentUser) {
                            res.clearCookie("__session");
                            return next(new AppError(401, 'User not found!'));
                        };
                        const userData = {
                            id: currentUser.id,
                            firstName: currentUser.first_name,
                            lastName: currentUser.last_name,
                            role: currentUser.role.code
                        };
                        return res.status(200).send({
                            status: "success",
                            data: userData
                        });
                    })
                    .catch((err) => {
                        // clear cookie and throw an internal server error
                        res.clearCookie("__session");
                        return next(new AppError(500, err.message, err.name, false, err.stack));
                    });
            }
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