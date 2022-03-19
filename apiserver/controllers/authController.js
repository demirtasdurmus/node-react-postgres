const bcrypt = require("bcryptjs");
const jwtl = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const signJwtToken = require('../helpers/signJwtToken');
const { UserInfo } = require('../models/index');
const AppError = require("../utils/AppError");


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
    const newUser = await UserInfo.create({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: bcrypt.hashSync(password, 8),
    });
    res.status(201).send({
        status: "success",
        data: { id: newUser.id, email: newUser.email }
    });
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
    // encyript jwt token and set it for the first cookie
    // prepare a custom cookie to improve security
    // get remember preference and encyript
    // get date time as ms and encyript
    // store a unique unifier in .env and concat with enyripted data
    // set it as a cookie to clients browser
    const token = signJwtToken(user.id);
    const encryptedToken = Buffer.from(token).toString('base64');

    const cookieExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    res.cookie("Tj0yWls", encryptedToken, {
        expires: cookieExpiry,
        //httpOnly: true,
        //secure: true,
        //sameSite: "strict"
    });

    const rememberPref = remember ? 100000 : 2000000;
    const encryptedRemember = Buffer.from(String(rememberPref)).toString('base64');

    const currentDate = Date.now();
    const encryptedDate = Buffer.from(String(currentDate)).toString('base64');
    const randomUnifier = process.env.SERVER_UNIFIER;

    const concattedData = encryptedRemember.concat(randomUnifier).concat(encryptedDate)

    res.cookie("kho5mfT", concattedData, {
        expires: cookieExpiry,
        //httpOnly: true,
        //secure: true,
        //sameSite: "strict"
    });

    // req.secure || req.headers['x-forwarded-proto'] === 'https',

    user.password = undefined;

    res.status(200).send({
        status: "success",
        token,
        data: user
    });
});

// check auth status
exports.checkAuth = catchAsync(async (req, res, next) => {
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
    res.status(200).send({ status: "success", data: currentUser });
});

// logout user
exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie("Tj0yWls");
    res.clearCookie("kho5mfT");
    res.status(200).json({ status: 'success' });
});