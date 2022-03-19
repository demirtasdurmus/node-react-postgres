const catchAsync = require('./../utils/catchAsync');
const { UserInfo } = require('../models/index');

// create crud operations for users
exports.getUsers = catchAsync(async (req, res, next) => {

});

exports.getUserById = catchAsync(async (req, res, next) => {

});

exports.createUser = catchAsync(async (req, res, next) => {
    // create a test user(myself)
    await UserInfo.create({
        first_name: "Durmuş",
        last_name: "Demirtaş"
    });
    res.status(200).send({ status: "success", data: "" })
});

exports.updateUserById = catchAsync(async (req, res, next) => {

});

exports.deleteUserById = catchAsync(async (req, res, next) => {

});