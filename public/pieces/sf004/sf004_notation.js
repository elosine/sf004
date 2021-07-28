// <editor-fold> Global Vars

const NUM_TEMPOS = 5;
const TEMPO_COLORS = [clr_orange, clr_brightGreen, clr_brightRed, clr_brightBlue, clr_lavander];

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

function init() {

  processUrlArgs();

  scoreData = generateScoreData();
  console.log(scoreData);

  makeScoreDataManager();

  makeWorldPanel();

  makeThreeJsScene();

  makeRunway();

  makeTracks();

  makeGoFrets();

  makeTempoFrets();

  makeBouncingBalls();

  makeRhythmicNotation();

  makeSigns();

  RENDERER.render(SCENE, CAMERA);

} // function init() end

// </editor-fold> END INIT

// <editor-fold> URL Args

let PIECE_ID;
let partsToRun = [];
let TOTAL_NUM_PARTS_TO_RUN;

function processUrlArgs() {

  let urlArgs = getUrlArgs();

  PIECE_ID = urlArgs.id;

  // partsToRun
  let partsToRunStrArray = urlArgs.parts.split(';');
  partsToRunStrArray.forEach((partNumAsStr) => {
    partsToRun.push(parseInt(partNumAsStr));
  });

  TOTAL_NUM_PARTS_TO_RUN = partsToRun.length;

}

// </editor-fold> END URL Args

// <editor-fold> Generate Score Data

let scoreData;

let generateScoreData = function() {

  let tempScoreData = {};
  let tempos = [];

  // Generate 5 Tempos
  let baseTempo = choose(85, 91, 77);
  let tempoRangeMin = baseTempo - (baseTempo * 0.03);
  let tempoRangeMax = baseTempo + (baseTempo * 0.03);
  for (let i = 0; i < 5; i++) {
    let ttempo = rrand(tempoRangeMin, tempoRangeMax);
    tempos.push(ttempo);
  }
  tempScoreData['tempos'] = tempos

  return tempScoreData;

}

// </editor-fold> END Generate Score Data

// <editor-fold> SCORE DATA MANAGER

function makeScoreDataManager() {

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
    onwindowresize: true,
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

  // </editor-fold> END Score Data Manager Panel


  // <editor-fold> Generate New Score Data Button

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
  });

  // </editor-fold> END Generate New Score Data Button


  // <editor-fold> Save Score Data Button

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
  });

  // </editor-fold> END Save Score Data Button


  // <editor-fold> Load Score Data From File Button

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
  });

  // </editor-fold> END Load Score Data Button


  //<editor-fold> Load Score Data from Server Button

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
        PIECE_ID: PIECE_ID
      });
    }
  });

  // Step 2: Server responds with list of file names
  SOCKET.on('sf004_loadPieceFromServerBroadcast', function(data) {

    let requestingId = data.PIECE_ID;

    if (requestingId == PIECE_ID) {

      let arrayOfFileNamesFromServer = data.availableScoreDataFiles; // data from SOCKET msg
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
          } //temp_label_func_Obj['action'] = function() END

          arrayOfMenuItems_lbl_action.push(temp_label_func_Obj);

        } //if (scoreDataFileNameFromServer != '.DS_Store') end

      }); // arrayOfFileNamesFromServer.forEach((scoreDataFileNameFromServer) END

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

    } //if (requestingId == PIECE_ID) end

  }); // SOCKET.on('sf004_loadPieceFromServerBroadcast', function(data) end

  //</editor-fold> END Load Score Data from Server Button


  scoreDataManagerPanel.smallify();

}

// </editor-fold> END SCORE DATA MANAGER

// <editor-fold> World Panel

// <editor-fold> World Panel Variables
let worldPanel;
const CANVAS_L_R_MARGINS = 35;
const CANVAS_MARGIN = 7;
const CANVAS_W = 692 + (CANVAS_L_R_MARGINS * 2) + (CANVAS_MARGIN * 2);
const CANVAS_H = 628;
const CANVAS_CENTER = CANVAS_W / 2;
// </editor-fold> END World Panel Variables

function makeWorldPanel() {

  worldPanel = mkPanel({
    w: CANVAS_W,
    h: CANVAS_H,
    title: 'SoundFlow #4',
    onwindowresize: true,
    clr: clr_blueGrey
  });

}

// </editor-fold> END World Panel

// <editor-fold> ThreeJS Scene

// <editor-fold> ThreeJS Scene Variables

