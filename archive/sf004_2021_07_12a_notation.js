//<editor-fold> << GLOBAL VARIABLES >> ------------------------------------- //
//<editor-fold>  < GLOBAL VARS - TIMING >                //
const FRAMERATE = 60.0;
const MSPERFRAME = Math.round(1000.0 / FRAMERATE);
const PXPERSEC = 150;
const PXPERMS = PXPERSEC / 1000;
const PXPERFRAME = Math.round(PXPERSEC / FRAMERATE);
const RUNWAYLENGTH = 519;
const RUNWAYDUR_MS = Math.round(RUNWAYLENGTH / PXPERMS);
const RUNWAYDUR_FRAMES = Math.round(RUNWAYLENGTH / PXPERFRAME);
let lastFrame_epochTime = 0;
let cumulativeChangeBtwnFrames_MS = 0;
let pieceClock0_epochTime = 0;
let pieceLeadInDur_MS = 2000;
let pieceLeadInDur_FRAMES = Math.round(pieceLeadInDur_MS / MSPERFRAME);
let frameCount = -pieceLeadInDur_FRAMES;
//<editor-fold> FUNCTION: startPiece() -------- >
function startPiece() {
  // To start the animation engine:
  // 1) Get the current epochTime from timeSync
  // 2) Initialize the lastFrame time as current epochTime
  // 3) Set the epochTime-stamp of what is concidered 0 on the piece clock
  //// -> This will be the now_epochTime + the duration of lead-in
  // 4) Start animation loop with requestAnimationFrame(animationEngine)
  let ts_Date = new Date(TS.now());
  let ts_now_epochTime = ts_Date.getTime();
  lastFrame_epochTime = ts_now_epochTime;
  pieceClock0_epochTime = ts_now_epochTime + pieceLeadInDur_MS;
  requestAnimationFrame(animationEngine);
}
//</editor-fold> FUNCTION: startPiece() END
//</editor-fold> END GLOBAL VARS - TIMING               END
//<editor-fold>  < GLOBAL VARS - GATES >                 //
let animation_isGo = true;
//</editor-fold> END GLOBAL VARS - GATES END
//<editor-fold>  < GLOBAL VARS - PIECE DATA & VARS >     //
let notationObjects = [];
// These next 2 lets populated by URLargs
let partsToRun = [0]; //temp
let totalNumPartsToRun = 1; //temp
//</editor-fold> END GLOBAL VARS - PIECE DATA & VARS    END
//<editor-fold>  < GLOBAL VARS - MISC >                  //
const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = 'http://www.w3.org/1999/xlink';
//</editor-fold> END GLOBAL VARS - MISC END
//<editor-fold>  < GLOBAL VARS - TIMESYNC ENGINE >       //
const TS = timesync.create({
  server: '/timesync',
  interval: 1000
});
//</editor-fold> > END GLOBAL VARS - TIMESYNC ENGINE END
//</editor-fold> >> END GLOBAL VARIABLES END  /////////////////////////////////

//<editor-fold> << START UP >> --------------------------------------------- //
function init() {
  //temp
  let eventData_all = []; //make sure you sort by timecode arr.sort((a,b) => a-b);
  for (let i = 0; i < 100; i++) {
    let goFrame = i * 60;
    let goTime = goFrame * MSPERFRAME;
    eventData_all.push({
      goTime: goTime,
      goFrame: goFrame,
      playerNum: 0,
      type: 'runway_beatFret',
      trackNum: 3
    });
  }
  for (let i = 0; i < 100; i++) {
    let goFrame = i * 38;
    let goTime = goFrame * MSPERFRAME;
    eventData_all.push({
      goTime: goTime,
      goFrame: goFrame,
      playerNum: 0,
      type: 'runway_beatFret',
      trackNum: 2
    });
  }
  for (let i = 0; i < 100; i++) {
    let goFrame = i * 26;
    let goTime = goFrame * MSPERFRAME;
    eventData_all.push({
      goTime: goTime,
      goFrame: goFrame,
      playerNum: 0,
      type: 'runway_beatFret',
      trackNum: 1
    });
  }
  for (let i = 0; i < 100; i++) {
    let goFrame = i * 72;
    let goTime = goFrame * MSPERFRAME;
    eventData_all.push({
      goTime: goTime,
      goFrame: goFrame,
      playerNum: 0,
      type: 'runway_beatFret',
      trackNum: 0
    });
  }
  // Process event data so that as little as possible
  // partsToRun is populated from URLargs at init()
  // Make a new notation object for each part to run and add to notationObjects array
  partsToRun.forEach((playerNum, ptrIX) => {
    // EVENT GENERATION PER PART
    let thisPlayersEvents = []
    eventData_all.forEach((event) => {
      if (event.playerNum == playerNum) {
        thisPlayersEvents.push(event);
      }
    });
    // Get frameNum of last event
    let lastEventGoFrame = Math.max(...Array.from(thisPlayersEvents, o => o.goFrame));
    let partScore_byFrame_byType = [];
    for (let frmNum = 0; frmNum < lastEventGoFrame; frmNum++) { // create an entry in this array for every frame
      let t_minFrame = frmNum;
      let t_maxFrame = t_minFrame + RUNWAYDUR_FRAMES + 120;
      let thisFrameObj = {};
      thisPlayersEvents.forEach((event) => {
        if (event.goFrame >= t_minFrame && event.goFrame < t_maxFrame) { // run through all events in this part
          // *> Separate data by type
          //// if event type does not exsist in object, create it
          if (!(event.type in thisFrameObj)) { //all events in this part
            thisFrameObj[event.type] = {};
            //// Add array to this object
            thisFrameObj[event.type] = [];
          }
          //// Add event to array of events under that event type
          thisFrameObj[event.type].push(event);
        } //if event is on scene
      }); //end all events in this part
      partScore_byFrame_byType.push(thisFrameObj);
    } //end every frame
    let newNO = mkNotationObject(playerNum, ptrIX, partScore_byFrame_byType);
    notationObjects.push(newNO);
  });
  startPiece(); //function def in global variables-timing
}
//</editor-fold> >> END START UP END //////////////////////////////////////////

