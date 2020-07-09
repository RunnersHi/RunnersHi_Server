const config = require("../config/config");
const resMsg = require("../errors.json");
const crypto = require('crypto');
const matchingModel = require('../models/matchingModel');
const app = require('../app');
const io = app.io;
const matching = io.of('/matching');
const auth = matchingModel.auth;

//cipher
const jwt = require("jsonwebtoken");
const config = require("../config/config");

let roomNum = 1;
let roomName;
let flag = false;

function auth(token) {
    decoded = jwt.verify(token, config.jwt.cert);
    return decoded.id;
}

matching.on('connection', (socket) => {
    console.log("사용자 들어왔다");

    matching.to(socket.id).emit("start", socket.id);

    socket.on('joinRoom', (token, time, wantGender, leftTime) => {

    });
});