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

let roomNum = 1;
let time = 300;

matching.on('connection', (socket) => {
    console.log("사용자 들어왔다");

    matching.to(socket.id).emit("start", socket.id);

    socket.on('joinRoom', (token, time, wantGender, leftTime) => {
        userId = await authModel.verify(token);
        userIdx = await matchingModel.getUserIdx(userId);
        userInfo = await matchingModel.getUserInfo(userIdx);

        // socket.join(roomNum, () => {
            
        //     socket.adapter.rooms[roomNum] 
        // })

        matching.to(socket.id).emit("joinRoom", 1);
    });

    socket.on('startCount', (roomName) => {
        setInterval(function() {
            time--;
            matching.to(socket.id).emit("timeLeft", time);
        }, 1000);
    });
});