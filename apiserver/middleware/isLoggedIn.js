const jwt = require('jsonwebtoken');
const { UserInfo } = require('../models/index');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');


module.exports = catchAsync(async (req, res, next) => {
    const { __session } = req.cookies;
    if (__session) {
        // decode jwt token from cookie session and verify
        const token = Buffer.from(__session, 'base64').toString('ascii');
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
                    req.currentUser = currentUser;
                    return next();
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