//<editor-fold>  << NOTATION OBJECT >> ------------------------------------- //
//<editor-fold>   < NOTATION OBJECT - INIT >                   //
function mkNotationObject(playerNum, ptrIX, partScore_byFrame_byType) {
  //<editor-fold> GLOBAL FUNCTION VARS ------------- >
  let notationObj = {};
  notationObj['playerNum'] = playerNum;
  const NUMTRACKS = 4;
  const UPPERPANEL_W = 300;
  const UPPERPANEL_HALFW = UPPERPANEL_W / 2;
  const UPPERPANEL_H = 400;
  const LOWERPANEL_W = 605;
  const LOWERPANEL_H = 197;
  const MAX_W = UPPERPANEL_W > LOWERPANEL_W ? UPPERPANEL_W : LOWERPANEL_W;
  // RUNWAYLENGTH see global vars
  const HALFRUNWAYLENGTH = RUNWAYLENGTH / 2;
  const TRACKDIAMETER = 8;
  const HALFTRACKDIAMETER = TRACKDIAMETER / 2;
  const FRETWIDTH = 50;
  const FRETLENGTH = 12;
  const GOFRETLENGTH = 18;
  const HALFFRETLENGTH = FRETLENGTH / 2;
  const FRETHEIGHT = 13;
  const GOFRETNOTATIONPANEL_H = 70;
  const GOFRETNOTATIONPANEL_W = 30;
  const HALFGOFRETNOTATIONPANEL_H = GOFRETNOTATIONPANEL_H / 2;
  const TRACKGAP = UPPERPANEL_W / NUMTRACKS;
  const HALFTRACKGAP = TRACKGAP / 2;
  const SMALLEST_MESH_LENGTH = FRETLENGTH;
  const GO_Z = -GOFRETNOTATIONPANEL_H - HALFFRETLENGTH;
  const BEATFRET_H = 6;
  const GOFRET_Y = HALFTRACKDIAMETER + FRETHEIGHT;
  // looks like for some reason, position.z = -9 is the first time you can see
  // something at the front of the runway
  let ENDOFRUNWAY_ADJ = 9;
  let FRET_MATL_MAGENTA = new THREE.MeshLambertMaterial({
    color: neonMagenta
  });
  let FRET_MATL_NEONGREEN = new THREE.MeshLambertMaterial({
    color: neonGreen
  });
  let FRET_MATL_SAFETYORANGE = new THREE.MeshLambertMaterial({
    color: safetyOrange
  });
  let FRET_MATL_YELLOW = new THREE.MeshLambertMaterial({
    color: "yellow"
  });

  function getTrackPosX(trackNum) {
    let t_posX = -UPPERPANEL_HALFW + (TRACKGAP * trackNum) + HALFTRACKGAP;
    return t_posX;
  }
  let beatFretMeshes = [];
  let goFretAnimations = [];
  //</editor-fold> FUNCTION GLOBAL VARS            END
  //<editor-fold> PANEL ARRANGEMENT ---------------- >
  // Produces position arguments for jsPanel.create
  // since one row, only offsetX is necessary and offsetY for lower panel
  // One row with two panels each part, the runway above and notation panel below
  let vertGapBetweenPanels = 0;
  let horzGapBetweenPanels = 5;
  let upperPanel_offsetX, lowerPanel_offsetX, lowerPanel_offsetY;
  if (totalNumPartsToRun == 1) { // If there is only one part to display
    upperPanel_offsetX = '0px';
    lowerPanel_offsetX = '0px';
    lowerPanel_offsetY = (UPPERPANEL_H + vertGapBetweenPanels).toString();
  } else { // More than one part to display
    // t_xoffset: 1 part-dead center; 2 parts- half-panel width to left or
    // half-panel width to right etc...
    // ptrIX is your order in the parts to run array.
    // You might be running parts 1, 6, 2, 13, 99, 3 partNum 6 is ptrIX-1
    // (ptrIX - (totalNumPartsToRun / 2) + 0.5) calculates your position
    // If you are partToRun 3 of a total of 8 parts (regardless of actual partNum),
    // you will be the part just to the left of the center part, which is part 4
    // So totalNumPartsToRun / 2 is 4, ptrIX is 2; 2-4 = -2; +0.5 = -1.5;
    // Thus 1.5 canvas widths to the left
    // MAX_W calculates which is bigger the top panel or the bottom panel and
    // sets that as the canvas width
    let t_xoffset = ((ptrIX - (totalNumPartsToRun / 2) + 0.5) * (MAX_W + horzGapBetweenPanels)).toString() + 'px';
    upperPanel_offsetX = t_xoffset
    lowerPanel_offsetX = t_xoffset;
    lowerPanel_offsetY = (UPPERPANEL_H + vertGapBetweenPanels).toString();
  }
  //</editor-fold> PANEL ARRANGEMENT               END
  //<editor-fold> CANVASES & PANELS ---------------- >
  let upperCanvas = mkCanvasDiv(UPPERPANEL_W, UPPERPANEL_H, 'black');
  notationObj['upperCanvas'] = upperCanvas;
  let upperPanel = mkPanel(upperCanvas, UPPERPANEL_W, UPPERPANEL_H, "Player " + playerNum.toString(), ['center-top', upperPanel_offsetX, '0px', 'none']);
  notationObj['upperPanel'] = upperPanel;
  let lowerCanvas = mkSVGcanvas(LOWERPANEL_W, LOWERPANEL_H);
  lowerCanvas.style.backgroundColor = 'white';
  notationObj['lowerCanvas'] = lowerCanvas;
  let lowerPanel = mkPanel(lowerCanvas, LOWERPANEL_W, LOWERPANEL_H, "Player " + playerNum.toString(), ['center-top', lowerPanel_offsetX, lowerPanel_offsetY, 'none']);
  notationObj['lowerPanel'] = lowerPanel;
  //</editor-fold> CANVASES & PANELS               END
  //</editor-fold> END NOTATION OBJECT - INIT                 END
  //<editor-fold> < NOTATION OBJECT - 3JS >                    //
  // CAMERA -------------------------------------- >
  let camera = new THREE.PerspectiveCamera(75, UPPERPANEL_W / UPPERPANEL_H, 1, 3000);
  //UPPERPANEL_W/UPPERPANEL_H is the aspect ratio
  let CAM_Y = 294; // Up and down; lower number is closer to runway, zooming in
  // z is along length of runway; higher number moves back, lower number moves forward
  let CAM_Z = -91;
  let CAM_ROTATION_X = -68; // -90 directly above looking down
  camera.position.set(0, CAM_Y, CAM_Z);
  camera.rotation.x = rads(CAM_ROTATION_X);
  notationObj['camera'] = camera;
  // SCENE --------------------------------------- >
  let scene = new THREE.Scene();
  // LIGHTS -------------------------------------- >
  // Copied from example; someday sit down and try to understand better how lights work
  let sun = new THREE.DirectionalLight(0xFFFFFF, 1.2);
  sun.position.set(100, 600, 175);
  scene.add(sun);
  let sun2 = new THREE.DirectionalLight(0x40A040, 0.6);
  sun2.position.set(-100, 350, 200);
  scene.add(sun2);
  notationObj['scene'] = scene;
  // RENDERER ------------------------------------ >
  let renderer = new THREE.WebGLRenderer();
  renderer.setSize(UPPERPANEL_W, UPPERPANEL_H);
  upperCanvas.appendChild(renderer.domElement);
  notationObj['renderer'] = renderer;
  //</editor-fold> END NOTATION OBJECT - 3JS                  END
  //<editor-fold> < NOTATION OBJECT - STATIC ELEMENTS >        //
  //<editor-fold>  < RUNWAY >                      //
  let runwayMaterial =
    new THREE.MeshLambertMaterial({
      color: 0x0040C0,
      side: THREE.DoubleSide
    });
  let runwayGeometry = new THREE.PlaneGeometry(UPPERPANEL_W, RUNWAYLENGTH, 32);
  let runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
  runway.position.z = -HALFRUNWAYLENGTH - GOFRETNOTATIONPANEL_H;
  //position.z = 0 is in the length middle, so runway.position.z is at top of the plane
  // move 1/2 runway length back and additionally move back GOFRETNOTATIONPANEL_H
  // to make room for the gofretnotationpanels
  runway.rotation.x = rads(-90); // at 0 degrees, plane is straight up and down
  scene.add(runway);
  //</editor-fold> END RUNWAY                     END
  //<editor-fold>  < TRACKS >                      //
  let trackGeometry = new THREE.CylinderGeometry(TRACKDIAMETER, TRACKDIAMETER, RUNWAYLENGTH, 32);
  let trackMaterial = new THREE.MeshLambertMaterial({
    color: 0x708090
  });
  for (let trIx = 0; trIx < 4; trIx++) {
    let newTrack = new THREE.Mesh(trackGeometry, trackMaterial);
    newTrack.rotation.x = rads(-90);
    newTrack.position.z = -HALFRUNWAYLENGTH - GOFRETNOTATIONPANEL_H;
    newTrack.position.y = -HALFTRACKDIAMETER; //so runway intersects center line of track
    //positions tracks
    newTrack.position.x = getTrackPosX(trIx);
    scene.add(newTrack);
  }
  //</editor-fold> END TRACKS                     END
  //<editor-fold>  < GO FRET >                     //
  let goFretGeometry = new THREE.CubeGeometry(FRETWIDTH, FRETHEIGHT, GOFRETLENGTH);
  for (let gfIx = 0; gfIx < 4; gfIx++) {
    newGoFret = new THREE.Mesh(goFretGeometry, FRET_MATL_SAFETYORANGE);
    // @ position.z = 0, the very top of the fret will be at the very front of the scene
    // move the fret back 1/2 the length of the fret to get the middle of the FRET
    // to the very front, then move it back the height of the notation panels to get
    // back to the end of the runway;
    newGoFret.position.z = GO_Z;
    newGoFret.position.y = GOFRET_Y;
    newGoFret.position.x = getTrackPosX(gfIx);
    newGoFret.rotation.x = rads(-14);
    scene.add(newGoFret);
    goFretAnimations.push({
      startFrame: -1,
      endFrame: -1,
      mesh: newGoFret,
    });
  }
  //</editor-fold> END GO FRET                    END
  //<editor-fold>  < GO FRET NOTATION PANEL >      //
  // upperCanvas
  // let bbRectY = UPPERPANEL_H - GOFRETNOTATIONPANEL_H;
  // getTrackPosX(trIx)
  // for (let trIx = 0; trIx < 4; trIx++) {
  // var bbRect = document.createElementNS(SVG_NS, "rect");
  // bbRect.setAttributeNS(null, "x", "0");
  // bbRect.setAttributeNS(null, "y", CRV_W.toString());
  // bbRect.setAttributeNS(null, "width", CRV_W);
  // bbRect.setAttributeNS(null, "height", 0);
  // bbRect.setAttributeNS(null, "fill", "rgba(255, 21, 160, 0.5)");
  // bbRect.setAttributeNS(null, "id", id + "crvFollowRect");
  // bbRect.appendChild(tcrvFollowRect);
  // }
  //</editor-fold> GO FRET NOTATION PANEL        END
  //<editor-fold>  < BOUNCING BALL >               //
  // const bbGeom = new THREE.SphereGeometry(9, 64, 64);
  // const bbMatl = new THREE.MeshBasicMaterial({
  //   color: 'red'
  // });
  // for (let trIx = 0; trIx < 4; trIx++) {
  //   const newBb = new THREE.Mesh(bbGeom, bbMatl);
  //   newBb.position.z = -HALFGOFRETNOTATIONPANEL_H - 2;
  //   newBb.position.y = 0;
  //   newBb.rotation.y = rads(10);
  //   newBb.position.x = getTrackPosX(trIx);
  //   // newBb.rotation.x = rads(-22);
  //   scene.add(newBb);
  // }
  //</editor-fold> BOUNCING BALL                 END
  //<editor-fold>  < NOTATION >                    //
  // eventData should generate beatNum/Pitch/Rhythm
  ////Beat number will give x and initial y
  ////Pitch will give y refinement & give initial info for rhythmic motive
  ////Rhythm will select Rhythmic motive make dictionary of names
  //Draw all and then figure out way to make/visible
  //Draw all motives at each beat
  //Inscore call will be a string that is peaced together
  //NEW WORKFLOW
  //// NEED TO DRAW ALL NOTATION AND THEN JUST MAKE IT VISIBLE/INVISIBLE
  //// IDENTIFIER: beatNum:[0].cis4.qunituplet
  ////// Array of 8 beats
  //////// Dict: g3, gis3, a3, c4, cis4, g4, gis4, a4
  //////// Dict containing appropriate notation string
  let newNotes = [];
  let newNote = {};
  newNote['beatNum'] = 3;
  newNote['pitch'] = 'gis3';
  newNote['motive'] = 'eighthR_two16ths';
  let notationSvgPaths = [
    "/pieces/sf004/notationSVGs/quintuplet_sharp_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/quintuplet_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/quintuplet_2LedgerOn.svg",
    "/pieces/sf004/notationSVGs/quintuplet_sharp_1Ledger.svg",
    "/pieces/sf004/notationSVGs/quintuplet_1Ledger.svg",
    "/pieces/sf004/notationSVGs/quintuplet_sharp.svg",
    "/pieces/sf004/notationSVGs/quintuplet.svg",
    "/pieces/sf004/notationSVGs/quadruplet_sharp_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/quadruplet_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/quadruplet_2LedgerOn.svg",
    "/pieces/sf004/notationSVGs/quadruplet_sharp_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/quadruplet_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/quadruplet_sharp.svg",
    "/pieces/sf004/notationSVGs/quadruplet.svg",
    "/pieces/sf004/notationSVGs/triplet_sharp_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/triplet_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/triplet_2LedgerOn.svg",
    "/pieces/sf004/notationSVGs/triplet_sharp_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/triplet_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/triplet_sharp.svg",
    "/pieces/sf004/notationSVGs/triplet.svg",
    "/pieces/sf004/notationSVGs/dot8thR_16th_sharp_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/dot8thR_16th_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/dot8thR_16th_2LedgerOn.svg",
    "/pieces/sf004/notationSVGs/dot8thR_16th_sharp_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/dot8thR_16th_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/dot8thR_16th_sharp.svg",
    "/pieces/sf004/notationSVGs/dot8thR_16th.svg",
    "/pieces/sf004/notationSVGs/two16th_8thR_sharp_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/two16th_8thR_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/two16th_8thR_sharp.svg",
    "/pieces/sf004/notationSVGs/two16th_8thR_1Ledger.svg",
    "/pieces/sf004/notationSVGs/two16th_8thR_2LedgerOn.svg",
    "/pieces/sf004/notationSVGs/two16th_8thR_sharp_1Ledger.svg",
    "/pieces/sf004/notationSVGs/two16th_8thR.svg",
    "/pieces/sf004/notationSVGs/eighthR_two16ths_sharp_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/eighthR_two16ths_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/eighthR_two16ths_2LedgerOn.svg",
    "/pieces/sf004/notationSVGs/eighthR_two16ths_sharp_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/eighthR_two16ths_sharp.svg",
    "/pieces/sf004/notationSVGs/eighthR_two16ths_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/eighthR_two16ths.svg",
    "/pieces/sf004/notationSVGs/eighthR_8th_sharp_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/eighthR_8th_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/eighthR_8th_2LedgerOn.svg",
    "/pieces/sf004/notationSVGs/eighthR_8th_sharp_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/eighthR_8th_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/eighthR_8th_sharp.svg",
    "/pieces/sf004/notationSVGs/eighthR_8th.svg",
    "/pieces/sf004/notationSVGs/quarter_sharp_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/quarter_2LedgerBelow.svg",
    "/pieces/sf004/notationSVGs/quarter_sharp_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/quarter_2LedgerOn.svg",
    "/pieces/sf004/notationSVGs/quarter_1LedgerOn.svg",
    "/pieces/sf004/notationSVGs/quarter_sharp.svg",
    "/pieces/sf004/notationSVGs/quarter.svg"
  ];
  // Create dictionary, store each svg on each beat as:
  //// notation.beat5.cis4.eighthR_two16ths
  var seekString = "notationSVGs/";

  let str = "/pieces/sf004/notationSVGs/quarter.svg";

  var idx = str.indexOf(seekString);

  if (idx !== -1) {
    var result = str.substring(idx + seekString.length, str.length);
    console.log(result);
  }
  let notationPerBeat = [];
  //Add Motive name first then pitchesDict
  let t_pitchesDict = {
    g3: {},
    gis3: {},
    a3: {},
    c4: {},
    cis4: {},
    g4: {},
    gis4: {},
    a4: {}
  }
  for (let beatNum = 0; beatNum < 8; beatNum++) {
    let t_key = 'b' + beatNum;
    notationPerBeat.push(Object.assign({}, t_pitchesDict));
  }
  console.log(notationPerBeat);
//make svgs for each pitch with all beats in lilypond
//b1 x=52; y=21
//// b1 quarter_2LedgerBelow.svg y31 x49
//// quarter_sharp_2LedgerBelow y31 x42
//// quarter_2LedgerOn y28 x49
//// quarter_1LedgerOn y21 x49
//// quarter_sharp_1LedgerOn y21 x42
//// g4 quarter y8 x52
//// gis4 quarter_sharp y9 x43
//// a4 quarter y5 x52

//// g3 quintuplet_2LedgerBelow y22 x49
//// gis3 quintuplet_sharp_2LedgerBelow y22 x42
//// a3 quintuplet_2LedgerOn y17 x50
//// c4 quintuplet_1Ledger y10 x49
//b2 x=119
//b3 x=186
//b4 x=254
//b5 x=329
//b6 x=396
//b7 x=464
//b8 x=531
//b9  x=42; y=121
//b10 x=110
//b11 x=177
//b12 x=244
//b13 x=320
//b14 x=387
//b15 x=454
//b16 x=521


  // let emptyStaff = document.createElementNS(SVG_NS, "image");
  // emptyStaff.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/emptyStaff.svg');
  // emptyStaff.setAttributeNS(null, "y", -85);
  // emptyStaff.setAttributeNS(null, "x", 0);
  // emptyStaff.setAttributeNS(null, "visibility", 'visible');
  // lowerCanvas.appendChild(emptyStaff);

//Make one beat with all of the motives, then one full staff with one motive
// Then figure out if there is a system using objects that you can implement, don't forget the arguments assignable on the fly from webaudio_analyze sounefileforpitches



    let allq = document.createElementNS(SVG_NS, "image");
    allq.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/allQtrs_c4.svg');
    allq.setAttributeNS(null, "y", -85);
    allq.setAttributeNS(null, "x", 0);
    allq.setAttributeNS(null, "visibility", 'visible');
    lowerCanvas.appendChild(allq);

    let tn = document.createElementNS(SVG_NS, "image");
    tn.setAttributeNS(XLINK_NS, 'xlink:href', "/pieces/sf004/notationSVGs/quintuplet_1Ledger.svg");
    tn.setAttributeNS(null, "y", 10);
    tn.setAttributeNS(null, "x", 49);
    tn.setAttributeNS(null, "visibility", 'visible');
    lowerCanvas.appendChild(tn);
  /*
  let in1 = document.createElementNS(SVG_NS, "image");
  in1.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/b1_rest.svg');
  in1.setAttributeNS(null, "y", -85);
  in1.setAttributeNS(null, "x", 0);
  lowerCanvas.appendChild(in1);

  var in2 = document.createElementNS(SVG_NS, "image");
  in2.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/b2_quarter_c4.svg');
  in2.setAttributeNS(null, "y", -85);
  in2.setAttributeNS(null, "x", 0);
  lowerCanvas.appendChild(in2);

  var in3 = document.createElementNS(SVG_NS, "image");
  in3.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/b3_quarter_c4.svg');
  in3.setAttributeNS(null, "y", -85);
  in3.setAttributeNS(null, "x", 0);
  lowerCanvas.appendChild(in3);

  var in4 = document.createElementNS(SVG_NS, "image");
  in4.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/b4_quarter_c4.svg');
  in4.setAttributeNS(null, "y", -85);
  in4.setAttributeNS(null, "x", 0);
  lowerCanvas.appendChild(in4);

  var in5 = document.createElementNS(SVG_NS, "image");
  in5.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/b5_quarter_c4.svg');
  in5.setAttributeNS(null, "y", -85);
  in5.setAttributeNS(null, "x", 0);
  lowerCanvas.appendChild(in5);

  var in6 = document.createElementNS(SVG_NS, "image");
  in6.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/b6_quarter_c4.svg');
  in6.setAttributeNS(null, "y", -85);
  in6.setAttributeNS(null, "x", 0);
  lowerCanvas.appendChild(in6);

  var in7 = document.createElementNS(SVG_NS, "image");
  in7.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/b7_quarter_c4.svg');
  in7.setAttributeNS(null, "y", -85);
  in7.setAttributeNS(null, "x", 0);
  lowerCanvas.appendChild(in7);

  var in8 = document.createElementNS(SVG_NS, "image");
  in8.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/b8_quarter_c4.svg');
  in8.setAttributeNS(null, "y", -85);
  in8.setAttributeNS(null, "x", 0);
  lowerCanvas.appendChild(in8);

  var r2_1 = document.createElementNS(SVG_NS, "image");
  r2_1.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/b9_quarter_c4.svg');
  r2_1.setAttributeNS(null, "y", -85);
  r2_1.setAttributeNS(null, "x", 0);
  lowerCanvas.appendChild(r2_1);

  /*
  var sam = document.createElementNS(SVG_NS, "image");
  sam.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/sampleFilledStaff5.svg');
  sam.setAttributeNS(null, "y", 0);
  sam.setAttributeNS(null, "x", 0);
  // lowerCanvas.appendChild(sam);
  var r2_2 = document.createElementNS(SVG_NS, "image");
  r2_2.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/quarter_c4.svg');
  r2_2.setAttributeNS(null, "y", 100);
  r2_2.setAttributeNS(null, "x", 63);
  lowerCanvas.appendChild(r2_2);
  var r2_3 = document.createElementNS(SVG_NS, "image");
  r2_3.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/quarter_c4.svg');
  r2_3.setAttributeNS(null, "y", 100);
  r2_3.setAttributeNS(null, "x", 132);
  lowerCanvas.appendChild(r2_3);
  var r2_4 = document.createElementNS(SVG_NS, "image");
  r2_4.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/quarter_c4.svg');
  r2_4.setAttributeNS(null, "y", 100);
  r2_4.setAttributeNS(null, "x", 199);
  lowerCanvas.appendChild(r2_4);
  var r2_5 = document.createElementNS(SVG_NS, "image");
  r2_5.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/quarter_c4.svg');
  r2_5.setAttributeNS(null, "y", 100);
  r2_5.setAttributeNS(null, "x", 275);
  lowerCanvas.appendChild(r2_5);
  var r2_6 = document.createElementNS(SVG_NS, "image");
  r2_6.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/quarter_c4.svg');
  r2_6.setAttributeNS(null, "y", 100);
  r2_6.setAttributeNS(null, "x", 343);
  lowerCanvas.appendChild(r2_6);
  var r2_7 = document.createElementNS(SVG_NS, "image");
  r2_7.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/quarter_c4.svg');
  r2_7.setAttributeNS(null, "y", 100);
  r2_7.setAttributeNS(null, "x", 411);
  lowerCanvas.appendChild(r2_7);
  var r2_8 = document.createElementNS(SVG_NS, "image");
  r2_8.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notation/quarter_c4.svg');
  r2_8.setAttributeNS(null, "y", 100);
  r2_8.setAttributeNS(null, "x", 479);
  lowerCanvas.appendChild(r2_8);
  */
  //</editor-fold> NOTATION                       END
  //</editor-fold> END NOTATION OBJECT - STATIC ELEMENTS      END
  //<editor-fold> < NOTATION OBJECT - MESHES FOR ANIMATION >   //
  // MAKE ENOUGH MESHES TO FILL RUNWAY LENGTHWISE
  // make them not visible
  let maxNumBeatFrets = Math.ceil((RUNWAYLENGTH / SMALLEST_MESH_LENGTH) * NUMTRACKS);
  for (let meshIx = 0; meshIx < maxNumBeatFrets; meshIx++) {
    let t_fretGeometry = new THREE.CubeGeometry(FRETWIDTH, FRETHEIGHT, FRETLENGTH);
    let t_fretMaterial = new THREE.MeshLambertMaterial({
      color: neonMagenta
    });
    let newBeatFret = new THREE.Mesh(t_fretGeometry, t_fretMaterial);
    newBeatFret.position.z = GO_Z + 9999;
    newBeatFret.position.y = HALFTRACKDIAMETER + BEATFRET_H;
    newBeatFret.position.x = 9999;
    newBeatFret.visible = false;
    scene.add(newBeatFret);
    beatFretMeshes.push(newBeatFret);
  }
  //</editor-fold> END NOTATION OBJECT - MESHES FOR ANIMATION END
  //<editor-fold> < NOTATION OBJECT - ANIMATE >                //
  notationObj['animate'] = function(now_pieceTimeMS, a_framect) {
    // Hide all meshes
    beatFretMeshes.forEach((mesh) => {
      mesh.visible = false;
    });
    let framect = a_framect < 0 ? 0 : a_framect; // for negative a_framect
    // Find the eventsObj for this frame
    let t_eventsObj = partScore_byFrame_byType[framect];
    //<editor-fold> RUNWAY_BEATFRETS --------------- >
    if ('runway_beatFret' in t_eventsObj) {
      t_eventsObj.runway_beatFret.forEach((event, evtIx) => {
        let t_goTime = event.goTime;
        let t_goFrame = event.goFrame;
        let t_trackNum = event.trackNum;
        let t_meshToUse = beatFretMeshes[evtIx];
        // Calc Pos z
        let t_timeTilGo_MS = t_goTime - now_pieceTimeMS;
        let t_pxTilGo = t_timeTilGo_MS * PXPERMS;
        // What Color material
        let t_matl = (t_trackNum % 2) == 0 ? FRET_MATL_MAGENTA : FRET_MATL_NEONGREEN
        t_meshToUse.position.z = GO_Z - t_pxTilGo;
        t_meshToUse.material = t_matl; // bf color
        t_meshToUse.position.x = getTrackPosX(t_trackNum);
        t_meshToUse.visible = true;
        // EVENT GO
        if (!(a_framect < 0)) { //for negative a_framect
          if (t_goFrame == framect) {
            goFretAnimations[t_trackNum].startFrame = a_framect;
            goFretAnimations[t_trackNum].endFrame = a_framect + 5;
          }
        }
      });
    }
    //</editor-fold> RUNWAY_BEATFRETS END
    //<editor-fold> GO FRET ANIMATION -------------- >
    goFretAnimations.forEach((gfObj, trIx) => {
      if (a_framect >= 0 && gfObj.endFrame >= a_framect) {
        gfObj.mesh.material = FRET_MATL_YELLOW;
      } else {
        gfObj.mesh.material = FRET_MATL_SAFETYORANGE;
      }
    });
    //</editor-fold> GO FRET ANIMATION END
  }
  //</editor-fold> END NOTATION OBJECT - ANIMATE              END
  // RENDER ---------------------------------- >
  renderer.render(scene, camera);
  return notationObj;
}
//</editor-fold> >> END NOTATION OBJECT  //////////////////////////////////////

