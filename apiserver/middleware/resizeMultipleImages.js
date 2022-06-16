const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sharp = require('sharp');


module.exports = ({ width = 500, height = 500, quality = 90, format = "jpeg" }) => {
    return catchAsync(async (req, res, next) => {
        if (!req.files) return next();
        // extract image names from req.files
        const imageNames = Object.keys(req.files);

        req.files.filenames = {};

        // loop through image groups
        for (let i = 0; i < imageNames.length; i++) {
            // map each group and resize&save each image
            var arr = []
            await Promise.all(
                req.files[imageNames[i]].map(async file => {
                    const newFilename = `${file.fieldname}-${uuidv4()}.jpeg`;
                    await sharp(file.buffer)
                        .resize(width, height)
                        .toFormat(format)
                        .jpeg({ quality: quality })
                        .toFile(`${process.env.IMAGES_DIR}/${newFilename}`);
                    arr.push(newFilename);
                })
            );
            req.files.filenames[imageNames[i]] = arr;
        }
        next();
    })
};