const RENDERER_W = 340;
const RENDERER_H = 180;
const RENDERER_TOP = CANVAS_MARGIN;
const RENDERER_DIV_LEFT = CANVAS_CENTER - (RENDERER_W / 2);
let SCENE, CAMERA, SUN, SUN2, RENDERER_DIV, RENDERER;
let materialColors = [];
for (let matlClrIx = 0; matlClrIx < TEMPO_COLORS.length; matlClrIx++) {
  let tMatlClr = new THREE.MeshLambertMaterial({
    color: TEMPO_COLORS[matlClrIx]
  });
  materialColors.push(tMatlClr);
}
// const CAM_Y = 216; // Up and down; lower number is closer to runway, zooming in
const CAM_Y = 150;
// const CAM_Z = -59; // z is along length of runway; higher number moves back, lower number moves forward
const CAM_Z = 21;
// const CAM_ROTATION_X = -68; // -90 directly above looking down
const CAM_ROTATION_X = -45; // -90 directly above looking down

// </editor-fold> END ThreeJS Scene Variables

function makeThreeJsScene() {

  SCENE = new THREE.Scene();

  // <editor-fold> Camera

  CAMERA = new THREE.PerspectiveCamera(75, RENDERER_W / RENDERER_H, 1, 3000);
  CAMERA.position.set(0, CAM_Y, CAM_Z);
  CAMERA.rotation.x = rads(CAM_ROTATION_X);

  // </editor-fold> END Camera

  // <editor-fold> Lights

  SUN = new THREE.DirectionalLight(0xFFFFFF, 1.2);
  SUN.position.set(100, 600, 175);
  SCENE.add(SUN);
  SUN2 = new THREE.DirectionalLight(0x40A040, 0.6);
  SUN2.position.set(-100, 350, 200);
  SCENE.add(SUN2);

  // </editor-fold> END Lights

  // <editor-fold> RENDERER_DIV & RENDERER

  RENDERER_DIV = mkDivCanvas({
    w: RENDERER_W,
    h: RENDERER_H,
    top: RENDERER_TOP,
    clr: 'black'
  })
  RENDERER_DIV.style.left = RENDERER_DIV_LEFT.toString() + 'px';
  worldPanel.content.appendChild(RENDERER_DIV);

  RENDERER = new THREE.WebGLRenderer();
  RENDERER.setSize(RENDERER_W, RENDERER_H);
  RENDERER_DIV.appendChild(RENDERER.domElement);

  // </editor-fold> END RENDERER_DIV & RENDERER

} // function makeThreeJsScene() end

// </editor-fold> END ThreeJs Scene

// <editor-fold> Runway


// <editor-fold> Runway Variables

const RUNWAY_W = RENDERER_W;
const RUNWAY_H = RENDERER_H;
const RUNWAY_L = 1000;
const HALF_RUNWAY_W = RUNWAY_W / 2;
const HALF_RUNWAY_LENGTH = RUNWAY_L / 2;

// </editor-fold> END Runway Variables


// <editor-fold> makeRunway

function makeRunway() {

  let runwayMaterial =
    new THREE.MeshLambertMaterial({
      color: 0x0040C0,
      side: THREE.DoubleSide
    });

  let runwayGeometry = new THREE.PlaneBufferGeometry(RUNWAY_W, RUNWAY_L, 32);

  let runway = new THREE.Mesh(runwayGeometry, runwayMaterial);

  runway.position.z = -HALF_RUNWAY_LENGTH;
  runway.rotation.x = rads(-90); // at 0 degrees, plane is straight up and down

  SCENE.add(runway);

} //makeRunway() end

// </editor-fold> END makeRunway


// </editor-fold> END Runway

// <editor-fold> Tracks

// <editor-fold> Tracks Variables

const NUM_TRACKS = NUM_TEMPOS;
const TRACK_DIAMETER = 8;
const HALF_TRACK_DIAMETER = TRACK_DIAMETER / 2;
const TRACK_GAP = RUNWAY_W / NUM_TRACKS;
const HALF_TRACK_GAP = TRACK_GAP / 2;
let xPosOfTracks = [];
for (let trIx = 0; trIx < NUM_TRACKS; trIx++) {
  xPosOfTracks.push(-HALF_RUNWAY_W + (TRACK_GAP * trIx) + HALF_TRACK_GAP);
}

// </editor-fold> END Tracks Variables

// <editor-fold> makeTracks