//<editor-fold> << ANIMATION ENGINE >> ------------------------------------- //
//<editor-fold>  < ANIMATION ENGINE - ENGINE >           //
// Animation Engine works like this:
//// -> Get current timestamp from timeSync
//// -> Calculate the time transpired since the last frame
//// -> If the change is < framerate then:
////// -> Continue to accumulate the change between each requestAnimationFrame cycle until it is >= framerate
////// -> But do not run the animationEngine
//// -> If the change is > framerate then:
////// -> Run this loop:
//////// -> Advance animationEngine 1 frame: run update() & draw()
//////// -> Subtract 1 frame duration from the cumulativeChange
//////// -> Continue to run the loop until the cumulativeChange falls below the framerate
//// -> Any remainder is carried over to the next cycle, guaranteeing a fixed framerate
function animationEngine(timestamp) { //timestamp not used. Using timesync instead
  // Get current timestamp from timeSync
  let ts_Date = new Date(TS.now());
  ts_now_epochTime = ts_Date.getTime();
  // Calculate a cumulative change between frames
  cumulativeChangeBtwnFrames_MS += ts_now_epochTime - lastFrame_epochTime;
  // Update lastFrame_epochTime with current timestamp for next cycle
  lastFrame_epochTime = ts_now_epochTime;
  // Calculate pieceClockTime_MS
  let pieceTime_MS = ts_now_epochTime - pieceClock0_epochTime;
  // Send locally to display clock, and update, no global variable
  calcDisplayClock(pieceTime_MS);
  // For as many times as the cumulativeChangeBtwnFrames_MS is >= the framerate
  while (cumulativeChangeBtwnFrames_MS >= MSPERFRAME) {
    // Run the animationEngine 1 frame
    update(pieceTime_MS);
    draw();
    // Continue advancing the animationEngine frame-by-frame until the cumulativeChangeBtwnFrames_MS is < the framerate
    cumulativeChangeBtwnFrames_MS -= MSPERFRAME;
    // Any remainder is carried over to the next cycle, guaranteeing a fixed framerate
  }
  if (animation_isGo) requestAnimationFrame(animationEngine); // gate for use with pause
}
//</editor-fold> END ANIMATION ENGINE - ENGINE             END
//<editor-fold>     < ANIMATION ENGINE - UPDATE >           //
function update(now_pieceClock) {
  // ANIMATE ---------------------- >
  notationObjects.forEach(function(nObj) {
    nObj.animate(now_pieceClock, frameCount);
  });
  frameCount++;
}
//</editor-fold> END ANIMATION ENGINE - UPDATE             END
//<editor-fold>     < ANIMATION ENGINE - DRAW >             //
function draw() {
  // RENDER ----------------------- >
  notationObjects.forEach(function(nObj) {
    nObj.renderer.render(nObj.scene, nObj.camera);
  });
}
//</editor-fold> END ANIMATION ENGINE - DRAW               END
//</editor-fold>  > END ANIMATION ENGINE  /////////////////////////////////////

