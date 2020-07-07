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

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

app.set('port', port);

let roomNum = 1;
let roomName;
let flag = false;

io = require('socket.io')(server);

io.on("connection", (socket) => {
  setTimeout(sendHeartbeat, 9000);

  io.to(socket.id).emit(start, socket.id);
  
  socket.on("joinRoom", (time, gender) => {
    for (const [key, room] of Object.entries(socket.adapter.rooms)) {
      if (room['time'] === time && room['gender'] === gender && room['length'] === 1) {
        flag = true;
        roomName = key;
        break;
      }
      else {
        flag = false;
      }
    }
    if (flag) {
      socket.join(roomName, () => {
        io.to(roomName)
      });
    }
    else {
      socket.join(roomNum, () => {

      });
      roomNum += 1;
    }
  });

  function sendHeartbeat() {
    setTimeout(sendHeartbeat, 9000);
    app.io.emit("ping", { beat: 1 });
  }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.r = (result, success, message) => {
    res.json({
      status: 200,
      success : success,
      message: message,
      result,
    });
  };
  next();
});

indexRouter(app);
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
