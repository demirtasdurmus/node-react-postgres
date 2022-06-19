const fs = require('fs');
const bcrypt = require("bcryptjs");
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const { User } = require('../models/index');


exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.userId, {
        attributes: ["id", "firstName", "lastName", "email", "profileImg"],
    });
    res.status(200).send({ status: "success", data: user });
});

exports.updateUserProfile = catchAsync(async (req, res, next) => {
    const { firstName, lastName } = req.body;
    // find image to delete if it is to be updated
    if (req.file) {
        // create new image path
        const hostUrl = req.protocol + '://' + req.get('host');
        const profileImg = hostUrl + '/' + req.file.filename;
        const oldUser = await User.findByPk(req.userId);
        if (oldUser.profileImg) {
            // delete old image
            const oldImagePath = `./${process.env.IMAGES_DIR}/${oldUser.profileImg.slice(hostUrl.length + 1)}`;
            // delete image and send response
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    return next(new AppError(500, err.message));
                }
            })
        }
        const user = await User.update({
            firstName,
            lastName,
            profileImg
        }, {
            where: { id: req.userId },
            returning: ['id', 'first_name', "last_name", "profile_img", 'email'],
            plain: true
        });
        return res.status(200).send({ status: "success", data: user[1] });
    };
    const user = await User.update({
        firstName,
        lastName,
    }, {
        where: { id: req.userId },
        returning: ['id', 'first_name', "last_name", "profile_img", 'email'],
        plain: true
    });

    res.status(200).send({ status: "success", data: user[1] });
});

exports.updateUserPassword = catchAsync(async (req, res, next) => {
    const { oldPassword, password, passwordConfirm } = req.body;
    // check if old password exists and is correct
    if (!oldPassword) {
        return next(new AppError(400, "Current password must be provided!"));
    };
    const user = await User.findOne({ where: { id: req.userId }, attributes: ["password"] });
    var passwordIsValid = bcrypt.compareSync(oldPassword, user.password);
    if (!passwordIsValid) {
        return next(new AppError(400, "Current password is incorrect!"));
    };
    // check if password and passwordConfirm match
    if (password !== passwordConfirm) {
        return next(new AppError(400, "Passwords do not match!"));
    }
    // update password
    await User.update(
        { password: bcrypt.hashSync(password, Number(process.env.PASSWORD_HASH_CYCLE)) },
        { where: { id: req.userId } }
    );
    // send success message to client
    res.status(200).send({
        status: "success",
        data: "Password updated successfully!",
    });
});