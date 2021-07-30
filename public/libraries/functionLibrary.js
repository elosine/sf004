const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = 'http://www.w3.org/1999/xlink';

// <editor-fold> Colors
let clr_orange = 'rgba(240,75,0,255)';
let clr_brightBlue = 'rgba(56,126,211,255)';
let clr_mustard = 'rgba(244,182,0,255)';
let clr_brightRed = 'rgba(229,42,25,255)';
let clr_green = 'rgba(0,147,92,255)';
let clr_limeGreen = 'rgb(153,255,0)';
let clr_brightGreen = '#31d196';
let clr_navyBlue = 'rgba(28,72,121,255)';
let clr_plum = 'rgba(82,44,85,255)';
let clr_lavander = 'rgba(162,126,198,255)';
let clr_darkRed = '#a60701';
let clr_lightGrey = '#adadb7';
let clr_blueGrey = '#708090';
let clr_lightGreen = '#85b068';
let clr_yellow = 'rgba(254,213,0,255)';
let clr_neonMagenta = "rgb(255, 21, 160)";
// </editor-fold> END Colors

// <editor-fold> mkDivCanvas
let mkDivCanvas = function({
  w = 200,
  h = 200,
  top = 0,
  left = 0,
  clr = 'black'
} = {
  w: 200,
  h: 200,
  clr: 'black',
  top: 0,
  left: 0
}) {
  let t_div = document.createElement("div");
  t_div.style.width = w.toString() + "px";
  t_div.style.height = h.toString() + "px";
  t_div.style.backgroundColor = clr;
  t_div.style.position = 'absolute';
  t_div.style.top = top.toString() + 'px';
  t_div.style.left = left.toString() + 'px';
  return t_div;
}
// </editor-fold> END MAKE CANVAS DIV

// <editor-fold> mkSVGcanvas
let mkSVGcanvas = function({
  w = 200,
  h = 200,
  clr = 'black'
} = {
  w: 200,
  h: 200,
  clr: 'black'
}) {
  let tsvgCanvas = document.createElementNS(SVG_NS, "svg");
  tsvgCanvas.setAttributeNS(null, "width", w);
  tsvgCanvas.setAttributeNS(null, "height", h);
  tsvgCanvas.style.backgroundColor = clr;
  return tsvgCanvas;
}
// </editor-fold> END MAKE SVG CANVAS

// <editor-fold> mkPanel
let mkPanel = function({
  canvasType = 0,
  w = 200,
  h = 200,
  title = 'panel',
  ipos = 'center-top',
  offsetX = '0px',
  offsetY = '0px',
  autopos = 'none',
  headerSize = 'xs',
  onwindowresize = false,
  contentOverflow = 'hidden',
  clr = 'black',
  onsmallified = function() {},
  onunsmallified = function() {},
  canresize = false
} = {
  canvasType: 0, // 0=div;1=svg
  w: 200,
  h: 200,
  title: 'panel',
  ipos: 'center-top',
  offsetX: '0px',
  offsetY: '0px',
  autopos: 'none',
  headerSize: 'xs',
  onwindowresize: false,
  contentOverflow: 'hidden',
  clr: 'black',
  onsmallified: function() {},
  onunsmallified: function() {},
  canresize: false
}) {
  let tempPanel;
  let canvas;
  switch (canvasType) {
    case 0: //div
      canvas = mkDivCanvas({
        w: w,
        h: h,
        clr: clr
      });
      break;
    case 1: //SVG
      canvas = mkSVGcanvas({
        w: w,
        h: h,
        clr: clr
      });
      break;
  }

  jsPanel.create({
    position: {
      my: ipos,
      at: ipos,
      offsetX: offsetX,
      offsetY: offsetY,
      autoposition: autopos
    },
    contentSize: w.toString() + " " + h.toString(),
    header: 'auto-show-hide',
    headerControls: {
      size: headerSize,
      minimize: 'remove',
      maximize: 'remove',
      close: 'remove'
    },
    contentOverflow: contentOverflow,
    headerTitle: title,
    theme: "light",
    content: canvas, //svg canvas lives here
    resizeit: {
      aspectRatio: 'content',
      resize: function(panel, paneldata, e) {}
    },
    onwindowresize: onwindowresize,
    onsmallified: onsmallified,
    onunsmallified: onunsmallified,
    resizeit: {
      disable: !canresize
    },
    callback: function() {
      tempPanel = this;
    }
  });
  return tempPanel;

}

