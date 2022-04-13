const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/catchAsync');
const { UserInfo, Role } = require('../models/index');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const DIR = 'images/';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName)
    }
});

exports.uploadImage = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new AppError(400, 'Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

exports.getUserById = catchAsync(async (req, res, next) => {

});

exports.updateUserById = catchAsync(async (req, res, next) => {

    const url = req.protocol + '://' + req.get('host');

    await UserInfo.update({
        profile_img: url + "/" + req.file.filename
    }, {
        where: {
            id: req.userId
        }
    });

    res.status(200).send({ status: "success", message: "Image uploaded successfully!" });

});

exports.deleteUserById = catchAsync(async (req, res, next) => {

});