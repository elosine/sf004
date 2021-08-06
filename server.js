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


  //#ef LOAD PIECE FROM SERVER
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
      //Send list of files in directory to Splash page
      socket.broadcast.emit('sf004_loadPieceFromServerBroadcast', {
        pieceId: pieceId,
        availableScoreData: files
      });
      socket.emit('sf004_loadPieceFromServerBroadcast', {
        pieceId: pieceId,
        availableScoreDataFiles: files
      });
    });
  });
  //#endef END LOAD PIECE FROM SERVER

  //#ef Set Start Time Broadcast

  socket.on('sf004_newStartTimeBroadcast_toServer', function(data) {
    console.log(data);
    let pieceId = data.pieceId;
    let startTime_epoch = data.startTime_epoch;

    socket.broadcast.emit('sf004_newStartTime_fromServer', {
      pieceId: pieceId,
      startTime_epoch: startTime_epoch
    });

    socket.emit('sf004_newStartTime_fromServer', {
      pieceId: pieceId,
      startTime_epoch: startTime_epoch
    });

  }); // socket.on('sf004_newStartTimeBroadcast_send', function(data) END

  //#endef END Set Start Time Broadcast

}); // End Socket IO

//#endef >> END SOCKET IO