// </editor-fold> END mkPanel

// <editor-fold> mkSpan

let mkSpan = function({
  canvas,
  top = 0,
  left = 0,
  text = 'welcome to the thunderdome',
  fontSize = 14,
  color = 'green',
  bgClr = 'black'
} = {
  canvas,
  top: 0,
  left: 0,
  text: 'welcome to the thunderdome',
  fontSize: 14,
  color: 'green',
  bgClr: 'black'
}) {
  let lbl = document.createElement("span");
  lbl.innerHTML = text;
  lbl.style.fontSize = fontSize.toString() + "px";
  lbl.style.color = color;
  lbl.style.fontFamily = "Lato";
  lbl.style.position = 'absolute';
  lbl.style.top = top.toString() + 'px';
  lbl.style.left = left.toString() + 'px';
  lbl.style.backgroundColor = bgClr;
  lbl.style.padding = '0px';
  lbl.style.margin = '0px';
  lbl.style.borderWidth = '0px';
  canvas.appendChild(lbl);
  return lbl;
}
// </editor-fold> END mkSpan

// <editor-fold> mkDiv
let mkDiv = function({
  canvas,
  w = 50,
  h = 20,
  top = 0,
  left = 0,
  bgClr = clr_limeGreen
} = {
  canvas,
  w: 50,
  h: 20,
  top: 0,
  left: 0,
  bgClr: clr_limeGreen
}) {
  let tDiv = document.createElement("div");
  tDiv.style.position = 'absolute';
  tDiv.style.width = w.toString() + "px";
  tDiv.style.height = h.toString() + "px";
  tDiv.style.top = top.toString() + 'px';
  tDiv.style.left = left.toString() + 'px';
  tDiv.style.backgroundColor = bgClr;
  canvas.appendChild(tDiv);
  return tDiv;
}
// </editor-fold> END mkDiv

// <editor-fold> mkSVGcontainer
let mkSVGcontainer = function({
  canvas,
  w = 200,
  h = 200,
  x = 50,
  y = 50
} = {
  canvas,
  w: 200,
  h: 200,
  x: 50,
  y: 50
}) {
  let tSvgCont = document.createElementNS(SVG_NS, "svg");
  tSvgCont.setAttributeNS(null, "width", w);
  tSvgCont.setAttributeNS(null, "height", h);
  tSvgCont.setAttributeNS(null, "x", x);
  tSvgCont.setAttributeNS(null, "y", y);
  canvas.appendChild(tSvgCont);
  return tSvgCont;
}
// </editor-fold> END mkSVGcontainer

//<editor-fold> mkInputField
function mkInputField({
  canvas,
  id = 'inputField',
  w = 50,
  h = 20,
  top = 0,
  left = 0,
  color = 'yellow',
  fontSize = 11,
  clickAction = function() {},
  keyUpAction = function() {}
} = {
  canvas,
  id: 'inputField',
  w: 50,
  h: 20,
  top: 0,
  left: 0,
  color: 'yellow',
  fontSize: 11,
  clickAction: function() {},
  keyUpAction: function() {}
}) {
  let inputField = document.createElement("input");
  inputField.type = 'text';
  inputField.className = 'input__field--yoshiko';
  inputField.id = id;
  inputField.style.width = w.toString() + "px";
  inputField.style.height = h.toString() + "px";
  inputField.style.top = top.toString() + "px";
  inputField.style.left = left.toString() + "px";
  inputField.style.fontSize = fontSize.toString() + "px";
  inputField.style.color = color;
  inputField.addEventListener("click", clickAction);
  inputField.addEventListener("keyup", keyUpAction);
  canvas.appendChild(inputField);
  return inputField;
}
// </editor-fold> END mkInputField

