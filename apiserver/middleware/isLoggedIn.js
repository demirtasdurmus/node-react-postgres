const { promisify } = require("util");
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const cookieService = require("../services/cookieService");


module.exports = catchAsync(async (req, res, next) => {
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
        attributes: ["id", "firstName", "lastName", "email"],
        include: [Role]
    });
    if (!user) {
        res.clearCookie("__session");
        return next(new AppError(401, 'The user no longer exists!'));
    };
    // assign the user id to the request object and pass it to the next middleware
    req.userId = user.id;
    req.role = user.role.name;
    req.user = user;
    return next();
});