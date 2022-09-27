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
let serverSidePieceData = []; // <<serverSidePieceData>>[{pieceId:,startTime_epochTime_MS:,pieceClockAdjustment:,pauseState:,timePaused:}]
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
    let pieceClockAdjustment = data.pieceClockAdjustment;
    let pauseState = data.pauseState;
    let timePaused = data.timePaused;

    //find out if the pieceId already exists on serverSidePieceData
    let pieceIdIsUnique = true;
    serverSidePieceData.forEach((serverSideDataObj) => {
      let tId = serverSideDataObj.pieceId;
      if (tId == pieceId) pieceIdIsUnique = false;
    });

    if (pieceIdIsUnique) {

      //Create and populate server side data
      let tObj = {};
      tObj['pieceId'] = pieceId;
      tObj['startTime_epochTime_MS'] = startTime_epochTime_MS;
      tObj['pieceClockAdjustment'] = pieceClockAdjustment;
      tObj['pauseState'] = pauseState;
      tObj['timePaused'] = timePaused;
      serverSidePieceData.push(tObj);

      socket.broadcast.emit('sf004_newStartTime_fromServer', {
        pieceId: pieceId,
        startTime_epochTime_MS: startTime_epochTime_MS,
        serverSidePieceData: serverSidePieceData
      });

      socket.emit('sf004_newStartTime_fromServer', {
        pieceId: pieceId,
        startTime_epochTime_MS: startTime_epochTime_MS,
        serverSidePieceData: serverSidePieceData
      });

    } //if(pieceIdIsUnique)
    //
    else { //if pieceId is already on Server; Send back to clients to create a restart button

      socket.broadcast.emit('sf004_restartPrep_broadcastFromServer', {
        pieceId: pieceId
      });

      socket.emit('sf004_restartPrep_broadcastFromServer', {
        pieceId: pieceId
      });

    } //else{ //if pieceId is already on Server; Send back to create a restart button

  }); // socket.on('sf004_newStartTimeBroadcast_send', function(data) END
  //##endef Start Receive and Broadcast

  //##ef Restart Receive and Broadcast
  socket.on('sf004_restart', function(data) {

    let pieceId = data.pieceId;
    let startTime_epochTime_MS = data.startTime_epochTime_MS;
    let pieceClockAdjustment = data.pieceClockAdjustment;
    let pauseState = data.pauseState;
    let timePaused = data.timePaused;

    //Delete piece data from serverSidePieceData
    serverSidePieceData.forEach((pieceDataObj, pieceDataIx) => {
      if (pieceDataObj.pieceId == pieceId) serverSidePieceData.splice(pieceDataIx, 1);
    });

    //Create and populate server side data
    let tObj = {};
    tObj['pieceId'] = pieceId;
    tObj['startTime_epochTime_MS'] = startTime_epochTime_MS;
    tObj['pieceClockAdjustment'] = pieceClockAdjustment;
    tObj['pauseState'] = pauseState;
    tObj['timePaused'] = timePaused;
    serverSidePieceData.push(tObj);

    socket.broadcast.emit('sf004_restart_broadcastFromServer', {
      pieceId: pieceId,
      startTime_epochTime_MS: startTime_epochTime_MS,
      serverSidePieceData: serverSidePieceData
    });

    socket.emit('sf004_restart_broadcastFromServer', {
      pieceId: pieceId,
      startTime_epochTime_MS: startTime_epochTime_MS,
      serverSidePieceData: serverSidePieceData
    });

  }); // socket.on('sf004_restart' END
  //##endef Restart Receive and Broadcast

  //##ef Pause Broadcast
  socket.on('sf004_pause', function(data) {
    let pieceId = data.pieceId;
    let thisPress_pauseState = data.thisPress_pauseState;
    let timeAtPauseBtnPress_MS = data.timeAtPauseBtnPress_MS;
    let new_pieceClockAdjustment = data.new_pieceClockAdjustment;

    //Update Server Side Data
    serverSidePieceData.forEach((pieceDataObj) => {
      let serverSidePieceId = pieceDataObj.pieceId;
      if (serverSidePieceId == pieceId) {
        pieceDataObj.pauseState = thisPress_pauseState;
        pieceDataObj.timePaused = timeAtPauseBtnPress_MS;
        pieceDataObj.pieceClockAdjustment = new_pieceClockAdjustment;
      }
    });

    socket.broadcast.emit('sf004_pause_broadcastFromServer', {
      pieceId: pieceId,
      thisPress_pauseState: thisPress_pauseState,
      timeAtPauseBtnPress_MS: timeAtPauseBtnPress_MS,
      new_pieceClockAdjustment: new_pieceClockAdjustment
    });

    socket.emit('sf004_pause_broadcastFromServer', {
      pieceId: pieceId,
      thisPress_pauseState: thisPress_pauseState,
      timeAtPauseBtnPress_MS: timeAtPauseBtnPress_MS,
      new_pieceClockAdjustment: new_pieceClockAdjustment
    });

  }); // socket.on('sf004_pause', function(data) END
  //##endef Pause Broadcast

  //##ef Stop Broadcast
  socket.on('sf004_stop', function(data) {
    let pieceId = data.pieceId;

    //Delete piece data from serverSidePieceData
    serverSidePieceData.forEach((pieceDataObj, pieceDataIx) => {
      if (pieceDataObj.pieceId == pieceId) serverSidePieceData.splice(pieceDataIx, 1);
    });

    socket.broadcast.emit('sf004_stop_broadcastFromServer', {
      pieceId: pieceId,
    });

    socket.emit('sf004_stop_broadcastFromServer', {
      pieceId: pieceId,
    });

  }); // socket.on('sf004_stop', function(data) END
  //##endef Stop Broadcast

  //##ef Goto Broadcast
  socket.on('sf004_goto', function(data) {

    let pieceId = data.pieceId;
    let newPieceClockAdjustment = data.newPieceClockAdjustment;

    //Update Server Side Data
    serverSidePieceData.forEach((pieceDataObj) => {
      let serverSidePieceId = pieceDataObj.pieceId;
      if (serverSidePieceId == pieceId) {
        pieceDataObj.pieceClockAdjustment = newPieceClockAdjustment;
      }
    });

    socket.broadcast.emit('sf004_goto_broadcastFromServer', {
      pieceId: pieceId,
      newPieceClockAdjustment: newPieceClockAdjustment
    });

    socket.emit('sf004_goto_broadcastFromServer', {
      pieceId: pieceId,
      newPieceClockAdjustment: newPieceClockAdjustment
    });

  }); // socket.on('sf004_goto' END
  //##endef Goto Broadcast

  //##ef Join Broadcast
  socket.on('sf004_join', function(data) {

    let pieceId = data.pieceId;
    let startTime_epochTime_MS, pieceClockAdjustment, pauseState, timePaused;
    let canBroadcastJoin = false;

    //Retreive  Server Side Data
    serverSidePieceData.forEach((pieceDataObj) => {

      let serverSidePieceId = pieceDataObj.pieceId;

      if (serverSidePieceId == pieceId) { // if the piece id matches for the piece you wish to join

        startTime_epochTime_MS = pieceDataObj.startTime_epochTime_MS;
        pieceClockAdjustment = pieceDataObj.pieceClockAdjustment;
        pauseState = pieceDataObj.pauseState;
        timePaused = pieceDataObj.timePaused;
        canBroadcastJoin = true;
      } // if (serverSidePieceId == pieceId) { // if the piece id matches for the piece you wish to join

    }); // serverSidePieceData.forEach((pieceDataObj)

    if (canBroadcastJoin) {
      socket.broadcast.emit('sf004_join_broadcastFromServer', {
        pieceId: pieceId,
        startTime_epochTime_MS: startTime_epochTime_MS,
        pieceClockAdjustment: pieceClockAdjustment,
        pauseState: pauseState,
        timePaused: timePaused
      });

      socket.emit('sf004_join_broadcastFromServer', {
        pieceId: pieceId,
        startTime_epochTime_MS: startTime_epochTime_MS,
        pieceClockAdjustment: pieceClockAdjustment,
        pauseState: pauseState,
        timePaused: timePaused
      });
    } // if (canBroadcastJoin)

  }); // socket.on('sf004_join' END
  //##endef Join Broadcast


}); // End Socket IO
//#endef >> END SOCKET IO