// <editor-fold> mkCheckboxesHoriz
let mkCheckboxesHoriz = function({
  canvas,
  numBoxes = 3,
  boxSz = 18,
  gap = 7,
  top = 0,
  left = 0,
  lblArray = ['0', '1', '2', '3'],
  lblClr = 'rgb(153,255,0)',
  lblFontSz = 18
} = {
  canvas,
  numBoxes: 3,
  boxSz: 18,
  gap: 7,
  top: 0,
  left: 0,
  lblArray: ['0', '1', '2', '3'],
  lblClr: 'rgb(153,255,0)',
  lblFontSz: 18
}) {
  let cbArray = [];
  // Make Checkboxes
  for (let cbix = 0; cbix < numBoxes; cbix++) {
    let cbDict = {};
    var cb = document.createElement("input");
    cb.type = 'checkbox';
    cb.value = '0';
    cb.style.width = boxSz.toString() + 'px';
    cb.style.height = boxSz.toString() + 'px';
    cb.style.position = 'absolute';
    cb.style.top = top.toString() + 'px';
    let boxL = left + (gap * cbix) + (boxSz * cbix);
    cb.style.left = boxL.toString() + 'px';
    cb.style.padding = '0px';
    cb.style.margin = '0px';
    cb.style.borderWidth = '0px';
    canvas.appendChild(cb);
    cbDict['cb'] = cb;


    // Make Labels
    let lTop = top + boxSz;
    let cbLbl = mkSpan({
      canvas: canvas,
      top: lTop,
      text: lblArray[cbix],
      fontSize: lblFontSz,
      color: 'rgb(153,255,0)'
    });
    let lblW = cbLbl.getBoundingClientRect().width;
    let cbW = cb.getBoundingClientRect().width;
    let half_LabelCbWidthDifference = (lblW - cbW) / 2;
    let lblL = boxL - half_LabelCbWidthDifference;
    cbLbl.style.left = lblL.toString() + 'px';
    cbDict['lbl'] = cbLbl;
    cbArray.push(cbDict);
  }
  return cbArray;
}
// </editor-fold> END mkCheckBoxesHoriz

// <editor-fold> mkMenu
function mkMenu({
  canvas,
  w = 200,
  h = 100,
  top = 15,
  left = 15,
  menuLbl_ActionArray = [{
    label: 'one',
    action: function() {
      console.log('one');
    },
    label: 'two',
    action: function() {
      console.log('two');
    }
  }]
} = {
  canvas,
  w: 200,
  h: 100,
  top: 15,
  left: 15,
  menuLbl_ActionArray: [{
    label: one,
    action: function() {
      console.log('one');
    },
    label: two,
    action: function() {
      console.log('two');
    }
  }]
}) {
  let menuDiv = document.createElement("div");
  menuDiv.className = 'dropdown-content';
  menuDiv.style.width = w.toString() + "px";
  menuDiv.style.top = top.toString() + "px";
  menuDiv.style.left = left.toString() + "px";
  menuDiv.style.maxHeight = h.toString() + "px";
  // menuDiv.style.minHeight = h.toString() + "px";
  canvas.appendChild(menuDiv);
  //menuLbl_ActionArray = [{label:, action:}]
  menuLbl_ActionArray.forEach((labelActionArray) => {
    let tempAtag = document.createElement('a');
    tempAtag.textContent = labelActionArray.label;
    tempAtag.style.fontFamily = "lato";
    tempAtag.addEventListener("click", labelActionArray.action);
    menuDiv.appendChild(tempAtag);
  });
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.btn')) {
      let dropdowns = document.getElementsByClassName("dropdown-content");
      let i;
      for (i = 0; i < dropdowns.length; i++) {
        let openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }

  return menuDiv;
}
// </editor-fold> END mkMenu

// <editor-fold> mkButton
function mkButton({
  canvas,
  w = 50,
  h = 50,
  top = 15,
  left = 15,
  label = 'Press Me Hard',
  fontSize = 13,
  action = {}
} = {
  canvas,
  w: 50,
  h: 50,
  top: 15,
  left: 15,
  label: 'Press Me Hard',
  fontSize: 13,
  action: {}
}) {
  let btn = document.createElement("BUTTON");
  btn.className = 'btn btn-1';
  btn.innerText = label;
  btn.style.width = w.toString() + "px";
  btn.style.height = h.toString() + "px";
  btn.style.top = top.toString() + "px";
  btn.style.left = left.toString() + "px";
  btn.style.fontSize = fontSize.toString() + "px";
  btn.addEventListener("click", action);
  canvas.appendChild(btn);
  return btn;
}
// </editor-fold>END mkButton

