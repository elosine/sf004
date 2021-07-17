//<editor-fold> LIBRARIES
var express = require('express');
var app = express();
var path = require('path');
var timesyncServer = require('timesync/server');
var httpServer = require('http').createServer(app);
io = require('socket.io').listen(httpServer);
const fs = require('fs');
//</editor-fold> END LIBRARIES

// set up port
const PORT = process.env.PORT || 5000

//<editor-fold> SERVE STATIC FILES THROUGH EXPRESS
app.use(express.static(path.join(__dirname, '/public')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/pieces/sf004/sf004_launchPage.html'));
});
//</editor-fold> END SERVER STATIC FILES

//Initialize http Server
httpServer.listen(PORT, () => console.log(`Listening on ${ PORT }`));


//<editor-fold> TIMESYNC SERVER
app.use('/timesync', timesyncServer.requestHandler);
//</editor-fold> END TIMESYNC SERVER


//<editor-fold> SOCKET IO
io.on('connection', function(socket) {

  //<editor-fold> START PIECE
  socket.on('sf001_startpiece', function(data) {
    socket.broadcast.emit('sf001_startpiecebroadcast', {});
    socket.emit('sf001_startpiecebroadcast', {});
  });
  //</editor-fold> END START PIECE


  //<editor-fold> STOP
  socket.on('sf001_stop', function(data) {
    socket.emit('sf001_stopBroadcast', {});
    socket.broadcast.emit('sf001_stopBroadcast', {});
  });
  //</editor-fold> END STOP


  //<editor-fold> PAUSE
  socket.on('sf001_pause', function(data) {
    socket.emit('sf001_pauseBroadcast', {
      pauseState: data.pauseState,
      pauseTime: data.pauseTime
    });
    socket.broadcast.emit('sf001_pauseBroadcast', {
      pauseState: data.pauseState,
      pauseTime: data.pauseTime
    });
  });
  //</editor-fold> END PAUSE


  //<editor-fold> SAVE SCORE TO SERVER
  socket.on('sf001_saveScoreToServer', function(data) {
    var fileName = data.pieceData[0];
    var pieceData = data.pieceData[1];
    var pathStr = "/public/pieces/sf001/savedScoreData/" + fileName;
    var filePath = path.join(__dirname, pathStr);
    fs.writeFile(filePath, pieceData, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  });
  //</editor-fold> END SAVE SCORE TO SERVER


  //<editor-fold> LOAD PIECE FROM SERVER
  // Request for load piece from splash page
  socket.on('sf001_loadPieceFromServer', function(data) {
    //joining path of directory
    const directoryPath = path.join(__dirname, 'public/pieces/sf001/savedScoreData');
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function(err, files) {
      //handling error
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      //Send list of files in directory to Splash page
      socket.broadcast.emit('sf001_loadPieceFromServerBroadcast', {
        availableScoreData: files
      });
      socket.emit('sf001_loadPieceFromServerBroadcast', {
        availableScoreDataFiles: files
      });
    });
  });
  //</editor-fold> END LOAD PIECE FROM SERVER


}); // End Socket IO
//</editor-fold> >> END SOCKET IO
