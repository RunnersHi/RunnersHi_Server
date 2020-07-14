const config = require("../config/config");
const resMsg = require("../errors.json");
const crypto = require('crypto');
const matchingModel = require('../models/matchingModel');
const authModel = require('../models/authModel');
const app = require('../app');
const io = app.io;
const matching = io.of('/matching');
const auth = matchingModel.auth;

//cipher
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const matchingController = {

};

module.exports = matchingController;