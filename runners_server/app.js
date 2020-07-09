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

let roomNum = 1;
let time = 300;

app.io.on('connection', (socket) => {
    console.log("사용자 들어왔다");

    app.io.to(socket.id).emit("start", socket.id);

    socket.on('joinRoom', (token, time, wantGender, leftTime) => {
        userId = await authModel.verify(token);
        userIdx = await matchingModel.getUserIdx(userId);
        userInfo = await matchingModel.getUserInfo(userIdx);

        // socket.join(roomNum, () => {
            
        //     socket.adapter.rooms[roomNum] 
        // })

        app.io.to(socket.id).emit("joinRoom", 1);
    });

    socket.on('startCount', (roomName) => {
        setInterval(function() {
            time--;
            app.io.to(socket.id).emit("timeLeft", time);
        }, 1000);
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
