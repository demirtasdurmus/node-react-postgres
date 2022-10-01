const { createCipheriv, createDecipheriv, scryptSync } = require('crypto')
const AppError = require('./appError')
const key = scryptSync(process.env.SESSION_ENCRYPT_SECRET, 'salt', 24)
const iv = Buffer.alloc(16, 0) // Initialization crypto vector


exports.encrypt = (token) => {
    const cipher = createCipheriv(process.env.SESSION_ALGORITHM, key, iv)
    let encrypted = cipher.update(token, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
}

exports.decrypt = (session) => {
    try {
        const decipher = createDecipheriv(process.env.SESSION_ALGORITHM, key, iv)
        let decrypted = decipher.update(session, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    } catch (error) {
        throw new AppError(401, "Unauthorized")
    }
}