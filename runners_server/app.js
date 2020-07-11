const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const debug = require('debug')('runners-server:server');
const http = require('http');
const port = normalizePort(process.env.PORT || '3000');
const app = express();
const server = http.createServer(app);
const indexRouter = require('./routes/index.js');
const errorHandler = require('./handlers/ErrorHandler');
const responseHandler = require('./handlers/responseHandler');

const matchingModel = require('./models/matchingModel');
const authModel = require('./models/authModel');
const auth = matchingModel.auth;
const moment = require('moment');

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

app.set('port', port);

app.io = require('socket.io')(server);
app.io.attach(server);

const matching = app.io.of('/matching');

let roomNum = 1;

matching.on('connection', (socket) => {
    console.log("소켓 사용자 들어왔다 at ", moment().format("YYYY-MM-DD HH:MM:SS"));

    matching.to(socket.id).emit("start", socket.id);

    socket.on('joinRoom', async (token, time, wantGender, leftTime) => {
      console.log(socket.id, " send joinRoom");
      try {
        const user = await (async function decodeToken(token) {
          const userIdx = await authModel.verify(token);
          console.log("userId: ", userIdx);
          let userInfo = await matchingModel.getUserInfo(userIdx);
          userInfo.id = socket.id;
          userInfo.idx = userIdx;
          return userInfo;
        })(token); // user = {id, idx, name, level, gender, image, win, lose}
  
        const targetRoom = Object.entries(socket.adapter.rooms).find((room) => {
          if (room[1].length !== 1 || !room[1].userList) {
            return false;
          }
          else {
            return room[1].userList[0].level === user.level && room[1].leftTime > 0 && room[1].time === time && (room[1].wantGender === user.gender || room[1].wantGender === 3)
          }
        });
  
        if (targetRoom === undefined) {
          socket.join(roomNum, () => {
            socket.adapter.rooms[roomNum].time = time;
            socket.adapter.rooms[roomNum].wantGender = wantGender;
            socket.adapter.rooms[roomNum].leftTime = leftTime;
            socket.adapter.rooms[roomNum].userList = []
            socket.adapter.rooms[roomNum].userList.push(user);
            console.log(socket.adapter.rooms[roomNum]);
            console.log("Give RoomNum: ", roomNum);
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
            matching.to(firstUserId).emit("matched", targetRoomName);
          });
        }
      }
      catch (err) {
        console.log("joinRoom error");
        throw (err);
      }
    });

    socket.on('leaveRoom', (roomName) => {
      console.log(socket.id, " send leaveRoom");
      try {
        socket.leave(roomName, () => {
          matching.to(socket.id).emit("leaveRoom");
        });
      }
      catch(err) {
        console.log("leaveRoom error");
        throw (err);
      }
      
    });

    socket.on('startCount', (roomName) => {
      roomName = roomName.toString();
      console.log(socket.id, " send startCount");
      console.log("Given RoomName: ", roomName);
      try {
        const intervalId = setInterval(function() {
            console.log("Room: ", socket.adapter.rooms[roomName]);
            socket.adapter.rooms[roomName].leftTime -= 3;
            if (socket.adapter.rooms[roomName].leftTime > 0) {
              matching.to(socket.id).emit("timeLeft", socket.adapter.rooms[roomName].leftTime);
            }
            else if (socket.adapter.rooms[roomName].leftTime === 0) {
              matching.to(socket.id).emit("timeOver", roomName);
            }
        }, 3000);
        socket.on("stopCount", (roomName) => {
          clearInterval(intervalId);
          const leftTime = socket.adapter.rooms[roomName].leftTime;
          socket.leave(roomName, () => {
            matching.to(socket.id).emit("stopCount", leftTime);
          });
        });
        socket.on("endCount", (roomName) => {
          clearInterval(intervalId);
          delete socket.adapter.rooms[roomName].leftTime;
          matching.to(roomName).emit("roomFull", roomName);
        });
      }
      catch(err) {
        console.log("startCount error");
        throw (err);
      }
    });

    socket.on('opponentInfo', (roomName) => {
      console.log(socket.id, " send opponentInfo");
      try {
        const opponent = socket.adapter.rooms[roomName].userList.find(user => user.id !== socket.id);
        matching.to(socket.id).emit("opponentInfo", opponent.name, opponent.level, opponent.gender, opponent.win, opponent.lose, opponent.image);
      }
      catch(err) {
        console.log("opponentInfo error");
        throw (err);
      }
    });

    socket.on("readyToRun", (roomName) => {
      console.log(socket.id, " send readyToRun");
      try {
        if (!socket.adapter.rooms[roomName].ready) {
          socket.adapter.rooms[roomName].ready = 1;
        }
        else if (socket.adapter.rooms[roomName].ready === 1) {
          socket.adapter.rooms[roomName].ready++;
        }
        if (socket.adapter.rooms[roomName].ready === 2) {
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
    });

    socket.on("kmPassed", (roomName, km) => {
      console.log(socket.id, " send kmPassed");
      try {
        const opponent = socket.adapter.rooms[roomName].userList.find(user => user.id !== socket.id);
        matching.to(opponent.id).emit("kmPassed", km);
      }
      
      catch(err) {
        console.log("kmPassed error");
        throw(err);
      }
    });

    socket.on("stopRunning", (roomName, distance, time, coordinates, createdTime, endTime) => {
      console.log(socket.id, " send stopRunning");
      const user = socket.adapter.rooms[roomName].userList.find(user => user.id === socket.id);
      const opponent = socket.adapter.rooms[roomName].userList.find(user => user.id !== socket.id);
      try {
        socket.leave("roomName", async () => {
          if (socket.adapter.rooms[roomName].length === 1) {
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
    });

    socket.on("endRunning", (roomName, distance) => {
      console.log(socket.id, " send endRunning");
      try {
        socket.adapter.rooms[roomName].userList.find(user => user.id === socket.id).distance = distance;
        matching.to(socket.id).emit("endRunning", roomName);
      } 
      catch (err) {
        console.log("endRunning error");
        throw(err);
      }
    });

    socket.on("compareResult", (roomName, distance, time, coordinates, createdTime, endTime) => {
      console.log(socket.id, " send compareResult");
      const user = socket.adapter.rooms[roomName].userList.find(user => user.id === socket.id);
      const opponent = socket.adapter.rooms[roomName].userList.find(user => user.id !== socket.id);
      let result;
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
          await matchingModel.storeRunningData(distance, time, coordinates, result, createdTime, endTime, user.idx, socket.adapter.rooms[roomName].gameIdx);
          matching.to(socket.id).emit("compareResult", result);
        })
      } 
      catch (err) {
        console.log("compareResult error");
        throw(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((res, req, next)=>{
    console.log(res.body);
    console.log(res.header);
    next();
});

indexRouter(app);
responseHandler(app);
errorHandler(app);

//여기부분 부터 http server 생성관련인데 초기 설정 어떻게 할지 같이 고민

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


module.exports = app;
