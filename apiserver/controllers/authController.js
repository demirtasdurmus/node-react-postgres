const catchAsync = require('../utils/catchAsync');
const { CLIENT_URL } = require('../config');
const AuthService = require("../services/authService");
const authService = new AuthService()


// register the new user
exports.register = catchAsync(async (req, res, next) => {
    const user = await authService.registerUser(req.body);
    res.status(201).send({ status: "success", data: user });
});

// verify and login the new user for the first time
exports.verify = catchAsync(async (req, res, next) => {
    const { sessionCookie, sessionExpiry } = await authService.verifyUserAndCreateSession(req.params.token);
    if (sessionCookie) {
        res.cookie(process.env.SESSION_COOKIE_NAME, sessionCookie, {
            expires: sessionExpiry,
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: process.env.NODE_ENV === "development" ? "Lax" : "Strict"
        });
    };
    res.redirect(`${CLIENT_URL}`);
});

// login user
exports.login = catchAsync(async (req, res, next) => {
    const { sessionCookie, sessionExpiry } = await authService.loginUserAndCreateSession(req.body);
    // assign the cookie to the response
    res.cookie(process.env.SESSION_COOKIE_NAME, sessionCookie, {
        expires: sessionExpiry,
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: process.env.NODE_ENV === "development" ? "Lax" : "Strict"
    });
    // send a success message to the client
    res.status(200).send({ status: "success", data: "" });
});

// check auth status
exports.checkAuth = catchAsync(async (req, res, next) => {
    const data = await authService.checkUserSession(req.cookies[process.env.SESSION_COOKIE_NAME]);
    return res.status(200).send({ status: "success", data });
});

// logout user
exports.logout = (req, res, next) => {
    res
        .clearCookie(process.env.SESSION_COOKIE_NAME)
        .status(200).send({ status: 'success', data: '' })
};