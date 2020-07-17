const moment = require('moment');
const base64url = require('base64url');
const matchingModel = require('../models/matchingModel');
const authModel = require('../models/authModel');
require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");


let roomNum = 1;
let currentUsers = [];
let disconnectUsers = [];

module.exports = matching => {
    matching.on('connection', socket =>{
        console.log("소켓 사용자 들어왔다 at ", moment().format("LTS"));

        matching.to(socket.id).emit("start", [socket.id]);

        console.log(`Now Socket: `);
        console.table(socket.adapter.rooms);

        setInterval(function(){
            matching.to(socket.id).emit("ping");
        }, 3000);

        socket.on('pong', () => {

        });

        socket.on('joinRoom', async (token, time, wantGender, leftTime) => {
            console.log(`${socket.id} sent joinRoom with time: ${time}, wantGender: ${wantGender}, leftTime: ${leftTime}`);

            if (!token || typeof token !== 'string') {
                console.log("joinRoom token error");
                matching.to(socket.id).emit("error");
            }
            else if (!time || typeof time !== 'number'){
                console.log("joinRoom time error");
                matching.to(socket.id).emit("error");
            }
            else if (!wantGender || typeof wantGender !== 'number') {
                console.log("joinRoom wantGender error");
                matching.to(socket.id).emit("error");
            }
            else if (!leftTime || typeof leftTime !== 'number') {
                console.log("joinRoom leftTime error");
                matching.to(socket.id).emit("error");
            }
            else {
                try {
                    const user = await (async function decodeToken(token) {
                        const userIdx = await authModel.verify(token);
                        let userInfo = await matchingModel.getUserInfo(userIdx);
                        if (typeof userInfo === 'string') {
                            throw(userInfo);
                        }
                        userInfo.id = socket.id;
                        userInfo.idx = userIdx;
                        return userInfo;
                    })(token); // user = {id, idx, name, level, gender, image, win, lose}

                    const targetRoom = Object.entries(socket.adapter.rooms).find((room) => {
                        if (room[1].length !== 1 || !room[1].userList) {
                            return false;
                        }
                        else {
                            return room[1].userList[0].level === user.level && room[1].leftTime > 0 && room[1].time === time && (room[1].wantGender === user.gender || room[1].wantGender === 3);
                        }
                    });

                    if (targetRoom === undefined) {
                        socket.join(roomNum.toString(), () => {
                            socket.adapter.rooms[roomNum].time = time;
                            socket.adapter.rooms[roomNum].wantGender = wantGender;
                            socket.adapter.rooms[roomNum].leftTime = leftTime;
                            socket.adapter.rooms[roomNum].userList = []
                            socket.adapter.rooms[roomNum].userList.push(user);
                            console.log(socket.adapter.rooms[roomNum]);
                            console.log("Give RoomNum: ", roomNum);
                            roomNum = roomNum.toString();
                            matching.to(socket.id).emit("roomCreated", roomNum);
                            roomNum++;
                        });
                    }
                    else {
                        targetRoomName = targetRoom[0]
                        socket.join(targetRoomName, async () => {
                            let firstUserId = socket.adapter.rooms[targetRoomName].userList[0].id;
                            delete socket.adapter.rooms[targetRoomName].wantGender;
                            socket.adapter.rooms[targetRoomName].userList.push(user);
                            socket.adapter.rooms[targetRoomName].gameIdx = await matchingModel.newGameIdx();
                            targetRoomName = targetRoomName.toString();
                            matching.to(firstUserId).emit("matched", targetRoomName);
                        });
                    }
                }
                catch (err) {
                    console.log("joinRoom error");
                    throw (err);
                }
            }
        });

        socket.on('startCount', (roomName) => {
            console.log(`${socket.id} sent startCount with roomName: ${roomName}`);
            if (!roomName || typeof roomName !== 'string') {
                console.log("startCount roomName error");
                matching.to(socket.id).emit("error");
            }
            else {
                try {
                    const intervalId = setInterval(function() {
                        if (!socket.adapter.rooms[roomName]) {
                            clearInterval(intervalId);
                            throw ('Room Not Found');
                        }
                        else {
                            socket.adapter.rooms[roomName].leftTime -= 3;
                            if (socket.adapter.rooms[roomName].leftTime > 0) {
                                matching.to(socket.id).emit("timeLeft", socket.adapter.rooms[roomName].leftTime);
                            }
                            else if (socket.adapter.rooms[roomName].leftTime <= 0) {
                                const user = socket.adapter.rooms[roomName].userList.find(user => user.id === socket.id);
                                const time = socket.adapter.rooms[roomName].time;
                                const wantGender = user.wantGender;
                                const level = user.level;
                                clearInterval(intervalId);
                                socket.leave(roomName, () => {
                                    matching.to(socket.id).emit("timeOver", time, wantGender, level);
                                })
                            }
                        }
                    }, 3000);
                    socket.on("stopCount", (roomName) => {
                        console.log(`${socket.id} sent stopCount with roomName: ${roomName}`);
                        if (!roomName || typeof roomName !== 'string') {
                            console.log("stopCount roomName error");
                            matching.to(socket.id).emit("error");
                        }
                        else {
                            clearInterval(intervalId);
                            const leftTime = socket.adapter.rooms[roomName].leftTime;
                            socket.leave(roomName, () => {
                                matching.to(socket.id).emit("stopCount", leftTime);
                            });
                        }
                    });
                    socket.on("endCount", (roomName) => {
                        console.log(socket.id, " sent endCount in roomName: ", roomName);
                        if (!roomName || typeof roomName !== 'string') {
                            console.log("endCount roomName error");
                            matching.to(socket.id).emit("error");
                        }
                        else {
                            clearInterval(intervalId);
                            delete socket.adapter.rooms[roomName].leftTime;
                            matching.to(roomName).emit("roomFull", roomName);
                        }
                    });
                    socket.on("disconnect", () => {
                        clearInterval(intervalId);
                    });
                }
                catch(err) {
                    console.log("startCount error");
                    throw (err);
                }
            }
        });

        socket.on('opponentInfo', (roomName) => {
            console.log(socket.id, " sent opponentInfo with roomName: ", roomName);
            if (!roomName || typeof roomName !== 'string') {
                console.log('opponentInfo roomName error');
                matching.to(socket.id).emit("error");
            }
            else {
                try {
                    const opponent = socket.adapter.rooms[roomName].userList.find(user => user.id !== socket.id);
                    matching.to(socket.id).emit("opponentInfo", roomName, base64url(opponent.name),
                        opponent.level, opponent.win, opponent.lose, opponent.image);
                }
                catch(err) {
                    throw (err);
                }
            }
        });

        socket.on("readyToRun", (roomName) => {
            console.log(socket.id, " sent readyToRun with roomName: ", roomName);
            if (!roomName || typeof roomName !== 'string') {
                console.log('readyToRun roomName error');
                matching.to(socket.id).emit("error");
            }
            else {
                try {
                    if (!socket.adapter.rooms[roomName].ready) {
                        socket.adapter.rooms[roomName].ready = 1;
                    }
                    else if (socket.adapter.rooms[roomName].ready === 1) {
                        socket.adapter.rooms[roomName].ready = 2;
                    }
                    if (socket.adapter.rooms[roomName].ready === 2) {
                        console.log("매칭 완료");
                        matching.to(roomName).emit("letsRun", roomName);
                    }
                    else {
                        matching.to(socket.id).emit("opponentNotReady");
                    }
                }
                catch(err) {
                    console.log("readyToRun error");
                    throw(err)
                }
            }
        });

        socket.on("kmPassed", (roomName, km) => {
            console.log(`${socket.id} sent kmPassed with roomName: ${roomName}, km: ${km}`);
            if (!roomName || typeof roomName !== 'string') {
                console.log('kmPassed roomName error');
                matching.to(socket.id).emit("error");
            }
            else if (!km || typeof km !== 'number') {
                console.log('kmPassed km error');
                matching.to(socket.id).emit("error");
            }
            else {
                try {
                    const opponent = socket.adapter.rooms[roomName].userList.find(user => user.id !== socket.id);
                    matching.to(opponent.id).emit("kmPassed", km);
                }
                catch(err) {
                    console.log("kmPassed error");
                    throw(err);
                }
            }
        });

        socket.on("stopRunning", (roomName, distance, time, coordinates, createdTime, endTime) => {
            console.log(`${socket.id} sent stopRunning with roomName: ${roomName}, distance: ${distance}, time: ${time}, coordinates: ${coordinates}, createdTime: ${createdTime}, endTime: ${endTime}`);

            if (!roomName || typeof roomName !== 'string') {
                console.log("stopRunning roomName error");
                matching.to(socket.id).emit("error");
            }
            else if (distance !== 0 && !distance || typeof distance !== 'number') {
                console.log("stopRunning distance error");
                matching.to(socket.id).emit("error");
            }
            else if (!time || typeof time !== 'number') {
                console.log('stopRunning time error');
                matching.to(socket.id).emit("error");
            }
            else if (!coordinates || typeof coordinates !== 'object') {
                console.log('stopRunning coordinates error');
                matching.to(socket.id).emit("error");
            }
            else if (!createdTime || typeof createdTime !== 'string') {
                console.log('stopRunning createdTime error');
                matching.to(socket.id).emit("error");
            }
            else if (!endTime || typeof endTime !== 'string') {
                console.log('stopRunning endTime error');
                matching.to(socket.id).emit("error");
            }
            else {
                try {
                    const user = socket.adapter.rooms[roomName].userList.find(user => user.id === socket.id);
                    const opponent = socket.adapter.rooms[roomName].userList.find(user => user.id !== socket.id);
                    socket.leave("roomName", async () => {
                        if (socket.adapter.rooms[roomName].length === 1) {
                            socket.adapter.rooms[roomName].userList.find(user => user.id === socket.id).distance = distance;
                            await matchingModel.storeRunningData(distance, time, coordinates, 3, createdTime, endTime, user.idx, socket.adapter.rooms[roomName].gameIdx);
                            matching.to(opponent.id).emit("opponentStopped", roomName);
                        }
                        else {
                            await matchingModel.storeRunningData(distance, time, coordinates, 4, createdTime, endTime, user.idx, socket.adapter.rooms[roomName].gameIdx);
                        }
                        matching.to(socket.id).emit("stopRunning");
                    })
                }
                catch (err) {
                    console.log("stopRunning error");
                    throw(err);
                }
            }
        });

        socket.on("endRunning", (roomName, distance) => {
            console.log(`${socket.id} sent endRunning with roomName: ${roomName}, distance: ${distance}`);
            if (!roomName || typeof roomName !== 'string') {
                console.log("endRunning roomName error");
                matching.to(socket.id).emit("error");
            }
            else if (distance !== 0 && !distance || typeof distance !== 'number') {
                console.log("endRunning distance error: ", distance);
                matching.to(socket.id).emit("error");
            }
            else {
                try {
                    socket.adapter.rooms[roomName].userList.find(user => user.id === socket.id).distance = distance;
                    if (socket.adapter.rooms[roomName].userList.find(user => user.id !== socket.id).distance >= 0) {
                        matching.to(roomName).emit("endRunning", roomName);
                    }
                }
                catch (err) {
                    console.log("endRunning error");
                    throw(err);
                }
            }
        });

        socket.on("compareResult", (roomName, distance, time, coordinates, createdTime, endTime) => {
            console.log(`${socket.id} sent compareResult with roomName: ${roomName}, distance: ${distance}, time: ${time}, coordinates: ${coordinates}, createdTime: ${createdTime}, endTime: ${endTime}`);
            console.table(coordinates);
            if (!roomName || typeof roomName !== 'string') {
                console.log("compareResult roomName error");
                matching.to(socket.id).emit("error");
            }
            else if (distance !== 0 && !distance || typeof distance !== 'number') {
                console.log("compareResult distance error");
                matching.to(socket.id).emit("error");
            }
            else if (!time || typeof time !== 'number') {
                console.log('compareResult time error');
                matching.to(socket.id).emit("error");
            }
            else if (!coordinates || typeof coordinates !== 'object') {
                console.log('typeof coordinates: ', typeof coordinates);
                console.log('compareResult coordinates error');
                matching.to(socket.id).emit("error");
            }
            else if (!createdTime || typeof createdTime !== 'string') {
                console.log('compareResult createdTime error');
                matching.to(socket.id).emit("error");
            }
            else if (!endTime || typeof endTime !== 'string') {
                console.log('compareResult endTime error');
                matching.to(socket.id).emit("error");
            }
            else {
                const user = socket.adapter.rooms[roomName].userList.find(user => user.id === socket.id);
                const opponent = socket.adapter.rooms[roomName].userList.find(user => user.id !== socket.id);
                let result;
                const gameIdx = socket.adapter.rooms[roomName].gameIdx;
                try {
                    socket.leave("roomName", async () => {
                        if (user.distance > opponent.distance) {
                            result = 1;
                        }
                        else if (user.distance < opponent.distance) {
                            result = 2;
                        }
                        else {
                            result = 5
                        }
                        const runIdx = await matchingModel.storeRunningData(distance, time, coordinates, result, createdTime, endTime, user.idx, socket.adapter.rooms[roomName].gameIdx);
                        matching.to(socket.id).emit("compareResult", gameIdx, runIdx);
                    })
                }
                catch (err) {
                    console.log("compareResult error");
                    throw(err);
                }
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("user disconnected : " + reason);
            const user = currentUsers.find(user => user.id === socket.id);
            currentUsers.splice(currentUsers.indexOf(user), 1);
            console.log(`disconnected user: ${Object.entries(user)}`);
        });
    });

};