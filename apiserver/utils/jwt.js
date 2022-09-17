const jwt = require('jsonwebtoken')
const { promisify } = require("util")
const AppError = require("./appError")


exports.sign = async (data, secret, expiry) => {
    if (!data || !secret || !expiry) throw new AppError(500, "Data/secret/expiry must exist", false)
    return await promisify(jwt.sign)(
        data,
        secret,
        {
            expiresIn: expiry
        }
    )
}

exports.verify = async (token, secret) => {
    if (!secret) throw new AppError(500, "Secret must exist", false)
    if (!token || typeof token !== 'string') throw new AppError(401, "Invalid session!")
    return await promisify(jwt.verify)(token, secret)
}

exports.decode = (token) => {
    if (!token || typeof token !== 'string') return null
    var base64Payload = token.split('.')[1]
    var payload = Buffer.from(base64Payload, 'base64')
    return JSON.parse(payload.toString())
}