// <editor-fold> getUrlArgs
function getUrlArgs() {
  let args = {};
  let parts = window.location.href.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    function(m, key, value) {
      args[key] = value;
    });
  return args;
}
// </editor-fold> END getUrlArgs()

// <editor-fold> rrand
function rrand(min, max) {
  return Math.random() * (max - min) + min;
}
// </editor-fold> END rrand

// <editor-fold> rrandInt
let rrandInt = function(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}
// </editor-fold> END rrandInt

// <editor-fold> choose
let choose = function(choices) {
  let randpick = rrandInt(0, arguments.length - 1);
  return arguments[randpick];
}
// </editor-fold> END choose

// <editor-fold> generateFileNameWdate
let generateFileNameWdate = function(name) {
  let t_now = new Date();
  let month = t_now.getMonth() + 1;
  let fileName = name + '_' + t_now.getFullYear() + "_" + month + "_" + t_now.getUTCDate() + "_" + t_now.getHours() + "-" + t_now.getMinutes() + "-" + t_now.getSeconds() + '.txt';
  return fileName
}
// </editor-fold> END generateFileNameWdate

// <editor-fold> downloadStrToHD
// download('the content of the file', 'filename.txt', 'text/plain');
let downloadStrToHD = function(strData, strFileName, strMimeType) {
  let D = document,
    A = arguments,
    a = D.createElement("a"),
    d = A[0],
    n = A[1],
    t = A[2] || "text/plain";

  //build download link:
  a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);

  if (window.MSBlobBuilder) { // IE10
    let bb = new MSBlobBuilder();
    bb.append(strData);
    return navigator.msSaveBlob(bb, strFileName);
  } /* end if(window.MSBlobBuilder) */

  if ('download' in a) { //FF20, CH19
    a.setAttribute("download", n);
    a.innerHTML = "downloading...";
    D.body.appendChild(a);
    setTimeout(function() {
      let e = D.createEvent("MouseEvents");
      e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      D.body.removeChild(a);
    }, 66);
    return true;
  }; /* end if('download' in a) */

  //do iframe dataURL download: (older W3)
  let f = D.createElement("iframe");
  D.body.appendChild(f);
  f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
  setTimeout(function() {
    D.body.removeChild(f);
  }, 333);
  return true;
}
// </editor-fold> END downloadStrToHD

// <editor-fold> retrieveFileFromPath
// USAGE: let data = await retrieveFileFromPath(path)
// Every line after await will execute after file is retrived or the Promise is resolved
// Text will be available as data.fileData
function retrieveFileFromPath(path) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'text';
    request.onload = () => resolve({
      fileData: request.response
    });
    request.onerror = reject;
    request.send();
  })
}
// </editor-fold> END retrieveFileFromPath

// <editor-fold> retrieveFileFromFinder
let retrieveFileFromFinder = async function() {
  return new Promise((resolve, reject) => {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = readerEvent => {
        let content = readerEvent.target.result;
        resolve(content);
      }
    }
    input.click();
  })
}

// </editor-fold> END retrieveFileFromFinder

// <editor-fold> rads
function rads(deg) {
  return (deg * Math.PI) / 180;
}
// </editor-fold> END rads

// <editor-fold> mkSvgCircle

let mkSvgCircle = function({
  svgContainer,
  cx = 25,
  cy = 25,
  r = 10,
  fill = 'green',
  stroke = 'yellow',
  strokeW = 3
} = {
  svgContainer,
  cx: 25,
  cy: 25,
  r: 10,
  fill: 'green',
  stroke: 'yellow',
  strokeW: 3
}) {

  var bbCircle = document.createElementNS(SVG_NS, "circle");
  bbCircle.setAttributeNS(null, "cx", cx);
  bbCircle.setAttributeNS(null, "cy", cy);
  bbCircle.setAttributeNS(null, "r", r);
  bbCircle.setAttributeNS(null, "fill", fill);
  bbCircle.setAttributeNS(null, "stroke", stroke);
  bbCircle.setAttributeNS(null, "stroke-width", strokeW);
  svgContainer.appendChild(bbCircle);
  return bbCircle;
}

// </editor-fold> END mkSvgCircle

// <editor-fold> mkSvgLine

