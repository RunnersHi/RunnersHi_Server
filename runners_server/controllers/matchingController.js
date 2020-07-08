const config = require("../config/config");
const resMsg = require("../errors.json");
const crypto = require('crypto');
const authController = require('../controllers/authController');
const app = require('../app');
const io = app.io;
const matching = io.of('/matching');

let roomNum = 1;
let roomName;
let flag = false;

// function  (req, res, next) => {
//     if (!req.headers.token) {
//         return next(401);
//     } else {
//         authModel.auth(req.headers.token, (err, user_idx) => {
//             if (err) {
//                 return next(err);
//             } else {
//                 req.user_idx = user_idx;
//                 return next();
//             }
//         });
//     }
// };

matching.on('connection', (socket) => {
    console.log("사용자 들어왔다");

    matching.to(socket.id).emit("start", socket.id);

    socket.on('joinRoom', (token, time, wantGender, leftTime) => {

    });
});