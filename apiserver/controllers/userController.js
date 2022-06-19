const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const { User, Role } = require('../models/index');

exports.getUserById = catchAsync(async (req, res, next) => {
    //TODO:
});

exports.updateUserById = catchAsync(async (req, res, next) => {
    console.log("req.files", req.files.filenames)
    //FIXME: add control for multiple images and sync file names
    const url = req.protocol + '://' + req.get('host');

    await User.update({
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