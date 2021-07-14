// MAKE A JSPANEL TO LIST ALL PIECES ------------ >
var w = 420;
var h = 265;
var btnH = 40;
var btnW = 240;
var btnYgap = btnH + 22;
var yStart = 35;
var btnL = 88;
var cbs = [];
var scoreDataFileName = 'flux001_4parts.txt';
// <editor-fold>       <<<< SOCKET IO - SETUP >>>> -------------- //
var ioConnection;
if (window.location.hostname == 'localhost') {
  ioConnection = io();
} else {
  ioConnection = io.connect(window.location.hostname);
}
var socket = ioConnection;
// </editor-fold>      END SOCKET IO - SETUP ///////////////////////
var canvas = mkCanvasDiv('cid', w, h, 'black');
var panel = mkPanel('pid', canvas, w, h, "Soundflow #1a - Score Launcher", ['center-top', '0px', '0px', 'none'], 'xs', true);
var title = mkSpan(canvas, 'mainTitle', w, 24, 8, 105, 'Soundflow #1a - Justin Yang', 18, 'rgb(153,255,0)');
title.style.fontVariant = 'small-caps';
var launchScoreFunc = function() {
  var partsToRun = [];
  var partsStr = "";
  cbs.forEach((it, ix) => {
    if (it[0].checked) {
      partsToRun.push(ix);
    }
  });
  partsToRun.forEach((it, ix) => {
    if (ix == partsToRun.length - 1) {
      partsStr = partsStr + it.toString();
    } else {
      partsStr = partsStr + it.toString() + ";";
    }
  });
  // SCORE PAGE LAUNCHED WITH:
  // parts = '1;3;6'
  // dataFileName = 'soundflow2_2021_2_19_16_3.txt' //text file on server with score data in it loaded in score page

  location.href = "/pieces/sf001/sf001a.html?parts=" + partsStr + "&dataFileName=" + scoreDataFileName;
}
mkButton(canvas, 'ctlsBtn', btnW, btnH, yStart, btnL, 'Launch Score', 14, launchScoreFunc);

//<editor-fold>  < CHECKBOXES >                             //
for (var i = 0; i < 4; i++) {
  var cbar = [];
  var tt, tt2, tl, tl2;
  var cbSpace = 35;
  var cbSpace2 = 34;
  tl = 35;
  tl2 = 18;
  tt = 39 + (cbSpace * (i % 6));
  tt2 = 45 + (cbSpace * (i % 6));
  var cblbl = document.createElement("label");
  cblbl.innerHTML = "P" + i.toString();
  cblbl.style.fontSize = "14px";
  cblbl.style.color = "white";
  cblbl.style.fontFamily = "Lato";
  cblbl.style.position = 'absolute';
  cblbl.style.top = tt2.toString() + 'px';
  cblbl.style.left = tl2.toString() + 'px';
  canvas.appendChild(cblbl);

  var cb = document.createElement("input");
  cb.id = 'cb' + i.toString();
  cb.type = 'checkbox';
  cb.value = '0';
  cb.checked = '';
  cb.style.width = '25px';
  cb.style.height = '25px';
  cb.style.position = 'absolute';
  cb.style.top = tt.toString() + 'px';
  cb.style.left = tl.toString() + 'px';
  canvas.appendChild(cb);
  cbar.push(cb);
  cbar.push(cblbl);
  cbs.push(cbar);
}
//</editor-fold> END CHECKBOXES END

//<editor-fold>  < LOAD SCORE FROM SERVER CTRL PANEL >
// Measurements ------------------- >
var w2 = 300;
var h2 = 190;
var menuW = 280;
var menuH1 = 132;
var btnW2 = menuW;
var btnH2 = 35;
var gap = 8;
var H2 = gap + btnH + menuH1;
var H3 = H2 + gap + btnH + menuH1; //
var loadCP = mkCtrlPanel('load', w2, h2, 'Ld Dat', ['left-top', '0px', '0px', 'none'], 'xs');
var loadCanvas = loadCP.canvas;

var loadPieceFromServerFunc = function() {
  socket.emit('sf001_loadPieceFromServer', {});
}
var loadPieceFromServerBtn = mkButton(loadCanvas, 'loadPieceFromServerButton', btnW2, btnH2, 0, 0, 'Load Score Server', 14, loadPieceFromServerFunc);

socket.on('sf001_loadPieceFromServerBroadcast', function(data) {
  var t_pieceArr = data.availableScoreDataFiles;
  var t_menuArr = [];
  t_pieceArr.forEach((it, ix) => {
    if (it != '.DS_Store') {
      var tar = [];
      tar.push(it);
      var funtt = function() {
        scoreDataFileName = it;
      };
      tar.push(funtt);
      t_menuArr.push(tar);
    }
  });
  serverScoreMenu = mkMenu(loadCanvas, 'serverList', menuW, menuH1, btnH2 + gap, gap, t_menuArr);
  serverScoreMenu.classList.toggle("show");
});
loadCP.panel.smallify();
//</editor-fold> END LOAD SCORE FROM SERVER CTRL PANEL END
