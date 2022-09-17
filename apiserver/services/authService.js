const bcrypt = require("bcryptjs")
const AppError = require("../utils/appError")
const { User, Role } = require('../models')
const { sign, verify } = require("../utils/jwt")
const { encrypt, decrypt } = require("../utils/session")
const { API_URL } = require('../config')


exports.registerUser = async (userInput) => {
    const { firstName, lastName, email, password, passwordConfirm } = userInput
    // create the user
    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        passwordConfirm
    })
    // sign a token
    const data = { id: newUser.id }
    const secret = process.env.JWT_VERIFY_SECRET
    const expiry = process.env.JWT_VERIFY_EXPIRY
    const token = await sign(data, secret, expiry)
    // send a verification email
    const verificationUrl = `${API_URL}/api/${process.env.API_VERSION}/auth/verify/${token}`
    if (process.env.NODE_ENV === "development") {
        console.log("-------------")
        console.log("Linki tarayıcıya yapıştırarak enter a basınız")
        console.log(verificationUrl)
    } else {
        // await new Email(newUser, { verificationUrl }).sendEmailVerification()
    }
    // return limited user info
    return {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        createdAt: newUser.createdAt
    }
}

exports.verifyUser = async (req) => {
    // verify token & extract user data
    const decoded = await verify(req.params.token, process.env.JWT_VERIFY_SECRET)
    // fetch user from db
    const user = await User.findOne({
        where: {
            id: decoded.id
        },
        attributes: ["id", "isVerified"],
        include: [Role]
    })
    // check if the user exists or already verified
    if (!user) throw new AppError(400, "User not found")
    if (user.isVerified) return { session: null, config: null }
    // verify and login the user
    user.isVerified = true
    user.status = 'active'
    await user.save({ fields: ["isVerified", "status"] })
    return await createSession(req, user)
}

exports.loginUser = async (req) => {
    const { email, password, remember } = req.body
    // check if email and password exist
    if (!email || !password) {
        throw new AppError(400, 'Please provide an email and a password')
    }
    // check if user exists
    const user = await User.findOne({
        where: { email },
        attributes: ["id", "password", "isVerified", "status"],
        include: [Role]
    })
    if (!user) {
        throw new AppError(400, 'Incorrect email or password')
    }
    if (user.status === "passive") {
        throw new AppError(400, 'The user no longer exists')
    }
    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
        throw new AppError(400, 'Incorrect email or password')
    }
    // check if user is verified
    if (user.isVerified !== true) {
        throw new AppError(400, 'Please verify your email first')
    }
    return await createSession(req, user)
}

exports.checkUserSession = async (session) => {
    if (!session) throw new AppError(401, 'Invalid Session')
    // decrypt token from session and verify
    const token = decrypt(session)
    const decoded = await verify(token, process.env.JWT_SESSION_SECRET)
    // fetch user from db
    const user = await User.findOne({
        where: {
            id: decoded.id
        },
        attributes: ["id", "firstName", "lastName", "email", "status"],
        include: [
            {
                model: Role,
                required: true,
                attributes: ["id", "name", "code"]
            }
        ],
    })
    // check if user exists and active
    if (!user || user.status !== "active") throw new AppError(401, 'The user no longer exists')
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        status: user.status
    }
}

/*
UTILITY FUNCTIONS
*/
const createSession = async (req, user) => {
    const data = { id: user.id, role: user.role.code }
    const token = await sign(data, process.env.JWT_SESSION_SECRET, process.env.JWT_SESSION_EXPIRY)
    const session = await encrypt(token)
    // create a cookie expiry date in compatible w jwt lifetime
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000 * +process.env.JWT_SESSION_EXPIRY.slice(0, -1))
    const config = {
        expires: expiry,
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict"
    }
    return { session, config }
}