function makeTracks() {

  let trackGeometry = new THREE.CylinderBufferGeometry(TRACK_DIAMETER, TRACK_DIAMETER, RUNWAY_L, 32);

  let trackMaterial = new THREE.MeshLambertMaterial({
    color: 0x708090
  });

  xPosOfTracks.forEach((trXpos) => {

    let newTrack = new THREE.Mesh(trackGeometry, trackMaterial);

    newTrack.rotation.x = rads(-90);
    newTrack.position.z = -HALF_RUNWAY_LENGTH;
    newTrack.position.y = -HALF_TRACK_DIAMETER;
    newTrack.position.x = trXpos;

    SCENE.add(newTrack);

  });

} //makeTracks() end

// </editor-fold> END makeTracks

// </editor-fold> END Tracks

// <editor-fold> Go Frets

// <editor-fold> GoFrets Variables

let goFrets = [];
const GO_FRET_W = 54;
const GO_FRET_H = 11;
const HALF_GO_FRET_H = GO_FRET_H / 2;
const GO_FRET_L = 13;
const HALF_GO_FRET_L = GO_FRET_L / 2;
const GO_Z = -HALF_GO_FRET_L;
const GO_FRET_Y = HALF_TRACK_DIAMETER;

// </editor-fold> END GoFrets Variables

// <editor-fold> makeGoFrets

function makeGoFrets() {

  let goFretGeometry = new THREE.BoxBufferGeometry(GO_FRET_W, GO_FRET_H, GO_FRET_L);

  xPosOfTracks.forEach((trXpos, trIx) => {

    newGoFret = new THREE.Mesh(goFretGeometry, materialColors[trIx]);

    newGoFret.position.z = GO_Z;
    newGoFret.position.y = GO_FRET_Y;
    newGoFret.position.x = trXpos;
    newGoFret.rotation.x = rads(-14);

    SCENE.add(newGoFret);
    goFrets.push(newGoFret);

  }); //xPosOfTracks.forEach((trXpos) END


} //makeGoFrets() end
// </editor-fold> End makeGoFrets

// </editor-fold> END Go Frets

// <editor-fold> Tempo Frets

// <editor-fold> Tempo Frets Variables

let tempoFretsPerTrack = [];
const TEMPO_FRET_W = GO_FRET_W - 2;
const TEMPO_FRET_H = GO_FRET_H - 2;
const TEMPO_FRET_L = GO_FRET_L - 5;
const TEMPO_FRET_Y = HALF_TRACK_DIAMETER;
const NUM_TEMPO_FRETS_TO_FILL = RUNWAY_L / TEMPO_FRET_L;

// </editor-fold> END Tempo Frets Variables

// <editor-fold> makeTempoFrets

function makeTempoFrets() {

  let tempoFretGeometry = new THREE.BoxBufferGeometry(TEMPO_FRET_W, TEMPO_FRET_H, TEMPO_FRET_L);

  xPosOfTracks.forEach((trXpos, trIx) => {

    let thisTracksTempoFrets = [];

    for (var tFretIx = 0; tFretIx < NUM_TEMPO_FRETS_TO_FILL; tFretIx++) {

      newTempoFret = new THREE.Mesh(tempoFretGeometry, materialColors[trIx]);

      newTempoFret.position.z = GO_Z - TEMPO_FRET_L - (TEMPO_FRET_L * tFretIx);
      newTempoFret.position.y = TEMPO_FRET_Y;
      newTempoFret.position.x = trXpos;
      newTempoFret.rotation.x = rads(-14);

      SCENE.add(newTempoFret);
      newTempoFret.visible = false;
      thisTracksTempoFrets.push(newTempoFret);

    } //for (var i = 0; i < NUM_TEMPO_FRETS_TO_FILL; i++) End

    tempoFretsPerTrack.push(thisTracksTempoFrets);

  }); //xPosOfTracks.forEach((trXpos) END


} //makeTempoFrets() end

// </editor-fold> END makeTempoFrets

// </editor-fold> END Tempo Frets

// <editor-fold> Bouncing Balls

// <editor-fold> BouncingBalls Variables

let bbSet = [];
for (let trIx = 0; trIx < NUM_TRACKS; trIx++) bbSet.push({});
const BB_W = 51;
const BB_H = 90;
const BB_TOP = RENDERER_TOP + RENDERER_H;
const BB_CENTER = BB_W / 2;
const BB_PAD_LEFT = 10;
const BB_GAP = 16;
const BBCIRC_R = 13;
const BBCIRC_TOP_CY = BBCIRC_R + 3;
const BB_BOUNCE_WEIGHT = 6;
const HALF_BB_BOUNCE_WEIGHT = BB_BOUNCE_WEIGHT / 2;

