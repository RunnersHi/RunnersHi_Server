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
const errorHandler = require('./ErrorHandler');
const responseHandler = require('./responseHandler');

const matchingModel = require('./models/matchingModel');
const authModel = require('./models/authModel');
const auth = matchingModel.auth;

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

app.set('port', port);

app.io = require('socket.io')(server);
app.io.attach(server);

const matching = app.io.of('/matching');

let roomNum = 1;

matching.on('connection', (socket) => {
    console.log("사용자 들어왔다");

    matching.to(socket.id).emit("start", socket.id);

    socket.on('joinRoom', async (token, time, wantGender, leftTime) => {
      const user = await (async function decodeToken(token) {
        const userId = await authModel.verify(token);
        const userIdx = await matchingModel.getUserIdx(userId);
        let userInfo = await matchingModel.getUserInfo(userIdx);
        userInfo.id = socket.id;
        userInfo.idx = userIdx;
        return userInfo;
      })(token); // user = {id, idx, name, level, gender, image, win, lose}

      console.log("USER INFO: ", user);

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
          socket.adapter.rooms[roomNum].userList.push(user);
          matching.to(socket.id).emit("roomCreated", roomNum);
          roomNum++;
        });
      }
      else {
        targetRoomName = targetRoom[0]
        socket.join(targetRoomName, () => {
          let firstUserId = socket.adapter.rooms[targetRoomName].userList[0].id;
          delete socket.adapter.rooms[targetRoomName].wantGender;
          socket.adapter.rooms[targetRoomName].userList.push(user);
          socket.adapter.rooms[targetRoomName].gameIdx = await matchingModel.newGameIdx();
          matching.to(firstUserId).emit("matched", targetRoomName);
        });
      }
    });

    socket.on('leaveRoom', (roomName) => {
      socket.leave(roomName, () => {
        matching.to(socket.id).emit("leaveRoom");
      });
    });

    socket.on('startCount', (roomName) => {
        const intervalId = setInterval(function() {
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
    });

    socket.on('opponentInfo', (roomName) => {
      const opponent = socket.adapter.rooms[roomName].userList.find(user => user.id !== socket.id);
      matching.to(socket.id).emit("opponentInfo", opponent.name, opponent.level, opponent.gender, opponent.win, opponent.lose, opponent.image);
    });

    socket.on("readyToRun", (roomName) => {
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
    });

    socket.on("kmPassed", (roomName, km) => {
      const opponent = socket.adapter.rooms[roomName].userList.find(user => user.id !== socket.id);
      matching.to(opponent.id).emit("kmPassed", km);
    });

    socket.on("stopRunning", (roomName, distance, time, coordinates, createdTime, endTime) => {
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
          matching.to(socket.id).emit("stopRunning", roomName);
        })
      } 
      catch (err) {
        console.log("Stop Running Event Error");
        throw(err);
      }
    });

    socket.on("endRunning", (roomName, distance) => {
      try {
        socket.adapter.rooms[roomName].userList.find(user => user.id === socket.id).distance = distance;
        matching.to(socket.id).emit("endRunning", roomName);
      } 
      catch (err) {
        console.log("End Running Event Error");
        throw(err);
      }
    });

    socket.on("compareResult", (roomName, distance, time, coordinates, createdTime, endTime) => {
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
        console.log("Compare Result Event Error");
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
