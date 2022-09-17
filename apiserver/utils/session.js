const crypto = require("crypto")
const { promisify } = require('util')
const AppError = require('./appError')


exports.encrypt = async (token) => {
    // check if token exists and is a string
    if (!token || typeof token !== 'string') throw new AppError(500, "Invalid token to encrypt")
    // encrypt the token with Base64
    const encryptedToken = Buffer.from(token).toString('base64')
    // create a random string and encrypt to prefix the encrypted token
    const randomStringPrefix = await getRandomBytes(10)
    const encryptedPrefix = Buffer.from(randomStringPrefix).toString('base64')
    const configuredPrefix = encryptedPrefix.slice(0, encryptedPrefix.length - 1) // 27 chars long
    // create a random string and encrypt to inject in the middle of the encrypted token
    const randomStringMiddle = await getRandomBytes(20)
    const encryptedMiddle = Buffer.from(randomStringMiddle).toString('base64')
    const configuredMiddle = encryptedMiddle.slice(0, encryptedMiddle.length - 2) // 54 chars long
    // create seesion session
    const session = `${configuredPrefix}${encryptedToken.slice(0, 15)}${configuredMiddle}${encryptedToken.slice(15, encryptedToken.length)}`
    return session
}

exports.decrypt = (session) => {
    // check if token exists and is a string, and has the min length to be decrypted
    if (typeof session !== 'string' || session.length < 43) throw new AppError(401, "Invalid session")
    // extract encrypted token from the session
    const unprefixedSession = session.slice(27, session.length)
    const sanitizedSession = unprefixedSession.slice(0, 15) + unprefixedSession.slice(69, unprefixedSession.length)
    // decrypt the token to ascii
    const token = Buffer.from(sanitizedSession, 'base64').toString('ascii')
    return token
}


/*
UTILITY FUNCTIONS
*/
const getRandomBytes = async (size) => {
    return (await promisify(crypto.randomBytes)(size)).toString('hex')
}