// </editor-fold> END BouncingBalls Variables

// <editor-fold> makeBouncingBalls

function makeBouncingBalls() {

  for (let bbIx = 0; bbIx < NUM_TRACKS; bbIx++) {

    bbSet[bbIx]['div'] = mkDiv({
      canvas: worldPanel.content,
      w: BB_W,
      h: BB_H,
      top: BB_TOP,
      left: RENDERER_DIV_LEFT + BB_PAD_LEFT + ((BB_W + BB_GAP) * bbIx),
      bgClr: 'white'
    });

    bbSet[bbIx]['svgCont'] = mkSVGcontainer({
      canvas: bbSet[bbIx].div,
      w: BB_W,
      h: BB_H,
      x: 0,
      y: 0
    });

    bbSet[bbIx]['bbCirc'] = mkSvgCircle({
      svgContainer: bbSet[bbIx].svgCont,
      cx: BB_CENTER,
      cy: BBCIRC_TOP_CY,
      r: BBCIRC_R,
      fill: TEMPO_COLORS[bbIx],
      stroke: 'white',
      strokeW: 0
    });

    bbSet[bbIx]['bbBouncePadOff'] = mkSvgLine({
      svgContainer: bbSet[bbIx].svgCont,
      x1: 0,
      y1: BB_H - HALF_BB_BOUNCE_WEIGHT,
      x2: BB_W,
      y2: BB_H - HALF_BB_BOUNCE_WEIGHT,
      stroke: 'black',
      strokeW: BB_BOUNCE_WEIGHT
    });

    bbSet[bbIx]['bbBouncePadOn'] = mkSvgLine({
      svgContainer: bbSet[bbIx].svgCont,
      x1: 0,
      y1: BB_H - HALF_BB_BOUNCE_WEIGHT,
      x2: BB_W,
      y2: BB_H - HALF_BB_BOUNCE_WEIGHT,
      stroke: 'yellow',
      strokeW: BB_BOUNCE_WEIGHT+2
    });
    bbSet[bbIx].bbBouncePadOn.setAttributeNS(null,'display' , 'none');


    bbSet[bbIx]['offIndicator'] =  mkSvgRect({
      svgContainer:bbSet[bbIx].svgCont,
      x: 0,
      y: 0,
      w: BB_W,
      h: BB_H,
      fill: 'rgba(173, 173, 183, 0.9)',
    });


  } //for (let bbIx = 0; bbIx < NUM_TRACKS; bbIx++) END


} //makeBouncingBalls() end

// </editor-fold> END makeBouncingBalls

// </editor-fold> END BouncingBalls

// <editor-fold> Rhythmic Notation

// <editor-fold> rhythmicNotation Variables

let rhythmicNotationObj = {};
let notationImageObjectSet = {};

const HORIZ_DIST_BTWN_BEATS = 85;
const TOP_STAFF_LINE_Y = 88;
const VERT_DIST_BTWN_STAVES = 100;
const VERT_DIST_BTWN_STAFF_LINES = 8;
const FIRST_BEAT_L = 12;
const LAST_BEAT_W = HORIZ_DIST_BTWN_BEATS - FIRST_BEAT_L;
const NUM_BEATS_PER_STAFF = 8;
const STAFF_BTM_MARGIN = 45;
const NUM_STAVES = 3;
const TOTAL_NUM_BEATS = NUM_BEATS_PER_STAFF * NUM_STAVES;
const NOTEHEAD_W = 10;
const NOTEHEAD_H = 8;
const HALF_NOTEHEAD_H = NOTEHEAD_H / 2;
const RHYTHMIC_NOTATION_CANVAS_W = FIRST_BEAT_L + (HORIZ_DIST_BTWN_BEATS * NUM_BEATS_PER_STAFF) + FIRST_BEAT_L; //canvas longer to display notation but cursors will only travel duration of beat thus not to the end of the canvas
const RHYTHMIC_NOTATION_CANVAS_H = TOP_STAFF_LINE_Y + ((NUM_STAVES - 1) * VERT_DIST_BTWN_STAVES) + STAFF_BTM_MARGIN;
const RHYTHMIC_NOTATION_CANVAS_TOP = CANVAS_MARGIN + RENDERER_H + BB_H + CANVAS_MARGIN;
const RHYTHMIC_NOTATION_CANVAS_L = CANVAS_MARGIN + CANVAS_L_R_MARGINS;
const NOTATION_CURSOR_H = 70;

