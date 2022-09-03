const jwt = require('jsonwebtoken')
const { promisify } = require("util")
const AppError = require("./appError")


module.exports = class JWT {
    constructor() { }

    async sign(data, secret, expiry) {
        if (!data || !secret || !expiry) throw new AppError(400, "Data/secret/expiry must exist", false)
        return await promisify(jwt.sign)(
            data,
            secret,
            {
                expiresIn: expiry
            }
        )
    }

    async verify(token, secret) {
        if (!secret) throw new AppError(400, "Secret must exist", false)
        if (!token || typeof (token) !== 'string') throw new AppError(401, "Invalid session!")
        return await promisify(jwt.verify)(token, secret)
    }

    decode(token) {
        if (!token || typeof (token) !== 'string') return null
        var base64Payload = token.split('.')[1]
        var payload = Buffer.from(base64Payload, 'base64')
        return JSON.parse(payload.toString())
    }
}