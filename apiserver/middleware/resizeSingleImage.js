const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sharp = require('sharp');


module.exports = (name, { width = 500, height = 500, quality = 90, format = "jpeg" }) => {
    return catchAsync(async (req, res, next) => {
        if (!req.file) return next();
        //console.log("first,", req.file);

        req.file.filename = `${name}-${uuidv4()}.${format}`;

        await sharp(req.file.buffer)
            .resize(width, height)
            .toFormat(format)
            .jpeg({ quality: quality })
            .toFile(`${process.env.IMAGES_DIR}/${req.file.filename}`);

        next();
    })
};