let motivesByBeat = [];
for (var beatIx = 0; beatIx < TOTAL_NUM_BEATS; beatIx++) {
  motivesByBeat.push({});
}

let tempoCursors = [];

// <editor-fold> Beat Coordinates
let beatXLocations = [];
for (let beatLocIx = 0; beatLocIx < NUM_BEATS_PER_STAFF; beatLocIx++) {
  beatXLocations.push(FIRST_BEAT_L + (beatLocIx * HORIZ_DIST_BTWN_BEATS));
}

let beatCoords = [];
for (let staffIx = 0; staffIx < NUM_STAVES; staffIx++) {
  for (var beatPerStaffIx = 0; beatPerStaffIx < NUM_BEATS_PER_STAFF; beatPerStaffIx++) {
    let tCoordObj = {};
    tCoordObj['x'] = FIRST_BEAT_L + (beatPerStaffIx * HORIZ_DIST_BTWN_BEATS);
    tCoordObj['y'] = TOP_STAFF_LINE_Y + (staffIx * VERT_DIST_BTWN_STAVES) + HALF_NOTEHEAD_H;
    beatCoords.push(tCoordObj);
  }
}
// </editor-fold> Beat Coordinates

// <editor-fold> notationSvgPaths_labels
let notationSvgPaths_labels = [{
    path: "/pieces/sf004/notationSVGs/quintuplet.svg",
    lbl: 'quintuplet'
  },
  {
    path: "/pieces/sf004/notationSVGs/quadruplet.svg",
    lbl: 'quadruplet'
  },
  {
    path: "/pieces/sf004/notationSVGs/triplet.svg",
    lbl: 'triplet'
  },
  {
    path: "/pieces/sf004/notationSVGs/dot8thR_16th.svg",
    lbl: 'dot8thR_16th'
  },
  {
    path: "/pieces/sf004/notationSVGs/two16th_8thR.svg",
    lbl: 'two16th_8thR'
  },
  {
    path: "/pieces/sf004/notationSVGs/eighthR_two16ths.svg",
    lbl: 'eighthR_two16ths'
  },
  {
    path: "/pieces/sf004/notationSVGs/eighthR_8th.svg",
    lbl: 'eighthR_8th'
  },
  {
    path: "/pieces/sf004/notationSVGs/quarter.svg",
    lbl: 'quarter'
  },
  {
    path: "/pieces/sf004/notationSVGs/qtr_rest.svg",
    lbl: 'qtr_rest'
  }
];
// </editor-fold> END notationSvgPaths_labels

// </editor-fold> END rhythmicNotation Variables

