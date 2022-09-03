const { promisify } = require('util')
var crypto = require("crypto");
const AppError = require('./appError');


module.exports = class Cookie {
    constructor() { }

    async getRandomBytes(size) {
        return (await promisify(crypto.randomBytes)(size)).toString('hex');
    }

    async encrypt(token) {
        // check if token exists and is a string
        if (!token || typeof (token) !== 'string') throw new AppError(500, "Invalid token to encrypt")
        // encrypt the token with Base64
        const encryptedToken = Buffer.from(token).toString('base64');
        // create a random string and encrypt to prefix the encrypted token
        const randomStringPrefix = await this.getRandomBytes(10);
        const encryptedPrefix = Buffer.from(randomStringPrefix).toString('base64');
        const configuredPrefix = encryptedPrefix.slice(0, encryptedPrefix.length - 1); // 27 chars long
        // create a random string and encrypt to inject in the middle of the encrypted token
        const randomStringMiddle = await this.getRandomBytes(20);
        const encryptedMiddle = Buffer.from(randomStringMiddle).toString('base64');
        const configuredMiddle = encryptedMiddle.slice(0, encryptedMiddle.length - 2); // 54 chars long
        // create seesion cookie
        const cookie = `${configuredPrefix}${encryptedToken.slice(0, 15)}${configuredMiddle}${encryptedToken.slice(15, encryptedToken.length)}`;
        return cookie;
    };

    decrypt(cookie) {
        // check if token exists and is a string, and has the min length to be decrypted
        if (typeof (cookie) !== 'string' || cookie.length < 43) throw new AppError(401, "Invalid session")
        // extract encrypted token from the cookie
        const unprefixedCookie = cookie.slice(27, cookie.length);
        const sanitizedCookie = unprefixedCookie.slice(0, 15) + unprefixedCookie.slice(69, unprefixedCookie.length);
        // decrypt the token to ascii
        const token = Buffer.from(sanitizedCookie, 'base64').toString('ascii');
        return token;
    };
};