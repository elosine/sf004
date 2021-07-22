// <editor-fold> VARS
// Panel Dimensions
let w = 420;
let h = 254;
let center = w / 2;
// Boolean
let launchBtnIsActive = false;
//URL Args
let partsToRunAsString = "";
let pieceIdString = "";
// </editor-fold> END Vars

// <editor-fold> Main Panel
let panel = mkPanel({
  title: 'Soundflow #4 - Launch',
  onwindowresize: true,
  w: w,
  h: h
});
let canvas = panel.content;
// </editor-fold> END Main Panel

// <editor-fold> Title Text
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
// </editor-fold>

// <editor-fold> Piece ID Caption
let pieceIDinstructions = mkSpan({
  canvas: canvas,
  top: 50,
  left: 15,
  text: 'Please enter an ID for this performance:',
  fontSize: 16,
  color: 'white'
});
// </editor-fold> END Piece ID Caption

//<editor-fold> PieceID Input Field
let pieceIDinput = mkInputField({
  canvas: canvas,
  id: 'pieceIDinput',
  w: 90,
  h: 26,
  top: 43,
  left: 302,
  color: 'black',
  fontSize: 22,
});

// </editor-fold> END PieceID Input Field

// <editor-fold> Select Parts Caption
let selectPartsCaption = mkSpan({
  canvas: canvas,
  top: 95,
  left: 15,
  text: 'Please select the parts to display:',
  fontSize: 16,
  color: 'white'
});
// </editor-fold> END Select Parts Caption

// <editor-fold> Select Parts Checkboxes
let selectPartsCBs = mkCheckboxesHoriz({
  canvas: canvas,
  numBoxes: 5,
  boxSz: 25,
  gap: 20,
  top: 122,
  left: 20,
  lblArray: ['1', '2', '3', '4', '5'],
  lblClr: 'rgb(153,255,0)',

});
// </editor-fold> END Select Parts Checkboxes

// <editor-fold> Launch Button
let btnW = w - 40;
let launchBtn = mkButton({
  canvas: canvas,
  w: btnW,
  h: 45,
  top: 175,
  left: 20,
  label: 'Launch Score',
  fontSize: 24,
  action: function() {
    if (launchBtnIsActive) {
      location.href = "/pieces/sf004/sf004.html?parts=" + partsToRunAsString + "&id=" + pieceIdString;
    }
  }
});
let btnPosX = center - (btnW / 2) - 7;
launchBtn.style.left = btnPosX.toString() + 'px';
launchBtn.className = 'btn btn-1_inactive';
// </editor-fold> END Launch Button

// <editor-fold> Window Event Listeners
//Only activate launch score button if there are inputs to id and parts to display cbs
// <editor-fold> checkInputs Func
let checkInputs = function() {
  let pieceIDisEntered = false;
  let partsCbsAreChecked = false;
  if (pieceIDinput.value.length != 0) pieceIDisEntered = true;
  selectPartsCBs.forEach((cbDic, cbix) => {
    if (cbDic.cb.checked) partsCbsAreChecked = true;
  });
  if (pieceIDisEntered && partsCbsAreChecked) {
    launchBtn.className = 'btn btn-1';
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
  }

}
// </editor-fold> END checkInputs Func

window.onclick = function(event) {
  checkInputs();
}
window.onkeyup = function(event) {
  checkInputs();
}
// </editor-fold> END Window Event Listeners
