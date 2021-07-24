// <editor-fold> mkDivCanvas
let mkDivCanvas = function({
  w = 200,
  h = 200,
  clr = 'black'
} = {
  w: 200,
  h: 200,
  clr: 'black'
}) {
  let t_div = document.createElement("div");
  t_div.style.width = w.toString() + "px";
  t_div.style.height = h.toString() + "px";
  t_div.style.background = clr;
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
// <editor-fold> jsPanel Notes
/*
https://jspanel.de

my String or Function 'center'
The point of the panel that is positioned against some other element.
Supported string values:
    'center'
    'left-top'
    'center-top'
    'right-top'
    'right-center'
    'right-bottom'
    'center-bottom'
    'left-bottom'
    'left-center'

at String or Function 'center'
The point of the element the panel is positioned against.
Supported string values:
    'center'
    'left-top'
    'center-top'
    'right-top'
    'right-center'
    'right-bottom'
    'center-bottom'
    'left-bottom'
    'left-center'

autoposition String undefined
This parameter can be used to automatically arrange a number of panels either horizontally or vertically.
Supported string values:
'down'
    for panels positioned using either 'left-top', 'center-top' or 'right-top' for both my: and at: setting autoposition to 'down' will automatically add a vertical offset downwards to each panel in order to prevent them from piling up on each other. Removing a panel will automatically reposition the remaining panels in the same stack.
'up'
    for panels positioned using either 'left-bottom', 'center-bottom' or 'right-bottom' for both my: and at: setting autoposition to 'up' will automatically add a vertical offset upwards to each panel in order to prevent them from piling up on each other. Removing a panel will automatically reposition the remaining panels in the same stack.
'right'
    for panels positioned using either 'left-top' or 'left-bottom' for both my: and at: setting autoposition to 'right' will automatically add a horizontal right offset to each panel in order to prevent them from piling up on each other. Removing a panel will automatically reposition the remaining panels in the same stack.
'left'
    for panels positioned using either 'right-top' or 'right-bottom' for both my: and at: setting autoposition to 'left' will automatically add a horizontal left offset to each panel in order to prevent them from piling up on each other. Removing a panel will automatically reposition the remaining panels in the same stack.

autoposition notes:
    Basically nothing prevents you from using one of the autoposition values for any panel having the same value for my: and at:. But it simply might not make any sense if you use autoposition: 'down' for panels positioned 'left-bottom' for example.
    The default spacing between autopositioned panels is '4px' and set in global jsPanel.autopositionSpacing.
    offsetX/offsetY: If you apply either one of the offsets to a number of panels using autoposition the offset refers to the complete stack of panels.
    Each autopositioned panel gets an additional class name composed of the basic position (e.g. left-top) and the autoposition direction concatenated with a hyphen. So all panels that are positioned left-top and autopositioned downwards have the class left-top-down for example.
    Autopositioned panels reposition automatically if one panel of the same stack is closed. But only if panels are autopositioned
        left-top down/right
        center-top down
        right-top down/left
        right-bottom up/left
        center-bottom up
        left-bottom up/right


offsetX Number, CSS length value or Function undefined
offsetY Number, CSS length value or Function undefined
A horizontal offset to apply to the panel position.
Number
A number value is used as offset in pixels.
CSS length value
Any valid CSS length value is directly used as offset.
Function(pos, position)
A function returning either a number or a valid CSS length value.
Arguments:
    pos object with the keys left and top with the calculated CSS left/top values before the offset is applied
    position option position as object
The keyword this inside the function refers to pos.


minLeft Number, CSS length value or Function undefined
maxLeft Number, CSS length value or Function undefined
maxTop Number, CSS length value or Function undefined
minTop Number, CSS length value or Function undefined

The minimum CSS left the panel has to maintain.
Number
A number value is used as pixels.
CSS length value
Any valid CSS length value is directly used.
Function(pos, position)
A function returning either a number or a valid CSS length value.
Arguments:
    pos object with the keys left and top with the calculated CSS left/top values before minLeft is applied (offsetX is already included in this value)
    position option position as object
The keyword this inside the function refers to pos.

modify Function undefined
This function can be used to further modify the CSS left and top values calculated so far.
Arguments:
    pos object with the keys left and top with the calculated CSS left/top values that are calculated so far. Those values include the corrections possibly made by the parameters offsetX, offsetY, minLeft, maxLeft, maxTop and minTop.
    position option position as object
The keyword this inside the function refers to pos.
Return value:
The function must return an object with the keys left and top each set with a valid CSS length value.
Position shorthand strings



Position shorthand strings provide an easy way to quickly set the most common positioning options.
A shorthand string may be composed of values for 'my at offsetX offsetY autoposition of'. Each "substring" is separated from the next with a space and you should stick to this sequence in order to prevent problems. Values for minLeft, maxLeft, maxTop, minTop and modify are not supported in shorthand strings.
Example:
Assuming the following positioning object ...
position: {
    my: 'right-top',
    at: 'right-top',
    offsetX: '-0.5rem',
    offsetY: 65,
    autoposition: 'down'
}
... as shorthand string would be: position: 'right-top -0.5rem 65 down'.

HEADER
size String undefined
The size option is used to set the size of the controls and the header title.
Supported settings are either one of:
'xs', 'sm', 'md', 'lg', 'xl'

Content contentOverflow
Values
visible
    Content is not clipped and may be rendered outside the padding box.
hidden
    Content is clipped if necessary to fit the padding box. No scrollbars are provided, and no support for allowing the user to scroll (such as by dragging or using a scroll wheel) is allowed. The content can be scrolled programmatically (for example, by setting the value of a property such as offsetLeft), so the element is still a scroll container.
clip
    Similar to hidden, the content is clipped to the element's padding box. The difference between clip and hidden is that the clip keyword also forbids all scrolling, including programmatic scrolling. The box is not a scroll container, and does not start a new formatting context. If you wish to start a new formatting context, you can use display: flow-root to do so.
scroll
    Content is clipped if necessary to fit the padding box. Browsers always display scrollbars whether or not any content is actually clipped, preventing scrollbars from appearing or disappearing as content changes. Printers may still print overflowing content.
auto
    Depends on the user agent. If content fits inside the padding box, it looks the same as visible, but still establishes a new block formatting context. Desktop browsers provide scrollbars if content overflows.
overlay
    Behaves the same as auto, but with the scrollbars drawn on top of content instead of taking up space. Only supported in WebKit-based (e.g., Safari) and Blink-based (e.g., Chrome or Opera) browsers.

*/
// </editor-fold> END jsPanel Notes
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
// <editor-fold> span Notes
/*
Inline Elements
An inline element does not start on a new line.
An inline element only takes up as much width as necessary.
// <editor-fold> INLINE ELEMENTS
Here are the inline elements in HTML:
<a>
<abbr>
<acronym>
<b>
<bdo>
<big>
<br>
<button>
<cite>
<code>
<dfn>
<em>
<i>
<img>
<input>
<kbd>
<label>
<map>
<object>
<output>
<q>
<samp>
<script>
<select>
<small>
<span>
<strong>
<sub>
<sup>
<textarea>
<time>
<tt>
<var>
// </editor-fold> END INLINE ELEMENTS
The <span> tag is an inline container used to mark up a part of a text, or a part of a document.
The <span> tag is easily styled by CSS or manipulated with JavaScript using the class or id attribute.
The <span> tag is much like the <div> element, but <div> is a block-level element and <span> is an inline element.
*/
// </editor-fold> END span Notes
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
  text = 'welcome to the thunderdome',
  fontSize = 14,
  color = 'green'
} = {
  canvas,
  w: 50,
  h: 20,
  top: 0,
  left: 0,
  text: 'welcome to the thunderdome',
  fontSize: 14,
  color: 'green'
}) {
  let lbl = document.createElement("span");
  lbl.innerHTML = text;
  lbl.style.fontSize = fontSize.toString() + "px";
  lbl.style.color = color;
  lbl.style.fontFamily = "Lato";
  lbl.style.position = 'absolute';
  lbl.style.top = top.toString() + 'px';
  lbl.style.left = left.toString() + 'px';
  canvas.appendChild(lbl);
  return lbl;
}
// </editor-fold> END mkDiv

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



// <editor-fold>
// </editor-fold> END
