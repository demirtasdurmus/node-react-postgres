const api = require("express").Router();
const isLoggedIn = require("./middleware/isLoggedIn");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");


api.use('/auth', authRoutes);
api.use('/users', userRoutes);
api.use('/skills', isLoggedIn, skillRoutes);


module.exports = api;