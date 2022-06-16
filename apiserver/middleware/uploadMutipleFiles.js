const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/appError');


// without resizing
const diskStorage = multer.diskStorage({
    /*
    destination is used to determine within which folder the uploaded files should be stored.
    This can also be given as a string (e.g. '/tmp/uploads'). If no destination is given,
    the operating system's default directory for temporary files is used.
    */
    destination: (req, file, cb) => {
        cb(null, process.env.IMAGES_DIR);
    },
    /*
    filename is used to determine what the file should be named inside the folder.If not given,
    each file will be given a random name that doesn't include any file extension.
    */
    filename: (req, file, cb) => {
        /* 
        create your own pattern for file names
        you can use the original file name, the current date and time as well as an external lib like uuid
        or session data from req object,
        */
        const fileName = file.fieldname + "-" + uuidv4() + "-" + file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName)
    }
});

// configure memory storage option
const memoryStorage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    /*
    The function should call `cb` with a boolean
    to indicate if the file should be accepted
    */
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        // To accept the file pass `true`, like so:
        cb(null, true);
    } else {
        // To reject this file pass `false`, like so:
        cb(null, false);
        // You can always pass an error if something goes wrong:
        return cb(new AppError(400, 'Only .png, .jpg and .jpeg format allowed!'));
    }
};

// upload multiple files with different names
module.exports = (options, { storage }) => {
    return (req, res, next) => {
        //console.log("first,", options);
        // create upload function with passed arguments(name and count)
        const upload = multer({
            storage: storage && storage === "memory" ? memoryStorage : diskStorage,
            fileFilter: fileFilter
        })
            .fields(options);
        // call upload function immediately and return
        return upload(req, res, function (err) {
            //console.log("first,", req.file);
            if (err) {
                console.log(err)
                // handle file count limit error exclusively
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return next(new AppError(400, 'File Limit/Max File count exceeded!'));
                }
                // handle other errors
                return next(new AppError(400, err.message, err.name, true, err.stack));
            }
            // jump to next middleware if no error
            next()
        })
    }
};

// upload multiple files as an array
// module.exports = (name, maxCount) => {
//     return (req, res, next) => {
//         // create upload function with passed arguments(name and count)
//         const upload = multer({
//             storage: storage,
//             fileFilter: fileFilter
//         }).array(name, maxCount);
//         // call upload function immediately and return
//         return upload(req, res, function (err) {
//             if (err) {
//                 // handle file count limit error exclusively
//                 if (err.code === 'LIMIT_UNEXPECTED_FILE') {
//                     return next(new AppError(400, 'Uploadable file limit exceeded!'));
//                 }
//                 // handle other errors
//                 return next(new AppError(400, err.message, err.name, true, err.stack));
//             }
//             // jump to next middleware if no error
//             next()
//         })
//     }
// };
