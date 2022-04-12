const jwt = require('jsonwebtoken');
const { promisify } = require("util");
const AppError = require("../utils/appError");


// sign a jwt token
exports.sign = (data, secret, expiry) => {
    return jwt.sign(data, secret, {
        expiresIn: expiry
    });
};

// verify a jwt token
exports.verify = async (token, secret) => {
    // verify jwt token
    try {
        if (!token || typeof (token) !== 'string') {
            throw new AppError(401, "Invalid session!");
        };
        const decoded = await promisify(jwt.verify)(token, secret);
        return decoded;
    } catch (err) {
        // throw send errors accordingly
        if (err.name === 'TokenExpiredError') {
            throw new AppError(401, "Session expired!", true, err.name, err.stack);
        };
        throw new AppError(401, "Invalid session!", true, err.name, err.stack);
    };
};

// decode a jwt token
exports.decode = (token) => {
    try {
        if (!token || typeof (token) !== 'string') {
            return null;
        };
        var base64Payload = token.split('.')[1];
        var payload = Buffer.from(base64Payload, 'base64');
        return JSON.parse(payload.toString());
    } catch (e) {
        return null;
    }
};