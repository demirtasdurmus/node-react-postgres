const AppError = require("../utils/appError");


module.exports = (...roles) => {
    return (req, res, next) => {
        // check if current user is authorized
        if (!roles.includes(req.role)) {
            return next(new AppError('You are not authorized to perform this action!', 403));
        };

        // jump to the next middleware
        next();
    }
};