function makeRhythmicNotation() {

  // <editor-fold> DIV/SVG Container

  rhythmicNotationObj['div'] = mkDiv({
    canvas: worldPanel.content,
    w: RHYTHMIC_NOTATION_CANVAS_W,
    h: RHYTHMIC_NOTATION_CANVAS_H,
    top: RHYTHMIC_NOTATION_CANVAS_TOP,
    left: RHYTHMIC_NOTATION_CANVAS_L,
    bgClr: 'white'
  });

  rhythmicNotationObj['svgCont'] = mkSVGcontainer({
    canvas: rhythmicNotationObj.div,
    w: RHYTHMIC_NOTATION_CANVAS_W,
    h: RHYTHMIC_NOTATION_CANVAS_H,
    x: 0,
    y: 0
  });

  // </editor-fold> END DIV/SVG Container

  // <editor-fold> StaffLines
  let rhythmicNotationStaffLines = [];
  for (let staffIx = 0; staffIx < NUM_STAVES; staffIx++) {
    let tStaffY = TOP_STAFF_LINE_Y + (staffIx * VERT_DIST_BTWN_STAVES);
    let tLine = mkSvgLine({
      svgContainer: rhythmicNotationObj.svgCont,
      x1: 0,
      y1: tStaffY,
      x2: RHYTHMIC_NOTATION_CANVAS_W,
      y2: tStaffY,
      stroke: "black",
      strokeW: 1
    });
    rhythmicNotationStaffLines.push(tLine);
  }
  rhythmicNotationObj['staffLines'] = rhythmicNotationStaffLines;
  // </editor-fold> END Staff Lines

  // <editor-fold> Draw Initial Notation

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

  // Make all motives and make display:none; Display All Quarters
  function makeMotives() { //runs after await so all image sizes are loaded

    beatCoords.forEach((beatCoordsObj, beatIx) => {

      let tx = beatCoordsObj.x;
      let ty = beatCoordsObj.y;

      notationSvgPaths_labels.forEach((pathLblObj) => {

        let tLabel = pathLblObj.lbl;
        let tDisp = tLabel == 'quarter' ? 'yes' : 'none';

        let tSvgImage = document.createElementNS(SVG_NS, "image");
        tSvgImage.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notationSVGs/' + tLabel + '.svg');
        tSvgImage.setAttributeNS(null, "y", ty - notationImageObjectSet[tLabel].height);
        tSvgImage.setAttributeNS(null, "x", tx);
        tSvgImage.setAttributeNS(null, "visibility", 'visible');
        tSvgImage.setAttributeNS(null, "display", tDisp);
        rhythmicNotationObj.svgCont.appendChild(tSvgImage);

        motivesByBeat[beatIx][tLabel] = tSvgImage;

      }); //notationSvgPaths_labels.forEach((pathLblObj)  END

    }); //beatCoords.forEach((beatCoordsObj) END

  } //function makeMotives() END

  // MAIN LOOP HERE: Load Notation SVGs to get image height/width for positioning
  notationSvgPaths_labels.forEach((pathLblObj, i) => {
    let tpath = pathLblObj.path;
    (async () => { //generic async wrapper to avoid error
      let timg = await run_getImage(tpath); // Runs wrapper which runs getImage everything below this await waits for response
      notationImageObjectSet[pathLblObj.lbl] = timg;
      if (i == (notationSvgPaths_labels.length - 1)) {
        makeMotives();
      }
    })();
  }); //notationSvgPaths_labels.forEach((pathLblObj, i) end

  // </editor-fold> END Draw Initial Notation

  // <editor-fold> Notation Scrolling Cursors

  for (var tempoCsrIx = 0; tempoCsrIx < NUM_TEMPOS; tempoCsrIx++) {

    let tLine = mkSvgLine({
      svgContainer: rhythmicNotationObj.svgCont,
      x1: beatCoords[7].x + HORIZ_DIST_BTWN_BEATS,
      y1: beatCoords[16].y + HALF_NOTEHEAD_H - NOTATION_CURSOR_H,
      x2: beatCoords[7].x + HORIZ_DIST_BTWN_BEATS,
      y2: beatCoords[16].y + HALF_NOTEHEAD_H, //beatCoords[16].y is 3rd staff line
      stroke: TEMPO_COLORS[tempoCsrIx],
      strokeW: 3
    });
    tLine.setAttributeNS(null, 'stroke-linecap', 'round');
    tempoCursors.push(tLine);

  } //for (var tempoCsrIx = 0; tempoCsrIx < NUM_TEMPOS; tempoCsrIx++) END

  // </editor-fold> END Notation Scrolling Cursors

} //makeRhythmicNotation() end

// </editor-fold> END Rhythmic Notation

// <editor-fold> Signs

// <editor-fold> Signs Variables

const SIGN_W = TEMPO_FRET_W - 10;
const SIGN_H = 150;
const HALF_SIGN_H = SIGN_H / 2;
let signsByTrack = [];
const NUM_AVAILABLE_SIGN_MESHES_PER_TRACK = NUM_TEMPO_FRETS_TO_FILL / 10;

// </editor-fold> END Signs Variables

function makeSigns() {

  let signGeometry = new THREE.PlaneBufferGeometry(SIGN_W, SIGN_H, 32);

  xPosOfTracks.forEach((trXpos, trIx) => {

    let thisTracksSigns = [];

    for (var tSignIx = 0; tSignIx < NUM_AVAILABLE_SIGN_MESHES_PER_TRACK; tSignIx++) {

      let signMaterial =
        new THREE.MeshLambertMaterial({
          color: TEMPO_COLORS[trIx],
          side: THREE.DoubleSide,
          opacity: 0.7,
          transparent: true,
        });

      let sign = new THREE.Mesh(signGeometry, signMaterial);

      sign.position.z = GO_Z ;
      sign.position.x = trXpos;
      sign.position.y = 0;
      sign.rotation.x = rads(CAM_ROTATION_X);

      SCENE.add(sign);
      sign.visible = false;
      thisTracksSigns.push(sign);

    } //for (var tSignIx = 0; tSignIx < NUM_TEMPO_FRETS_TO_FILL; tSignIx++) end

    signsByTrack.push(thisTracksSigns);

  }); // xPosOfTracks.forEach((trXpos, trIx) end

} //makeSigns() end

// </editor-fold> END Signs



// <editor-fold>
// </editor-fold> END
