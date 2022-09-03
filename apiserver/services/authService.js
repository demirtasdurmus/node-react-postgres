const bcrypt = require("bcryptjs")
const AppError = require("../utils/appError")
const Cookie = require("../utils/cookie")
const Email = require("../utils/email")
const JWT = require("../utils/jwt")
const { User, Role } = require('../models')
const { API_URL } = require("../config")

module.exports = class AuthService {
    constructor() { }
    registerUser = async (userInput) => {
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
        const token = await new JWT().sign(data, secret, expiry)
        // send a verification email
        const verificationUrl = `${API_URL}/api/${process.env.API_VERSION}/auth/verify/${token}`
        if (process.env.NODE_ENV === "development") {
            console.log("-------------")
            console.log("Linki tarayıcıya yapıştırarak enter a basınız")
            console.log(verificationUrl)
        } else {
            await new Email(newUser, { verificationUrl }).sendEmailVerification()
        }
        // return limited user info
        return {
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            createdAt: newUser.createdAt
        }
    }

    verifyUserAndCreateSession = async (token) => {
        // verify token & extract user data
        const decoded = await new JWT().verify(token, process.env.JWT_VERIFY_SECRET)

        // fetch user from db
        const user = await User.findOne({
            where: {
                id: decoded.id
            },
            attributes: ["id", "isVerified"],
            include: [Role]
        })
        if (!user) {
            throw new AppError(404)
        }
        if (user.isVerified) {
            return { sessionCookie: undefined }
        }
        // verify and login the user only if the user is not verified
        user.isVerified = true
        user.memberStatus = 'active'
        await user.save({ fields: ["isVerified", "memberStatus"] })
        // sign a session token and embed it in the cookie
        return await this.createSession(user)
    }

    loginUserAndCreateSession = async (userInput) => {
        const { email, password, remember } = userInput
        // check if email and password exist
        if (!email || !password) {
            throw new AppError(400, 'Please provide email and password')
        }
        // check if user exists
        const user = await User.findOne({
            where: { email },
            attributes: ["id", "password", "isVerified", "memberStatus"],
            include: [Role]
        })
        if (!user) {
            throw new AppError(400, 'Incorrect email or password')
        }
        if (user.memberStatus === "passive") {
            throw new AppError(400, 'The user no longer exists')
        };
        // check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            throw new AppError(400, 'Incorrect email or password')
        }
        // check if user is verified
        if (user.isVerified !== true) {
            throw new AppError(401, 'Please verify your email first')
        }
        // sign a session token and embed it in the cookie
        return await this.createSession(user)
    }

    checkUserSession = async (session) => {
        if (!session) throw new AppError(401, 'Unauthorized')
        // decrypt token from session and verify
        const sessionToken = new Cookie().decrypt(session)
        const decoded = await new JWT().verify(sessionToken, process.env.JWT_SESSION_SECRET)
        // fetch user from db
        const user = await User.findOne({
            where: {
                id: decoded.id
            },
            attributes: ["id", "firstName", "lastName", "email", "memberStatus"],
            include: [
                { model: Role, attributes: ["id", "name", "code"] }
            ],
        })
        // check if user still exists
        if (!user) {
            throw new AppError(401, 'The user no longer exists')
        }
        // check if user is pacified
        if (user.memberStatus !== "active") {
            throw new AppError(401, 'The user no longer exists')
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role.name,
            email: user.email,
            isSeller: user.isSeller,
            inCommunity: user.inCommunity
        }
    }

    createSession = async (user) => {
        const tokenData = { id: user.id, role: user.role.code }
        const sessionToken = await new JWT().sign(tokenData, process.env.JWT_SESSION_SECRET, process.env.JWT_SESSION_EXPIRY)
        const sessionCookie = await new Cookie().encrypt(sessionToken)
        // create a cookie expiry date in compatible w jwt lifetime
        const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000 * +process.env.JWT_SESSION_EXPIRY.slice(0, -1))
        return { sessionCookie, sessionExpiry }
    }
}
