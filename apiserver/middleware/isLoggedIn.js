const jwt = require('jsonwebtoken');
const { UserInfo, Role } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const cookieService = require("../services/cookieService");
const jwtService = require('../services/jwtService');


module.exports = catchAsync(async (req, res, next) => {
    const { __session } = req.cookies;
    if (__session) {
        // decrypt session token from session cookie
        const sessionToken = cookieService.decrypt(__session);
        // verify decrypted session token
        jwt.verify(sessionToken, process.env.JWT_SESSION_SECRET, (err, sessionData) => {
            if (err) {
                // if it is expired, check the refresh token
                if (err.name === 'TokenExpiredError') {
                    const { authorization } = req.headers;
                    if (authorization && authorization.startsWith("Bearer")) {
                        // decrypt refresh token from authorization header
                        const refreshToken = cookieService.decrypt(authorization.split(" ")[1]);
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
                                    attributes: ["id", "refresh_token"],
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
                                        const sessionToken = jwtService.sign(
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

                                        // 2) assign the user id to the request object and pass it to the next middleware
                                        req.userId = currentUser.id;
                                        return next()
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
                    attributes: ["id"],
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

                        // assign the user id to the request object and pass it to the next middleware
                        req.userId = currentUser.id;
                        return next();
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