let mkSvgLine = function({
  svgContainer,
  x1 = 25,
  y1 = 25,
  x2 = 25,
  y2 = 25,
  stroke = 'yellow',
  strokeW = 3
} = {
  svgContainer,
  x1: 25,
  y1: 25,
  x2: 25,
  y2: 25,
  stroke: 'yellow',
  strokeW: 3
}) {

  var svgLine = document.createElementNS(SVG_NS, "line");
  svgLine.setAttributeNS(null, "x1", x1);
  svgLine.setAttributeNS(null, "y1", y1);
  svgLine.setAttributeNS(null, "x2", x2);
  svgLine.setAttributeNS(null, "y2", y2);
  svgLine.setAttributeNS(null, "stroke", stroke);
  svgLine.setAttributeNS(null, "stroke-width", strokeW);
  svgContainer.appendChild(svgLine);

  return svgLine;
}

// </editor-fold> END mkSvgLine

// <editor-fold> mkSvgRect

let mkSvgRect = function({
  svgContainer,
  x = 25,
  y = 25,
  w = 10,
  h = 10,
  fill = 'green',
  stroke = 'yellow',
  strokeW = 0,
  roundR = 0
} = {
  svgContainer,
  x: 25,
  y: 25,
  w: 10,
  h: 10,
  fill: 'green',
  stroke: 'yellow',
  strokeW: 0,
  roundR: 0
}) {

  let svgRect = document.createElementNS(SVG_NS, "rect");
  svgRect.setAttributeNS(null, "x", x);
  svgRect.setAttributeNS(null, "y", y);
  svgRect.setAttributeNS(null, "width", w);
  svgRect.setAttributeNS(null, "height", h);
  svgRect.setAttributeNS(null, "fill", fill);
  svgRect.setAttributeNS(null, "stroke", stroke);
  svgRect.setAttributeNS(null, "stroke-width", strokeW);
  svgRect.setAttributeNS(null, "rx", roundR);
  svgContainer.appendChild(svgRect);
  return svgRect;
}

// </editor-fold> END mkSvgRect

// <editor-fold> describeArc

let polarToCartesian = function(centerX, centerY, radius, angleInDegrees) {
  let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  let start = polarToCartesian(x, y, radius, endAngle);
  let end = polarToCartesian(x, y, radius, startAngle);
  let arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  let d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
    "L", x,y,
    "L", start.x, start.y
  ].join(" ");
  return d;
}

// </editor-fold> END describeArc


// <editor-fold> mkSvgArc

let mkSvgArc = function({
  svgContainer,
  x = 0,
  y = 0,
  radius = 10,
  startAngle = 45,
  endAngle = 180,
  fill = 'green',
  stroke = 'yellow',
  strokeW = 3,
  strokeCap = 'round' //square;round;butt
} = {
  svgContainer,
  x: 0,
  y: 0,
  radius: 10,
  startAngle: 45,
  endAngle: 180,
  fill: 'green',
  stroke: 'yellow',
  strokeW: 3,
  strokeCap: 'round' //square;round;butt
}) {

  let start = polarToCartesian(x, y, radius, endAngle);
  let end = polarToCartesian(x, y, radius, startAngle);
  let arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  let d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
    "L", x, y,
    "L", start.x, start.y
  ].join(" ");

  // << << ARCS PROPER -------------------- >
  let arc = document.createElementNS(SVG_NS, "path");
  arc.setAttributeNS(null, "d", d); //describeArc makes 12'0clock =0degrees
  arc.setAttributeNS(null, "stroke-width", strokeW);
  arc.setAttributeNS(null, "stroke", stroke);
  arc.setAttributeNS(null, "fill", fill);
  arc.setAttributeNS(null, "stroke-linecap", strokeCap);
  svgContainer.appendChild(arc);

  return arc;
}

// </editor-fold> END mkSvgArc

// <editor-fold> mkSvgTriangle

