var crypto = require("crypto");

// encrypt a session cookie
exports.encrypt = (token) => {
    try {
        // check if token exists and is a string
        if (!token || typeof (token) !== 'string') {
            return null;
        };
        // encrypt the token with Base64
        const encryptedToken = Buffer.from(token).toString('base64');

        // create a random string and encrypt to prefix the encrypted token
        const randomStringPrefix = crypto.randomBytes(10).toString('hex');
        const encryptedPrefix = Buffer.from(randomStringPrefix).toString('base64');
        const configuredPrefix = encryptedPrefix.slice(0, encryptedPrefix.length - 1); // 27 chars long

        // create a random string and encrypt to inject in the middle of the encrypted token
        const randomStringMiddle = crypto.randomBytes(20).toString('hex');
        const encryptedMiddle = Buffer.from(randomStringMiddle).toString('base64');
        const configuredMiddle = encryptedMiddle.slice(0, encryptedMiddle.length - 2); // 54 chars long

        // create seesion cookie
        const cookie = `${configuredPrefix}${encryptedToken.slice(0, 15)}${configuredMiddle}${encryptedToken.slice(15, encryptedToken.length)}`;

        // return the session cookie
        return cookie;
    } catch (e) {
        return null;
    }
};

// decrypt a session cookie
exports.decrypt = (cookie) => {
    try {
        // check if token exists and is a string, and has the min length to be decrypted
        if (typeof (cookie) !== 'string' || cookie.length < 43) {
            return null;
        };
        // extract encrypted token from the cookie
        const unprefixedCookie = cookie.slice(27, cookie.length);
        const sanitizedCookie = unprefixedCookie.slice(0, 15) + unprefixedCookie.slice(69, unprefixedCookie.length);

        // decrypt the token to ascii
        const token = Buffer.from(sanitizedCookie, 'base64').toString('ascii');

        // return the session cookie
        return token;
    } catch (e) {
        return null;
    };
};