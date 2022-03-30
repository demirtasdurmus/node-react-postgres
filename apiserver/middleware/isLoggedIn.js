const { promisify } = require('util');
const jwtl = require('jsonwebtoken');
const { UserInfo } = require('../models/index');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');


module.exports = catchAsync(async (req, res, next) => {
    const { Tj0yWls } = req.cookies;
    let currentUser;
    if (Tj0yWls) {
        // validate token to extract user data
        const token = Buffer.from(Tj0yWls, 'base64').toString('ascii');
        const decoded = await promisify(jwtl.verify)(token, process.env.JWT_SECRET);
        currentUser = await UserInfo.findOne({ where: { id: decoded.id }, attributes: ["id"] });
        if (currentUser) {
            next();
        } else {
            res.clearCookie("Tj0yWls");
            return next(new AppError(401, 'Unauthorized'));
        }
    } else {
        res.clearCookie("Tj0yWls");
        return next(new AppError(401, 'Unauthorized'));
    };
});