const catchAsync = require('../utils/catchAsync');
const AuthService = require("../services/authService");
const authService = new AuthService()


module.exports = catchAsync(async (req, res, next) => {
    const data = await authService.checkUserSession(req.cookies[process.env.SESSION_COOKIE_NAME]);
    // assign the user id to the request object and pass it to the next middleware
    req.userId = data.id;
    req.role = data.role;
    req.user = data;
    return next();
});