//<editor-fold>  <<<< UTILITIES >>>> --------------------------------------- //
//<editor-fold>   < UTILITIES - CLOCK >                  //
// This clock displays the current time in the piece
// It appears in a panel in the upper-right corner
// It starts minimized
let displayClock_div = mkCanvasDiv(64, 20, 'yellow');
let displayClock_panel = mkClockPanel(displayClock_div);
displayClock_panel.smallify();

function calcDisplayClock(now_pieceTimeMS) {
  let displayClock_TimeSec, displayClock_TimeMin, displayClock_TimeHrs;
  let displayClock_TimeSec_a = Math.floor(now_pieceTimeMS / 1000) % 60;
  let displayClock_TimeMin_a = Math.floor(now_pieceTimeMS / 60000) % 60;
  let displayClock_TimeHrs_a = Math.floor(now_pieceTimeMS / 3600000);
  // For negative clockTime_MS, display countdown timer instead
  displayClock_TimeHrs_a < 0 ? displayClock_TimeHrs = 0 : displayClock_TimeHrs = displayClock_TimeHrs_a;
  displayClock_TimeMin_a < 0 ? displayClock_TimeMin = 0 : displayClock_TimeMin = displayClock_TimeMin_a;
  displayClock_TimeSec_a < 0 ? displayClock_TimeSec = -displayClock_TimeSec_a : displayClock_TimeSec = displayClock_TimeSec_a;
  displayClock_div.innerHTML = pad(displayClock_TimeHrs, 2) + ":" + pad(displayClock_TimeMin, 2) + ":" + pad(displayClock_TimeSec, 2);
}
//</editor-fold> END UTILITIES - CLOCK END
//<editor-fold>   < UTILITIES - COLORS >                 //
let seaGreen = "rgb(0, 255, 108)";
let neonMagenta = "rgb(255, 21, 160)";
let neonBlue = "rgb(6, 140, 225)";
let electricBlue = "rgb(125, 249, 225)";
let forest = "rgb(11, 102, 35)";
let jade = "rgb(0, 168, 107)";
let neonGreen = "rgb(57, 255, 20)";
let limeGreen = "rgb(153, 255, 0)";
let neonRed = "rgb(255, 37, 2)";
let safetyOrange = "rgb(255, 103, 0)";
let deepPink = "#FF1493";
let turquoise = "#30D5C8";
//</editor-fold> END UTILITIES - COLORS END
//</editor-fold>  > END UTILITIES  ////////////////////////////////////////////









//









//// SAMPLE SECTIONERS
//<editor-fold> << ANIMATION ENGINE >> ------------------------------------- //
//</editor-fold> >> END ANIMATION ENGINE  /////////////////////////////////////
//<editor-fold>  < ANIMATION ENGINE - UPDATE >           //
//</editor-fold> END ANIMATION ENGINE - UPDATE          END
// SUBSECTION_L1 ------------------------------- >
//<editor-fold> SUBSECTION_L1 ------------------ >
//</editor-fold> SUBSECTION_L1 END
// << SUBSECTION_L2 ---------------------------- >
// << << SUBSECTION_L3 ------------------------- >



//
