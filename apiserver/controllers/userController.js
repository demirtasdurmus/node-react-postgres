const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/catchAsync');
const { UserInfo, Role } = require('../models/index');

exports.getUserById = catchAsync(async (req, res, next) => {
    //TODO:
});

exports.updateUserById = catchAsync(async (req, res, next) => {
    //FIXME: add control for multiple images and sync file names
    const url = req.protocol + '://' + req.get('host');

    await UserInfo.update({
        profile_img: req.file ? url + "/" + req.file.filename : null
    }, {
        where: {
            id: req.userId
        }
    });

    res.status(200).send({ status: "success", message: "Image uploaded successfully!" });

});

exports.deleteUserById = catchAsync(async (req, res, next) => {
    //TODO:
});