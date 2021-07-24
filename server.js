//<editor-fold> LIBRARIES
var express = require('express');
var app = express();
var path = require('path');
var timesyncServer = require('timesync/server');
var httpServer = require('http').createServer(app);
io = require('socket.io').listen(httpServer);
const fs = require('fs');
//</editor-fold> END LIBRARIES

//<editor-fold> HTTP SERVER
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`Listening on ${ PORT }`));
//</editor-fold> END HTTP SERVER

//<editor-fold> SERVE STATIC FILES THROUGH EXPRESS
app.use(express.static(path.join(__dirname, '/public')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/pieces/sf004/sf004_launchPage.html'));
});
//</editor-fold> END SERVER STATIC FILES

//<editor-fold> TIMESYNC SERVER
app.use('/timesync', timesyncServer.requestHandler);
//</editor-fold> END TIMESYNC SERVER

//<editor-fold> SOCKET IO
io.on('connection', function(socket) {

  //<editor-fold> LOAD PIECE FROM SERVER
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
  //</editor-fold> END LOAD PIECE FROM SERVER

}); // End Socket IO
//</editor-fold> >> END SOCKET IO
