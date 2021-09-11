//#ef LIBRARIES
var express = require('express');
var app = express();
var path = require('path');
var timesyncServer = require('timesync/server');
var httpServer = require('http').createServer(app);
io = require('socket.io').listen(httpServer);
const fs = require('fs');
//#endef END LIBRARIES

//#ef HTTP SERVER
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`Listening on ${ PORT }`));
//#endef END HTTP SERVER

//#ef SERVE STATIC FILES THROUGH EXPRESS
app.use(express.static(path.join(__dirname, '/public')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/pieces/sf004/sf004_launchPage.html'));
});
//#endef END SERVER STATIC FILES

//#ef TIMESYNC SERVER
app.use('/timesync', timesyncServer.requestHandler);
//#endef END TIMESYNC SERVER

//#ef SOCKET IO
io.on('connection', function(socket) {


  //##ef Load Piece from Server Receive and Broadcast
  // Request for load piece from splash page
  socket.on('sf004_loadPieceFromServer', function(data) {
    let pieceId = data.pieceId;
    //joining path of directory
    const directoryPath = path.join(__dirname, 'public/scoreData');
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function(err, files) {
      //handling error
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      //Broadcast list of files in directory
      socket.broadcast.emit('sf004_loadPieceFromServerBroadcast', {
        pieceId: pieceId,
        availableScoreData: files
      });
      socket.emit('sf004_loadPieceFromServerBroadcast', {
        pieceId: pieceId,
        availableScoreDataFiles: files
      });
    }); // fs.readdir(directoryPath, function(err, files)
  }); //socket.on('sf004_loadPieceFromServer', function(data)
  //##endef Load Piece from Server Receive and Broadcast

  //##ef Start Receive and Broadcast
  socket.on('sf004_newStartTimeBroadcast_toServer', function(data) {

    let pieceId = data.pieceId;
    let startTime_epochTime_MS = data.startTime_epochTime_MS;

    socket.broadcast.emit('sf004_newStartTime_fromServer', {
      pieceId: pieceId,
      startTime_epochTime_MS: startTime_epochTime_MS
    });

    socket.emit('sf004_newStartTime_fromServer', {
      pieceId: pieceId,
      startTime_epochTime_MS: startTime_epochTime_MS
    });

  }); // socket.on('sf004_newStartTimeBroadcast_send', function(data) END
  //##endef Start Receive and Broadcast

  //##ef Pause Broadcast
  socket.on('sf004_pause', function(data) {
    let pieceId = data.pieceId;
    let thisPress_pauseState = data.thisPress_pauseState;
    let timeAtPauseBtnPress_MS = data.timeAtPauseBtnPress_MS;

    socket.broadcast.emit('sf004_pause_broadcastFromServer', {
      pieceId: pieceId,
      thisPress_pauseState: thisPress_pauseState,
      timeAtPauseBtnPress_MS: timeAtPauseBtnPress_MS
    });

    socket.emit('sf004_pause_broadcastFromServer', {
      pieceId: pieceId,
      thisPress_pauseState: thisPress_pauseState,
      timeAtPauseBtnPress_MS: timeAtPauseBtnPress_MS
    });

  }); // socket.on('sf004_pause', function(data) END
  //##endef Pause Broadcast

  //##ef Stop Broadcast
  socket.on('sf004_stop', function(data) {
    let pieceId = data.pieceId;

    socket.broadcast.emit('sf004_stop_broadcastFromServer', {
      pieceId: pieceId,
    });

    socket.emit('sf004_stop_broadcastFromServer', {
      pieceId: pieceId,
    });

  }); // socket.on('sf004_stop', function(data) END
  //##endef Stop Broadcast


}); // End Socket IO
//#endef >> END SOCKET IO
