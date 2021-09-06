// <editor-fold> Global Vars
let partsToRun = [];
let pieceId;
let scoreData;
// </editor-fold> END Global Vars

//<editor-fold> SOCKET IO
let ioConnection;
if (window.location.hostname == 'localhost') {
  ioConnection = io();
} else {
  ioConnection = io.connect(window.location.hostname);
}
const SOCKET = ioConnection;
//</editor-fold> > END SOCKET IO

// <editor-fold> INIT
let init = function() {

  // <editor-fold> URL Args
  let urlArgs = getUrlArgs();
  pieceId = urlArgs.id; //pieceId
  let partsToRunStrArray = urlArgs.parts.split(';');
  partsToRunStrArray.forEach((partNumAsStr) => {
    partsToRun.push(parseInt(partNumAsStr)); //partsToRun
  });
  // </editor-fold> END URL Args

  // <editor-fold> Generate Score Data
  let generateScoreData = function() {
    let tempScoreData = {};
    let tempos = [];
    // Generate 5 Tempos
    let baseTempo = choose(85, 91, 77);
    let tempoRangeMin = baseTempo - (baseTempo * 0.03);
    let tempoRangeMax = baseTempo + (baseTempo * 0.03);
    for (var i = 0; i < 5; i++) {
      let ttempo = rrand(tempoRangeMin, tempoRangeMax);
      tempos.push(ttempo);
    }
    tempScoreData['tempos'] = tempos
    return tempScoreData;
  }
  scoreData = generateScoreData();
  // </editor-fold> END Generate Score Data

  // <editor-fold> SCORE DATA MANAGER

  // <editor-fold> Score Data Manager Panel
  let scoreDataManagerW = 300;
  let scoreDataManagerH = 500;
  let scoreDataManagerPanel = mkPanel({
    w: scoreDataManagerW,
    h: scoreDataManagerH,
    title: 'Score Data Manager',
    ipos: 'right-bottom',
    offsetX: '0px',
    offsetY: '0px',
    autopos: 'none',
    headerSize: 'xs',
    onwindowresize: false,
    contentOverflow: 'hidden',
    clr: 'black',
    onsmallified: function() {
      scoreDataManagerPanel.reposition({
        my: 'right-bottom',
        at: 'right-bottom',
        offsetY: this.h
      })
    },
    onunsmallified: function() {
      scoreDataManagerPanel.reposition({
        my: 'right-bottom',
        at: 'right-bottom',
        offsetY: this.offsetY
      })
    }
  });
  // scoreDataManagerPanel.smallify();
  // </editor-fold> END Score Data Manager Panel

  // <editor-fold> Generate New Score Data
  let generateNewScoreDataButton = mkButton({
    canvas: scoreDataManagerPanel.content,
    w: scoreDataManagerW - 44,
    h: 44,
    top: 15,
    left: 15,
    label: 'Generate New Score Data',
    fontSize: 16,
    action: function() {
      scoreData = generateScoreData();
      console.log(scoreData);
    }
  })
  // </editor-fold> END Generate New Score Data

  // <editor-fold> Save Score Data
  let saveScoreDataButton = mkButton({
    canvas: scoreDataManagerPanel.content,
    w: scoreDataManagerW - 44,
    h: 44,
    top: scoreDataManagerH - 70,
    left: 15,
    label: 'Save Current Score Data',
    fontSize: 16,
    action: function() {
      let scoreDataString = JSON.stringify(scoreData);
      let scoreDataFileName = generateFileNameWdate('sf004');
      downloadStrToHD(scoreDataString, scoreDataFileName, 'text/plain');
    }
  })
  // </editor-fold> END Save Score Data

  // <editor-fold> Load Score Data From File
  let loadScoreDataFromFileButton = mkButton({
    canvas: scoreDataManagerPanel.content,
    w: scoreDataManagerW - 44,
    h: 44,
    top: 80,
    left: 15,
    label: 'Load Score Data From File',
    fontSize: 16,
    //https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js
    action: function() {
      let inputDOM_finderDialogBox = document.createElement('input');
      inputDOM_finderDialogBox.type = 'file';
      inputDOM_finderDialogBox.onchange = inputEventFromFinderDialogBox => {
        //target=input type='file'; files=FileList
        let file = inputEventFromFinderDialogBox.target.files[0];
        let reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = readerEvent => {
          let fileTextContent = readerEvent.target.result;
          scoreData = JSON.parse(fileTextContent); //turn loaded string from file into a javascript dictionary/object
          console.log(scoreData);
        }
      }
      inputDOM_finderDialogBox.click();
    }
  })
  // </editor-fold> END Load Score Data

  //<editor-fold> Load Score Data from Server
  let loadScoreDataFromServerButton = mkButton({
    canvas: scoreDataManagerPanel.content,
    w: scoreDataManagerW - 44,
    h: 44,
    top: 145,
    left: 15,
    label: 'Load Score Data From Server',
    fontSize: 16,
    action: function() { // Step 1: send msg to server to request list of names of score data files stored on the server
      SOCKET.emit('sf004_loadPieceFromServer', {
        pieceId: pieceId
      });
    }
  });
  // Step 2: Server responds with list of file names
  SOCKET.on('sf004_loadPieceFromServerBroadcast', function(data) {
    let requestingId = data.pieceId;
    if (requestingId == pieceId) {
      let arrayOfFileNamesFromServer = data.availableScoreDataFiles;
      let arrayOfMenuItems_lbl_action = [];
      arrayOfFileNamesFromServer.forEach((scoreDataFileNameFromServer) => {
        let temp_label_func_Obj = {};
        if (scoreDataFileNameFromServer != '.DS_Store') { //eliminate the ever present Macintosh hidden file .DS_Store
          temp_label_func_Obj['label'] = scoreDataFileNameFromServer;
          // Step 3: When menu item is chosen, this func loads score data to scoreData variable
          temp_label_func_Obj['action'] = function() {
            let tRequest = new XMLHttpRequest();
            tRequest.open('GET', '/scoreData/' + scoreDataFileNameFromServer, true);
            tRequest.responseType = 'text';
            tRequest.onload = () => {
              scoreData = JSON.parse(tRequest.response);
              console.log(scoreData);
            }
            tRequest.onerror = function() {
              console.log("** An error occurred");
            };
            tRequest.send();
          }
          arrayOfMenuItems_lbl_action.push(temp_label_func_Obj);
        } //if (scoreDataFileNameFromServer != '.DS_Store') end
      });
      // Make Drop Down Menu
      let loadScoreDataFromServerMenu = mkMenu({
        canvas: scoreDataManagerPanel.content,
        w: scoreDataManagerW - 48,
        h: 220,
        top: 207,
        left: 25,
        menuLbl_ActionArray: arrayOfMenuItems_lbl_action
      });
      loadScoreDataFromServerMenu.classList.toggle("show");
    } //if (requestingId == pieceId) end
  }); //    SOCKET.on('sf004_loadPieceFromServerBroadcast', function(data) end
  //</editor-fold> END Load Score Data from Server

  scoreDataManagerPanel.smallify();
  // </editor-fold> END SCORE DATA MANAGER

} // END init
// </editor-fold> END INIT





// <editor-fold>
// </editor-fold> END
