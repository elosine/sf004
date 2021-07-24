// <editor-fold> Global Vars
let partsToRun = [];
let pieceId;
let tempos = [];
// </editor-fold> END Global Vars

// <editor-fold> Init
let init = function() {
  // <editor-fold> URL Args
  let urlArgs = getUrlArgs();
  pieceId = urlArgs.id; //pieceId
  let partsToRunStrArray = urlArgs.parts.split(';');
  partsToRunStrArray.forEach((partNumAsStr) => {
    partsToRun.push(parseInt(partNumAsStr)); //partsToRun
  });
  // </editor-fold> END URL Args

  // <editor-fold> Generate Piece Data
  let generatePieceData = function() {
    // Generate 5 Tempos
    let baseTempo = choose(85, 91, 77);
    let tempoRangeMin = baseTempo - (baseTempo * 0.03);
    let tempoRangeMax = baseTempo + (baseTempo * 0.03);
    for (var i = 0; i < 5; i++) {
      let ttempo = rrand(tempoRangeMin, tempoRangeMax);
      tempos.push(ttempo);
    }
  }
  // </editor-fold> END Generate Piece Data

  // <editor-fold> Score Manager Panel
  let scoreManagerPanel = mkPanel({
    w: 200,
    h: 200,
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
      scoreManagerPanel.reposition({
        my: 'right-bottom',
        at: 'right-bottom',
        offsetY: this.h
      })
    },
    onunsmallified: function() {
      scoreManagerPanel.reposition({
        my: 'right-bottom',
        at: 'right-bottom',
        offsetY: this.offsetY
      })
    }
  });
  // </editor-fold> END Score Manager Panel

  // <editor-fold> Score Manager - Generate New Score Data Button
  let generateNewScoreDataButton = mkButton({
    canvas: scoreManagerPanel.content,
    w: 50,
    h: 50,
    top: 15,
    left: 15,
    label: 'Generate New Score Data',
    fontSize: 13,
    action: {}
  })
  // </editor-fold> END Generate New Score Data Button

} // END init
// </editor-fold> END Init





// <editor-fold>
// </editor-fold> END
