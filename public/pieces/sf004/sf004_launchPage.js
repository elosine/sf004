// #ef VARS
// Panel Dimensions
let w = 305;
let h = 450;
let center = w / 2;
let btnW = w - 40;
let btnPosX = center - (btnW / 2) - 7;

// Boolean
let launchBtnIsActive = false;
//URL Args
let partsToRunAsString = "";
let pieceIdString = "";
let scoreDataFileNameToLoad = "";
// #endef END Vars

// #ef Main Panel
let panel = mkPanel({
  title: 'Soundflow #4 - Launch',
  onwindowresize: true,
  w: w,
  h: h
});
let canvas = panel.content;
// #endef END Main Panel

// #ef Title Text
let title = mkSpan({
  canvas: canvas,
  w: w,
  h: 24,
  top: 8,
  // left: 0,
  text: 'Soundflow #4 - Justin Yang',
  fontSize: 18,
  color: 'rgb(153,255,0)'
});
let titleW = title.getBoundingClientRect().width;
let titlePosX = center - (titleW / 2);
title.style.left = titlePosX.toString() + 'px';
// #endef

// #ef Piece ID Caption
let pieceIDinstructions = mkSpan({
  canvas: canvas,
  top: 50,
  left: 15,
  text: 'Please enter an ID for this performance:',
  fontSize: 16,
  color: 'white'
});
// #endef END Piece ID Caption

//#ef PieceID Input Field
let pieceIDinput = mkInputField({
  canvas: canvas,
  id: 'pieceIDinput',
  w: 90,
  h: 20,
  top: 76,
  left: 15,
  color: 'black',
  fontSize: 18,
});

// #endef END PieceID Input Field

// #ef Select Parts Caption
let selectPartsCaption = mkSpan({
  canvas: canvas,
  top: 114,
  left: 15,
  text: 'Please select the parts to display:',
  fontSize: 16,
  color: 'white'
});
// #endef END Select Parts Caption

// #ef Select Parts Checkboxes
let selectPartsCBs = mkCheckboxesHoriz({
  canvas: canvas,
  numBoxes: 5,
  boxSz: 25,
  gap: 20,
  top: 136,
  left: 20,
  lblArray: ['1', '2', '3', '4', '5'],
  lblClr: 'rgb(153,255,0)',

});
// #endef END Select Parts Checkboxes

//#ef Load Score Data from Server Button

//#ef SOCKET IO
let ioConnection;

if (window.location.hostname == 'localhost') {
  ioConnection = io();
} else {
  ioConnection = io.connect(window.location.hostname);
}
const SOCKET = ioConnection;
//#endef > END SOCKET IO

let loadScoreDataTop = 184;
let loadScoreDataFromServerButton = mkButton({
  canvas: canvas,
  w: w - 40,
  h: 45,
  top: loadScoreDataTop,
  left: 12,
  label: 'Load Score Data',
  fontSize: 24,
  action: function() { // Step 1: send msg to server to request list of names of score data files stored on the server
    if (launchBtnIsActive) {
      SOCKET.emit('sf004_loadPieceFromServer', {
        pieceId: pieceIDinput.value
      });
    }
  }
});
loadScoreDataFromServerButton.style.left = btnPosX.toString() + 'px';
loadScoreDataFromServerButton.className = 'btn btn-1_inactive';

SOCKET.on('sf004_loadPieceFromServerBroadcast', function(data) {

  let requestingId = data.pieceId;

  if (requestingId == pieceIDinput.value) {

    let arrayOfFileNamesFromServer = data.availableScoreDataFiles; // data from SOCKET msg
    let arrayOfMenuItems_lbl_action = [];

    arrayOfFileNamesFromServer.forEach((scoreDataFileNameFromServer) => {

      let temp_label_func_Obj = {};

      if (scoreDataFileNameFromServer != '.DS_Store') { //eliminate the ever present Macintosh hidden file .DS_Store

        temp_label_func_Obj['label'] = scoreDataFileNameFromServer;

        // Step 3: When menu item is chosen, this func loads score data to scoreData variable
        temp_label_func_Obj['action'] = function() {

          scoreDataFileNameToLoad = scoreDataFileNameFromServer;

        } //temp_label_func_Obj['action'] = function() END

        arrayOfMenuItems_lbl_action.push(temp_label_func_Obj);

      } //if (scoreDataFileNameFromServer != '.DS_Store') end

    }); // arrayOfFileNamesFromServer.forEach((scoreDataFileNameFromServer) END

    // Make Drop Down Menu
    let loadScoreDataFromServerMenu = mkMenu({
      canvas: canvas,
      w: w - 48,
      h: 127,
      top: loadScoreDataTop + 63,
      left: 25,
      menuLbl_ActionArray: arrayOfMenuItems_lbl_action
    });
    loadScoreDataFromServerMenu.classList.toggle("show");

  } //if (requestingId == PIECE_ID) end

}); // SOCKET.on('sf004_loadPieceFromServerBroadcast', function(data) end


//#endef END Load Score Data from Server Button

// #ef Launch Button
let launchBtn = mkButton({
  canvas: canvas,
  w: btnW,
  h: 45,
  top: 380,
  left: 12,
  label: 'Launch Score',
  fontSize: 24,
  action: function() {
    if (launchBtnIsActive) {
      location.href = "/pieces/sf004/sf004.html?parts=" + partsToRunAsString + "&id=" + pieceIdString + "&sdfile=" + scoreDataFileNameToLoad;
    }
  }
});
launchBtn.style.left = btnPosX.toString() + 'px';
launchBtn.className = 'btn btn-1_inactive';
// #endef END Launch Button

// #ef Window Event Listeners
//Only activate launch score button if there are inputs to id and parts to display cbs
// #ef checkInputs Func
let checkInputs = function() {
  let pieceIDisEntered = false;
  let partsCbsAreChecked = false;
  if (pieceIDinput.value.length != 0) pieceIDisEntered = true;
  selectPartsCBs.forEach((cbDic, cbix) => {
    if (cbDic.cb.checked) partsCbsAreChecked = true;
  });
  if (pieceIDisEntered && partsCbsAreChecked) {
    launchBtn.className = 'btn btn-1';
    loadScoreDataFromServerButton.className = 'btn btn-1';

    launchBtnIsActive = true;
    pieceIdString = pieceIDinput.value;
    partsToRunAsString = "";
    selectPartsCBs.forEach((cbDic, cbix) => {
      if (cbDic.cb.checked) partsToRunAsString = partsToRunAsString + cbix + ';';
    });
    partsToRunAsString = partsToRunAsString.slice(0, -1); //remove final semi-colon
  } else {
    launchBtnIsActive = false;

    launchBtn.className = 'btn btn-1_inactive';
    loadScoreDataFromServerButton.className = 'btn btn-1_inactive';
  }

}
// #endef END checkInputs Func

window.onclick = function(event) {
  checkInputs();
}
window.onkeyup = function(event) {
  checkInputs();
}
// #endef END Window Event Listeners
