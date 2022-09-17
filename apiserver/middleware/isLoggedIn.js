const catchAsync = require('../utils/catchAsync')
const authService = require("../services/authService")


module.exports = catchAsync(async (req, res, next) => {
    const data = await authService.checkUserSession(req.cookies[process.env.SESSION_COOKIE_NAME])
    req.userId = data.id
    req.role = data.role
    req.user = data
    return next()
})