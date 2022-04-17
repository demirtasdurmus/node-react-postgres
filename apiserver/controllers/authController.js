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
        const sessionCookie = await cookies.encrypt(token);

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
    const sessionToken = jwToken.sign(
        {
            id: user.id,
            role: user.role.code
        },
        process.env.JWT_SESSION_SECRET,
        process.env.JWT_SESSION_EXPIRY
    );
    const sessionCookie = await cookies.encrypt(sessionToken);
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    console.log("first session expiry: ", sessionExpiry);

    // assign the cookie to the response
    res.cookie("__session", sessionCookie, {
        expires: sessionExpiry,
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: process.env.NODE_ENV === "development" ? "Lax" : "Strict"
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
    const refreshCookie = await cookies.encrypt(refreshToken);

    // save the refresh token to the db
    user.refresh_token = refreshCookie;
    await user.save();

    // send a success message to the client
    // by adding the refresh token to the response
    // to be added as authorization header in client requests
    res.status(200).send({
        status: "success",
        data: { token: refreshCookie }
    });
});

// check auth status
exports.checkAuth = catchAsync(async (req, res, next) => {
    const { __session } = req.cookies;
    if (__session) {
        // decrypt session token from session cookie
        const sessionToken = cookies.decrypt(__session);
        // verify decrypted session token
        jwt.verify(sessionToken, process.env.JWT_SESSION_SECRET, (err, sessionData) => {
            if (err) {
                // if it is expired, check the refresh token
                if (err.name === 'TokenExpiredError') {
                    const { authorization } = req.headers;
                    if (authorization && authorization.startsWith("Bearer")) {
                        // decrypt refresh token from authorization header
                        const refreshToken = cookies.decrypt(authorization.split(" ")[1]);
                        // verify decrypted refresh token
                        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (error, refreshData) => {
                            // send a 401 error if the refresh token is invalid
                            if (error) {
                                res.clearCookie("__session");
                                return next(new AppError(401, "Session expired!"));
                            };
                            // check if client's remember me preference is true
                            if (refreshData.remember === true) {
                                // get user info from the db with decoded user id from refresh token
                                UserInfo.findOne({
                                    where: { id: refreshData.id },
                                    attributes: ["id", "first_name", "last_name", "refresh_token"],
                                    include: [Role]
                                })
                                    .then((currentUser) => {
                                        // if user is not found, send 401 and clear cookie
                                        if (!currentUser) {
                                            res.clearCookie("__session");
                                            return next(new AppError(401, 'Session expired!'));
                                        };

                                        // if token is not the same as the one in the db, send 401 and clear cookie
                                        if (currentUser.refresh_token !== authorization.split(" ")[1]) {
                                            res.clearCookie("__session");
                                            return next(new AppError(401, 'Simultaneous login detected!'));
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
                                        const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                                        // assign the cookie to the response with appropriate expiry date
                                        res.cookie("__session", sessionCookie, {
                                            expires: sessionExpiry,
                                            httpOnly: true,
                                            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
                                            sameSite: process.env.NODE_ENV === "development" ? "Lax" : "Strict"
                                        });

                                        // 2) send the user info to the client to store in app state
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
                                // if client's remember me preference is false, clear the cookie and send 401
                                res.clearCookie("__session");
                                return next(new AppError(401, "Session expired!"));
                            }
                        });
                    } else {
                        // if there is no appropriate authorization header, clear the cookie and send 401
                        res.clearCookie("__session");
                        return next(new AppError(401, "Session expired!"));
                    }
                } else {
                    // if the session token is invalid(except from expiry), clear the cookie and send 401
                    res.clearCookie("__session");
                    return next(new AppError(401, "Invalid session!"));
                };
            } else {
                // get user info from the db with decoded user id from session token
                UserInfo.findOne({
                    where: { id: sessionData.id },
                    attributes: ["id", "first_name", "last_name"],
                    include: [Role]
                })
                    .then((currentUser) => {
                        // if user is not found, send 401 and clear cookie
                        if (!currentUser) {
                            res.clearCookie("__session");
                            return next(new AppError(401, 'Invalid session!'));
                        };

                        // in this part to enhance security
                        // we can save session token to redis and
                        // check if the session token is valid in redis
                        // and check it each time

                        // send the user info to the client to store in app state
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
        // if there is no session cookie, send 401
        return next(new AppError(401, 'Unauthorized'));
    };
});

// logout user
exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie("__session");
    res.status(200).json({ status: 'success' });
});