let mkSvgTriangle = function({
  svgContainer,
  cx = 25,
  cy = 25,
  h = 10,
  w = 10,
  fill = 'green',
  stroke = 'black',
  strokeW = 3
} = {
  svgContainer,
  cx: 25,
  cy: 25,
  h: 10,
  w: 10,
  fill: 'green',
  stroke: 'black',
  strokeW: 3
}) {

  let x1, x2, x3, y1, y2, y3;
  let halfH = h / 2;
  let halfW = w / 2;
  x1 = cx;
  y1 = cy - halfH;
  x2 = cx + halfW;
  y2 = cy + halfH;
  x3 = cx - halfW;
  y3 = cy + halfH;

  let pointsString = x1.toString() + ',' + y1.toString() + ' ' + x2.toString() + ',' + y2.toString() + ' ' + x3.toString() + ',' + y3.toString();

  var svgTriangle = document.createElementNS(SVG_NS, "polygon");
  svgTriangle.setAttributeNS(null, "points", pointsString);
  svgTriangle.setAttributeNS(null, "fill", fill);
  svgTriangle.setAttributeNS(null, "stroke", stroke);
  svgTriangle.setAttributeNS(null, "stroke-width", strokeW);
  svgContainer.appendChild(svgTriangle);
  return svgTriangle;
}

// </editor-fold> END mkSvgTriangle

// <editor-fold> mkSvgText

let mkSvgText = function({
  svgContainer,
  x = 0,
  y = 0,
  fill = 'black',
  stroke = 'white',
  strokeW = 0,
  justifyH = 'start',
  justifyV = 'auto',
  fontSz = 18,
  fontFamily = 'lato',
  txt = '007'
} = {
  svgContainer,
  x: 25,
  y: 25,
  fill: 'black',
  stroke: 'white',
  strokeW: 0,
  justifyH: 'start',
  justifyV: 'auto',
  fontSz: 18,
  fontFamily: 'lato',
  txt: '007'
}) {

  let svgText = document.createElementNS(SVG_NS, "text");
  svgText.setAttributeNS(null, "x", x);
  svgText.setAttributeNS(null, "y", y);
  svgText.setAttributeNS(null, "fill", fill);
  svgText.setAttributeNS(null, "stroke", stroke);
  svgText.setAttributeNS(null, "stroke-width", strokeW);
  svgText.setAttributeNS(null, "text-anchor", justifyH); //start;middle;end
  svgText.setAttributeNS(null, "font-size", fontSz);
  svgText.setAttributeNS(null, "font-family", strokeW);
  // auto | baseline | before-edge | text-before-edge | middle | central | after-edge | text-after-edge | ideographic | alphabetic | hanging | mathematical | inherit
  svgText.setAttributeNS(null, "alignment-baseline", justifyV);
  svgText.textContent = txt;
  svgContainer.appendChild(svgText);
  return svgText;
}
// </editor-fold> END mkSvgText

// <editor-fold> mkSvgDiamond

let mkSvgDiamond = function({
  svgContainer,
  cx = 25,
  cy = 25,
  h = 10,
  w = 10,
  fill = 'green',
  stroke = 'black',
  strokeW = 3
} = {
  svgContainer,
  cx: 25,
  cy: 25,
  h: 10,
  w: 10,
  fill: 'green',
  stroke: 'black',
  strokeW: 3
}) {

  let x1, x2, x3, y1, y2, y3, x4, y4;
  let halfH = h / 2;
  let halfW = w / 2;
  x1 = cx;
  y1 = cy - halfH;
  x2 = cx + halfW;
  y2 = cy;
  x3 = cx;
  y3 = cy + halfH;
  x4 = cx - halfW;
  y4 = cy;

  let pointsString = x1.toString() + ',' + y1.toString() + ' ' + x2.toString() + ',' + y2.toString() + ' ' + x3.toString() + ',' + y3.toString() + ' ' + x4.toString() + ',' + y4.toString();

  var svgDiamond = document.createElementNS(SVG_NS, "polygon");
  svgDiamond.setAttributeNS(null, "points", pointsString);
  svgDiamond.setAttributeNS(null, "fill", fill);
  svgDiamond.setAttributeNS(null, "stroke", stroke);
  svgDiamond.setAttributeNS(null, "stroke-width", strokeW);
  svgContainer.appendChild(svgDiamond);
  return svgDiamond;
}

// </editor-fold> END mkSvgDiamond

// <editor-fold> getImage (async)
async function getImage(url) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
// Wrapper to deal with asynchronous process
function run_getImage(path) {
  return getImage(path);
}
// </editor-fold> END getImage (async)



// <editor-fold>
// </editor-fold> END
