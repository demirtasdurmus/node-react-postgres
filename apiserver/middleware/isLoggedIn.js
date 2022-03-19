const { promisify } = require('util');
const jwtl = require('jsonwebtoken');
const { UserInfo } = require('../models/index');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');


module.exports = catchAsync(async (req, res, next) => {
    const { Tj0yWls, kho5mfT, __session } = req.cookies;
    let currentUser;
    if (Tj0yWls && kho5mfT && __session) {
        // decyript client session to extract data
        var session = Buffer.from(__session, 'base64').toString('ascii');
        if (kho5mfT.includes(process.env.SERVER_UNIFIER) && session.includes(process.env.CLIENT_UNIFIER)) {
            // extract date data assigned by server
            let serverDateData = kho5mfT.split(process.env.SERVER_UNIFIER);
            serverDateData = Buffer.from(serverDateData[1], 'base64').toString('ascii');
            serverDateData = new Date(Number(serverDateData));
            const serverCookieMinute = serverDateData.getMinutes();

            // extract date data assigned by client
            let clientDateData = session.split(process.env.CLIENT_UNIFIER);
            clientDateData = Number(clientDateData[1]) / process.env.CLIENT_DATE_MULTIPLIER
            clientDateData = new Date(Number(clientDateData));
            const clientCookieMinute = clientDateData.getMinutes();

            // compare minutes to validate cookie data
            if (clientCookieMinute === 0) {
                if (serverCookieMinute !== 0 && serverCookieMinute !== 59) {
                    res.clearCookie("Tj0yWls");
                    res.clearCookie("kho5mfT");
                    return next(new AppError(401, 'Unauthorized'));
                };
            } else if (clientCookieMinute - serverCookieMinute > 1) {
                res.clearCookie("Tj0yWls");
                res.clearCookie("kho5mfT");
                return next(new AppError(401, 'Unauthorized'));
            };
            // validate token to extract user data
            const token = Buffer.from(Tj0yWls, 'base64').toString('ascii');
            const decoded = await promisify(jwtl.verify)(token, process.env.JWT_SECRET);
            currentUser = await UserInfo.findOne({ where: { id: decoded.id }, attributes: ["id"] });
        } else {
            res.clearCookie("Tj0yWls");
            res.clearCookie("kho5mfT");
            return next(new AppError(401, 'Unauthorized'));
        };
    } else {
        res.clearCookie("Tj0yWls");
        res.clearCookie("kho5mfT");
        return next(new AppError(401, 'Unauthorized'));
    };
    next();
});