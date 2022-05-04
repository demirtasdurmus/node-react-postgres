const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/catchAsync');
const { UserInfo, Role } = require('../models/index');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const DIR = 'images/';

// without resizing
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, DIR);
//     },
//     filename: (req, file, cb) => {
//         const fileName = file.originalname.toLowerCase().split(' ').join('-');
//         cb(null, uuidv4() + '-' + fileName)
//     }
// });

// with resizing
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new AppError(400, 'Only .png, .jpg and .jpeg format allowed!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// upload single file
exports.uploadImage = (name) => {
    return upload.single(name);
};

// resizing image
exports.resizeUserImage = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = DIR + "/" + `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${DIR}/${req.file.filename}`);

    next();
})

// upload multiple files
exports.uploadMultipleImages = (name) => {
    return upload.array(name, 5);
}

// or
// exports.uploadMultipleImages = (name1, name2) => {
//     return upload.fields([
//         { name: name, maxCount: 5 },
//         { name: name2, maxCount: 5 }
//     ]);
// };

exports.resizeMultipleImages = catchAsync(async (req, res, next) => {
    if (!req.files) return next();

    req.file.filename = DIR + "/" + `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.XNAME[0].buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`${DIR}/${req.file.filename}`);

    next();

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