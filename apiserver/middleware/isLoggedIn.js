const jwt = require('jsonwebtoken');
const { UserInfo, Role } = require('../models/index');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const cookies = require("../services/cookies");


module.exports = catchAsync(async (req, res, next) => {
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
                                    attributes: ["id", "refresh_token"],
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
                                        req.userId = currentUser.id
                                        return next()
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
                    attributes: ["id"],
                    include: [Role]
                })
                    .then((currentUser) => {
                        if (!currentUser) {
                            res.clearCookie("__session");
                            return next(new AppError(401, 'User not found!'));
                        };
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
        // clear cookie and send errors accordingly
        res.clearCookie("__session");
        return next(new AppError(401, 'Unauthorized'));
    };
});