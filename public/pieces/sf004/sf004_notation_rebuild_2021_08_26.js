//#ef GLOBAL VARIABLES


//##ef General Variables
let scoreData;
let NUM_TEMPOS = 5;
let NUM_PLAYERS = 5;
const TEMPO_COLORS = [clr_brightOrange, clr_brightGreen, clr_brightBlue, clr_lavander, clr_darkRed2];
//##endef General Variables

//##ef Timing
const FRAMERATE = 60;
const PX_PER_SEC = 100;
const PX_PER_FRAME = PX_PER_SEC / FRAMERATE;
//##endef Timing

//##ef World Canvas Variables
let worldPanel;
const CANVAS_L_R_MARGINS = 35;
const CANVAS_MARGIN = 7;
const CANVAS_W = 692 + (CANVAS_L_R_MARGINS * 2) + (CANVAS_MARGIN * 2);
const CANVAS_H = 578;
const CANVAS_CENTER = CANVAS_W / 2;
//##endef END World Canvas Variables

//##ef ThreeJS Scene Variables
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
let matl_yellow = new THREE.MeshLambertMaterial({
  color: 'yellow'
});
// const CAM_Y = 216; // Up and down; lower number is closer to runway, zooming in
const CAM_Y = 150;
// const CAM_Z = -59; // z is along length of runway; higher number moves back, lower number moves forward
const CAM_Z = 21;
// const CAM_ROTATION_X = -68; // -90 directly above looking down
const CAM_ROTATION_X = -45; // -90 directly above looking down
//##endef END ThreeJS Scene Variables

//##ef Runway Variables
const RUNWAY_W = RENDERER_W;
const RUNWAY_H = RENDERER_H;
const RUNWAY_L = 1000;
const HALF_RUNWAY_W = RUNWAY_W / 2;
const HALF_RUNWAY_LENGTH = RUNWAY_L / 2;
const RUNWAY_LENGTH_FRAMES = Math.round(RUNWAY_L / PX_PER_FRAME);
//##endef END Runway Variables

//##ef Tracks Variables
const NUM_TRACKS = NUM_TEMPOS;
const TRACK_DIAMETER = 8;
const HALF_TRACK_DIAMETER = TRACK_DIAMETER / 2;
const TRACK_GAP = RUNWAY_W / NUM_TRACKS;
const HALF_TRACK_GAP = TRACK_GAP / 2;
let xPosOfTracks = [];
for (let trIx = 0; trIx < NUM_TRACKS; trIx++) {
  xPosOfTracks.push(-HALF_RUNWAY_W + (TRACK_GAP * trIx) + HALF_TRACK_GAP);
}
//##endef END Tracks Variables

//##ef Go Frets Variables
let goFrets = [];
let goFretsGo = [];
const GO_FRET_W = 54;
const GO_FRET_H = 11;
const HALF_GO_FRET_H = GO_FRET_H / 2;
const GO_FRET_L = 13;
const HALF_GO_FRET_L = GO_FRET_L / 2;
const GO_Z = -HALF_GO_FRET_L;
const GO_FRET_Y = HALF_TRACK_DIAMETER;
//##endef END Go Frets Variables

//#ef Tempo Frets Variables
let tempoFretsPerTrack = [];
const TEMPO_FRET_W = GO_FRET_W - 2;
const TEMPO_FRET_H = GO_FRET_H - 2;
const TEMPO_FRET_L = GO_FRET_L - 5;
const TEMPO_FRET_Y = HALF_TRACK_DIAMETER;
const NUM_TEMPO_FRETS_TO_FILL = RUNWAY_L / TEMPO_FRET_L; //Initially make enough tempo frets, which end to end would fill track length
//#endef Tempo Frets Variables

//##ef BBs Variables
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
const BBCIRC_BOTTOM_CY = BB_H - BBCIRC_R;
const BB_TRAVEL_DIST = BBCIRC_BOTTOM_CY - BBCIRC_TOP_CY;
const BB_BOUNCE_WEIGHT = 6;
const HALF_BB_BOUNCE_WEIGHT = BB_BOUNCE_WEIGHT / 2;
//##endef BBs Variables

//##ef Staff Notation Variables


let rhythmicNotationObj = {};
let notationImageObjectSet = {};

const BEAT_LENGTH_PX = 85;
const TOP_STAFF_LINE_Y = 113;
const VERT_DIST_BTWN_STAVES = 133;
const VERT_DIST_BTWN_STAFF_LINES = 8;
const FIRST_BEAT_L = 12;
const LAST_BEAT_W = BEAT_LENGTH_PX - FIRST_BEAT_L;
const NUM_BEATS_PER_STAFFLINE = 8;
const NUM_STAFFLINES = 2;
const TOTAL_NUM_BEATS = NUM_BEATS_PER_STAFFLINE * NUM_STAFFLINES;
const LAST_BEAT_NUM_IN_LINE = NUM_BEATS_PER_STAFFLINE - 1;
const STAFF_BTM_MARGIN = 40;
const NOTEHEAD_W = 10;
const NOTEHEAD_H = 8;
const HALF_NOTEHEAD_H = NOTEHEAD_H / 2;
const RHYTHMIC_NOTATION_CANVAS_W = FIRST_BEAT_L + (BEAT_LENGTH_PX * NUM_BEATS_PER_STAFFLINE) + FIRST_BEAT_L; //canvas longer to display notation but cursors will only travel duration of beat thus not to the end of the canvas
const RHYTHMIC_NOTATION_CANVAS_H = TOP_STAFF_LINE_Y + ((NUM_STAFFLINES - 1) * VERT_DIST_BTWN_STAVES) + STAFF_BTM_MARGIN;
const RHYTHMIC_NOTATION_CANVAS_TOP = CANVAS_MARGIN + RENDERER_H + BB_H + CANVAS_MARGIN;
const RHYTHMIC_NOTATION_CANVAS_L = CANVAS_MARGIN + CANVAS_L_R_MARGINS;
const NOTATION_CURSOR_H = 83;

//###ef Beat Coordinates
let beatXLocations = [];
for (let beatLocIx = 0; beatLocIx < NUM_BEATS_PER_STAFFLINE; beatLocIx++) {
  beatXLocations.push(FIRST_BEAT_L + (beatLocIx * BEAT_LENGTH_PX));
}

let beatCoords = [];
for (let staffIx = 0; staffIx < NUM_STAFFLINES; staffIx++) {
  for (let beatPerStaffIx = 0; beatPerStaffIx < NUM_BEATS_PER_STAFFLINE; beatPerStaffIx++) {
    let tCoordObj = {};
    tCoordObj['x'] = FIRST_BEAT_L + (beatPerStaffIx * BEAT_LENGTH_PX);
    tCoordObj['y'] = TOP_STAFF_LINE_Y + (staffIx * VERT_DIST_BTWN_STAVES) + HALF_NOTEHEAD_H;
    beatCoords.push(tCoordObj);
  }
}
//###endef Beat Coordinates

//###ef Motive Dictionary
let motiveDictionary = [{ // {path:, lbl:, num:, w:, h:}//used to be notationSvgPaths_labels
    path: "/pieces/sf004/notationSVGs/qtr_rest.svg",
    lbl: 'qtr_rest',
    num: -1,
    w: 8.83,
    h: 23.77
  },
  {
    path: "/pieces/sf004/notationSVGs/quarter.svg",
    lbl: 'quarter',
    num: 0,
    w: 9.74,
    h: 62.21
  },
  {
    path: "/pieces/sf004/notationSVGs/dot8thR_16th.svg",
    lbl: 'dot8thR_16th',
    num: 1,
    w: 72.11,
    h: 62.95
  },
  {
    path: "/pieces/sf004/notationSVGs/eighthR_8th.svg",
    lbl: 'eighthR_8th',
    num: 2,
    w: 51.24,
    h: 62.62
  },
  {
    path: "/pieces/sf004/notationSVGs/triplet.svg",
    lbl: 'triplet',
    num: 3,
    w: 68.53,
    h: 76.73
  },
  {
    path: "/pieces/sf004/notationSVGs/quadruplet.svg",
    lbl: 'quadruplet',
    num: 4,
    w: 71.52,
    h: 62.62
  },
  {
    path: "/pieces/sf004/notationSVGs/quintuplet.svg",
    lbl: 'quintuplet',
    num: 5,
    w: 76.96,
    h: 76.67
  },
  {
    path: "/pieces/sf004/notationSVGs/eighthR_two16ths.svg",
    lbl: 'eighthR_two16ths',
    num: 6,
    w: 72.45,
    h: 62.62
  },
  {
    path: "/pieces/sf004/notationSVGs/two16th_8thR.svg",
    lbl: 'two16th_8thR',
    num: 7,
    w: 50.85,
    h: 62.62
  }

];
//###endef Motive Dictionary

//###ef Dynamics & Accents
let dynamicsAccents_paths_labels = [{
  path: "/pieces/sf004/notationSVGs/dynamics_accents/sf.svg",
  lbl: 'sf'
}];
//###endef Dynamics & Accents

let motivesByBeat = [];
for (let beatIx = 0; beatIx < TOTAL_NUM_BEATS; beatIx++) motivesByBeat.push({});

//##endef END Staff Notation Variables

//##ef Scrolling Tempo Cursors
let tempoCursors = [];
//##endef Scrolling Tempo Cursors

//##ef Player Tokens
let playerTokens = []; //tempo[ player[ {:svg,:text} ] ]
//##endef Player Tokens

//##ef Signs Variables
const SIGN_W = TEMPO_FRET_W - 10;
const SIGN_H = 150;
const HALF_SIGN_H = SIGN_H / 2;
let signsByPlrByTrack = [];
const NUM_AVAILABLE_SIGN_MESHES_PER_TRACK = Math.round(NUM_TEMPO_FRETS_TO_FILL / 10);
//##endef Signs Variables

//##ef Unison Signs Variables
let unisonSignsByTrack = [];
let unisonOffSignsByTrack = [];
//##endef Unison Signs Variables

//##ef Unison Token Variables
let unisonToken;
//##endef Unison Token Variables

//##ef Pitch Sets Variables

pitchSetsObj = {};
let PITCH_SETS_W = 120;
let PITCH_SETS_H = 80;
let PITCH_SETS_TOP = BB_TOP + BB_H - PITCH_SETS_H;
let PITCH_SETS_LEFT = RHYTHMIC_NOTATION_CANVAS_L;
let PITCH_SETS_CENTER_W = PITCH_SETS_W / 2;
let PITCH_SETS_MIDDLE_H = PITCH_SETS_H / 2;

//###ef Pitch Sets Dictionary
let pitchSetsPath = "/pieces/sf004/notationSVGs/pitchSets/";

let pitchSetsDictionary = [{ // {path:,lbl:,num:,w:,h:}
    path: pitchSetsPath + 'e4_e5.svg',
    lbl: 'e4_e5',
    num: 0,
    w: 41.57,
    h: 45.17
  },
  {
    path: pitchSetsPath + 'e4_e5_b4.svg',
    lbl: 'e4_e5_b4',
    num: 1,
    w: 41.57,
    h: 45.17
  },
  {
    path: pitchSetsPath + 'e4_e5_b4cluster.svg',
    lbl: 'e4_e5_b4cluster',
    num: 2,
    w: 41.57,
    h: 44.8
  },
  {
    path: pitchSetsPath + 'e4cluster_e5cluster_b4cluster.svg',
    lbl: 'e4cluster_e5cluster_b4cluster',
    num: 3,
    w: 109.68,
    h: 59.22
  }
];
//###endef Pitch Sets Dictionary

const NUM_PITCHSETS = Object.keys(pitchSetsDictionary).length;
pitchSetsObj['svgs'] = new Array(NUM_PITCHSETS);

//##endef Pitch Sets Variables

//##ef Articulations Variables
let articulationsPath = "/pieces/sf004/notationSVGs/dynamics_accents/";

let articulationsObj = {
  sf: {
    path: articulationsPath + 'sf.svg',
    amt: TOTAL_NUM_BEATS,
    num: 0,
    w: 16.46,
    h: 17.18
  },
  marcato: {
    path: articulationsPath + 'marcato.svg',
    amt: (TOTAL_NUM_BEATS * 5),
    num: 1,
    w: 8.3,
    h: 9.13
  }
};
//##endef END Articulations Variables


//#ef SOCKET IO
let ioConnection;

if (window.location.hostname == 'localhost') {
  ioConnection = io();
} else {
  ioConnection = io.connect(window.location.hostname);
}
const SOCKET = ioConnection;
//#endef > END SOCKET IO


//#endef GLOBAL VARIABLES

//#ef INIT


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
  makeStaffNotation();
  makeScrollingTempoCursors();
  makePlayerTokens();
  makeSigns();
  makeUnisonSigns();
  makeUnisonToken();
  makePitchSets();
  makeArticulations();

  RENDERER.render(SCENE, CAMERA);

} // function init() END


//#endef INIT

//#ef PROCESS URL ARGS


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


//#endef PROCESS URL ARGS

//#ef GENERATE SCORE DATA


function generateScoreData() {


  //##ef GENERATE SCORE DATA - VARIABLES
  let scoreDataObject = {};
  scoreDataObject['tempos'] = [];
  scoreDataObject['tempoFretsLoopLengthInFrames_perTempo'] = [];
  scoreDataObject['goFrames_perTempo'] = [];
  scoreDataObject['tempoFretLocations_perTempo'] = [];
  scoreDataObject['goFretsState_perTempo'] = [];
  scoreDataObject['leadIn_tempoFretLocations_perTempo'] = [];
  scoreDataObject['bbYpos_perTempo'] = [];
  scoreDataObject['leadIn_bbYpos_perTempo'] = [];
  scoreDataObject['scrollingCsrCoords_perTempo'] = [];
  scoreDataObject['tempoChanges_perPlayer'] = [];
  scoreDataObject['tempoFlagLocs_perPlayer'] = [];
  scoreDataObject['leadIn_tempoFlagLocs_perPlayer'] = [];
  scoreDataObject['playerTokenTempoNum_perPlayer'] = [];
  scoreDataObject['unisons'] = [];
  scoreDataObject['unisonFlagLocs'] = [];
  scoreDataObject['leadIn_unisonFlagLocs'] = [];
  scoreDataObject['unisonPlayerTokenTempoNum'] = [];
  scoreDataObject['motiveSet'] = [];
  //##endef GENERATE SCORE DATA - VARIABLES

  //##ef Generate Tempos

  // Generate 5 Tempos
  let baseTempo = choose([85, 91, 77]);
  let tempoRangeVarianceMin = 0.0045;
  let tempoRangeVarianceMax = 0.007;

  let tTempo = baseTempo;
  for (let tempoIx = 0; tempoIx < NUM_TEMPOS; tempoIx++) {
    tTempo += rrand(tempoRangeVarianceMin, tempoRangeVarianceMax) * tTempo;
    scoreDataObject.tempos.push(tTempo);
  }

  //##endef Generate Tempos

  //##ef CALCULATIONS PER TEMPO
  scoreDataObject.tempos.forEach((tempo) => {


    //##ef Calculate Loop Length & Go Frames


    // make about 11 minutes worth of beats divisible by 16(TOTAL_NUM_BEATS) for scrolling cursor coordination
    let framesPerBeat = FRAMERATE / (tempo / 60);
    let beatsPerCycle = Math.round(tempo * 11);
    while ((beatsPerCycle % TOTAL_NUM_BEATS) != 0) { //keep adding beats until the cycle is divisible by TOTAL_NUM_BEATS
      beatsPerCycle++;
      if (beatsPerCycle > 99999) break;
    }

    // MAKE A SET OF GO FRAMES FOR THIS CYCLE
    let goFrames_thisTempo = [];
    for (let beatIx = 0; beatIx < beatsPerCycle; beatIx++) {
      goFrames_thisTempo.push(Math.round(framesPerBeat * beatIx));
    }

    // CALCULATE LENGTH OF LOOP FOR THIS TEMPO IN FRAMES
    // The end of the loop will be the the last go frame in this cycle
    let tempoFretsLoopLengthInFrames_thisTempo = goFrames_thisTempo[goFrames_thisTempo.length - 1];
    scoreDataObject.tempoFretsLoopLengthInFrames_perTempo.push(tempoFretsLoopLengthInFrames_thisTempo); //store in object variable

    // Remove last frame to assure accurate loop; last frame should be a go frame, this makes 0 of the next cycle the actual next go frame
    // goFrames_thisTempo.pop();

    scoreDataObject.goFrames_perTempo.push(goFrames_thisTempo);


    //##endef Calculate Loop Length & Go Frames

    //##ef Calculate Tempo Fret Locations Per Frame


    //###ef Tempo Fret Main Cycle
    let tempoFretLocs_thisTempo = [];

    //Add RUNWAY_LENGTH_FRAMES worth of goframes to end of goframes set so that there is a smooth transition
    let goFrames_thisTempo_plus = deepCopy(goFrames_thisTempo);
    goFrames_thisTempo.forEach((goFrm) => {
      if (goFrm <= RUNWAY_LENGTH_FRAMES) {
        goFrames_thisTempo_plus.push(goFrm + tempoFretsLoopLengthInFrames_thisTempo);
      }
    });

    //for every frame in this tempo's loop, look to see if a tf is on scene
    for (let currFrameNumber = 0; currFrameNumber < tempoFretsLoopLengthInFrames_thisTempo; currFrameNumber++) {

      let zlocOfFretsOnSceneSet = [];

      goFrames_thisTempo_plus.forEach((goFrame) => { //look at each go frame to see if it is on scene
        //Look at each go frame for every frame in cycle
        //only include go frames that are on scene
        if (goFrame >= (currFrameNumber - 30) && goFrame < (RUNWAY_LENGTH_FRAMES + currFrameNumber)) { //(currFrameNumber-30)-add a few frames so tf doesn't disappear too abruptly, it falls out of view anyway

          let framesUntilGo = goFrame - currFrameNumber; //Guarantee that each goFrame will have a 0/GO_Z fret location
          let pxUntilGo = framesUntilGo * PX_PER_FRAME;
          let fretLocation = GO_Z - pxUntilGo;
          zlocOfFretsOnSceneSet.push(fretLocation);

        } // if (goFrame >= (currFrameNumber - 30) && goFrame < (RUNWAY_LENGTH_FRAMES + currFrameNumber)) { //(currFrameNumber-30)-add a few frames so tf doesn't disappear too abruptly, it falls out of view anyway
      }); // goFrames_thisTempo_plus.forEach((goFrame) => { //look at each go frame to see if it is on scene END

      tempoFretLocs_thisTempo.push(zlocOfFretsOnSceneSet);

    } //for (let currFrameNumber = 0; currFrameNumber < tempoFretsLoopLengthInFrames_thisTempo; currFrameNumber++) END

    scoreDataObject.tempoFretLocations_perTempo.push(tempoFretLocs_thisTempo);
    //###endef Tempo Fret Main Cycle

    //###ef Tempo Fret Lead In
    let tempoFretLocs_leadIn_thisTempo = [];

    // Only Need Runway Length of Go Frames
    let goFramesForLeadIn = [];
    goFrames_thisTempo.forEach((goFrm) => {
      if (goFrm <= RUNWAY_LENGTH_FRAMES) {
        goFramesForLeadIn.push(goFrm);
      }
    });

    //for every frame in this tempo's loop, look to see if a tf is on scene
    for (let currFrameNumber = 0; currFrameNumber < RUNWAY_LENGTH_FRAMES; currFrameNumber++) {

      let zlocOfLeadInFretsSet = [];

      goFramesForLeadIn.forEach((goFrame) => {

        let framesUntilGo = goFrame - currFrameNumber + RUNWAY_LENGTH_FRAMES;
        let pxUntilGo = framesUntilGo * PX_PER_FRAME;
        let fretLocation = GO_Z - pxUntilGo;
        zlocOfLeadInFretsSet.push(fretLocation);

      }); // goFramesForLeadIn.forEach((goFrame) =>{ END

      tempoFretLocs_leadIn_thisTempo.push(zlocOfLeadInFretsSet);

    } // for (let currFrameNumber = 0; currFrameNumber < RUNWAY_LENGTH_FRAMES; currFrameNumber++) END

    scoreDataObject.leadIn_tempoFretLocations_perTempo.push(tempoFretLocs_leadIn_thisTempo);
    //###endef Tempo Fret Lead In


    //##endef Calculate Tempo Fret Locations Per Frame

    //##ef Calculate Go Frets Blink


    let goFretsState_thisTempo = [];
    for (let i = 0; i < tempoFretsLoopLengthInFrames_thisTempo; i++) { //populate initially with 0
      goFretsState_thisTempo.push(0);
    }
    let goFrmBlinkDurInFrames = 14; //num of frames to hold go frame go

    goFrames_thisTempo.forEach((goFrameNumber) => {

      let lastFrame = goFrameNumber + goFrmBlinkDurInFrames;

      for (let frmIx = goFrameNumber; frmIx < lastFrame; frmIx++) {
        goFretsState_thisTempo[frmIx] = 1;
      }

    }); // goFrames_thisTempo.forEach((goFrameNumber) => END

    scoreDataObject.goFretsState_perTempo.push(goFretsState_thisTempo);


    //##endef Calculate Go Frets Blink

    //##ef Calculate BBs


    //##ef Main Cycle
    let bbYpos_thisTempo = [];
    let leadInAscent = [];

    goFrames_thisTempo.forEach((goFrm, goFrmIx) => { //goFrames_thisTempo contains the frame number of each go frame

      if (goFrmIx > 0) { //start on second goFrmIx so you can compare to previous index

        let previousGoFrame = goFrames_thisTempo[goFrmIx - 1];
        let thisBeatDurInFrames = goFrm - previousGoFrame; //because of necessary rounding beats last various amounts of frames usually with in 1 frame difference
        let ascentPct = 0.35; //looks best when descent is longer than ascent
        let descentPct = 1 - ascentPct;
        let numFramesUp = Math.floor(ascentPct * thisBeatDurInFrames);
        let numFramesDown = Math.ceil(descentPct * thisBeatDurInFrames);

        let ascentFactor = 0.2;
        let descentFactor = 2.8;

        let ascentPlot = plot(function(x) { //see Function library; exponential curve
          return Math.pow(x, ascentFactor);
        }, [0, 1, 0, 1], numFramesUp, BB_TRAVEL_DIST); //will create an object with numFramesUp length (x) .y is what you want

        ascentPlot.forEach((ascentPos) => {
          let tBbY = BBCIRC_TOP_CY + ascentPos.y; //calculate the absolute y position of bb
          bbYpos_thisTempo.push(Math.round(tBbY)); //populate bbYpos_thisTempo array with bby position for every frame

          //save first bounce for lead-in
          if (goFrmIx == 1) {
            leadInAscent.push(tBbY);
          }
        }); // ascentPlot.forEach((ascentPos) => END

        let descentPlot = plot(function(x) {
          return Math.pow(x, descentFactor);
        }, [0, 1, 0, 1], numFramesDown, BB_TRAVEL_DIST);

        descentPlot.forEach((descentPos) => {
          let tBbY = BBCIRC_BOTTOM_CY - descentPos.y;
          bbYpos_thisTempo.push(Math.round(tBbY));
        }); // descentPlot.forEach((descentPos) => END

      } // if(goFrmIx>0) END

    }); // goFrames_thisTempo.forEach((goFrm, goFrmIx) => END

    scoreDataObject.bbYpos_perTempo.push(bbYpos_thisTempo);
    //##endef Main Cycle

    //##ef Lead In
    let leadIn_bbYpos_thisTempo = [];
    //make 1 ascent just before first beat
    leadInAscent.forEach((bbYpos) => { //leadInAscent is already reversed so first index is lowest bbYpos
      leadIn_bbYpos_thisTempo.push(bbYpos);
    });
    scoreDataObject.leadIn_bbYpos_perTempo.push(leadIn_bbYpos_thisTempo);
    //##endef Lead In


    //##endef Calculate BBs

    //##ef Calculate Scrolling Cursors


    //look at every go frame, starting at 1; calc num frames since last go frame; map the distance between two beat coordinates
    let scrollingCsrCoords_thisTempo = []; //[obj:{x:,y1:,y2:}]
    let currBeatNum_InLoop = 0;
    goFrames_thisTempo.forEach((goFrameNumber, ix) => {
      if (ix > 0) { //start on ix=1 so you can compare to previous frame

        let distFrames = goFrameNumber - goFrames_thisTempo[ix - 1];
        let incInPx = BEAT_LENGTH_PX / distFrames;

        for (let i = 0; i < distFrames; i++) {
          let tCoordsObj = {}; //{x:,y1:,y2:}
          tCoordsObj['x'] = beatCoords[currBeatNum_InLoop].x + (i * incInPx); // increment x for each frame between downbeats
          tCoordsObj['y1'] = beatCoords[currBeatNum_InLoop].y + HALF_NOTEHEAD_H - NOTATION_CURSOR_H;
          tCoordsObj['y2'] = beatCoords[currBeatNum_InLoop].y + HALF_NOTEHEAD_H;
          scrollingCsrCoords_thisTempo.push(tCoordsObj);
        } // for (let i = 0; i < distFrames; i++) END

        currBeatNum_InLoop = (currBeatNum_InLoop + 1) % TOTAL_NUM_BEATS;

      } // if (ix > 0) { //start on ix=1 so you can look back END
    }); // goFrames_thisTempo.forEach((goFrameNumber, ix) => END

    scoreDataObject.scrollingCsrCoords_perTempo.push(scrollingCsrCoords_thisTempo);


    //##endef Calculate Scrolling Cursors


  }); // scoreDataObject.tempos.forEach((tempo) => { END
  //##endef CALCULATIONS PER TEMPO

  //##ef CALCULATIONS PER PLAYER
  for (let plrNum = 0; plrNum < NUM_PLAYERS; plrNum++) {


    //##ef Tempo Changes


    //##ef Calculate Which Frames to Change Tempo
    // 7 containers in a palindrome long-shorter-shorter-shorter-Mirror
    let tempoChgTimeCont = generatePalindromeTimeContainers({
      numContainersOneWay: 4,
      startCont_minMax: [90, 110],
      pctChg_minMax: [-0.25, -0.31]
    });
    // duration with tempo changes will be in this pattern: short - medium - long
    // in conjunction with time containers. so 1st tc from short array, next tc from medium array etc...
    let tempoChanges_thisPlayer = []; //{tempo:,frameNum}
    let shortTempoChgDursSec = [9, 9, 11, 13];
    let mediumTempoChgDursSec = [14, 14, 16, 18];
    let longTempoChgDursSec = [21, 23, 33, 28, 37];
    let tTempoSet = [0, 1, 2, 3, 4];

    let tTimeElapsed = 0;
    let firstLastTempoChange = choose(tTempoSet); //need first and last tempo in cycle to be the same so loop works
    tempoChanges_thisPlayer.push({
      frameNum: 0,
      tempo: firstLastTempoChange
    }); // so there is a starting tempo
    let chgDurSetNum = 0;
    let timeContainerRemainder = 0;

    tempoChgTimeCont.forEach((timeContDur) => { //each new time container

      chgDurSetNum = (chgDurSetNum + 1) % 3; //loop change duration sets
      let timeElapsed_thisTC = timeContainerRemainder; //this will be 0 or a negative number

      do { //loop through each time container; add time from the appropriate set of

        let tTimeInc = 99; //so while loop does not go on forever

        switch (chgDurSetNum) {

          case 0:
            tTimeInc = choose(shortTempoChgDursSec);
            break;

          case 1:
            tTimeInc = choose(mediumTempoChgDursSec);
            break;

          case 2:
            tTimeInc = choose(longTempoChgDursSec);
            break;

        }

        timeElapsed_thisTC += tTimeInc; //add time from the appropriate set until this time container is full
        tTimeElapsed += tTimeInc //add this increment to overall time
        let timeElapsedAsFrames = Math.round(tTimeElapsed * FRAMERATE); //convert to frames

        let tNewTempo_frmNum_obj = {};

        //decide which tempo; cycle through them all
        if (tTempoSet.length == 0) tTempoSet = [0, 1, 2, 3, 4]; //when all used up replenish
        let tTempoIx = chooseIndex(tTempoSet); //select the index number from the remaining tempo set
        let tNewTempo = tTempoSet[tTempoIx];
        tTempoSet.splice(tTempoIx, 1); //remove this tempo from set

        tNewTempo_frmNum_obj['tempo'] = tNewTempo;
        tNewTempo_frmNum_obj['frameNum'] = timeElapsedAsFrames;
        tempoChanges_thisPlayer.push(tNewTempo_frmNum_obj);

      } while (timeElapsed_thisTC <= timeContDur);

      timeContainerRemainder = timeElapsed_thisTC - timeContDur; //a negative number pass on remainder so pattern of tempo change durations remains consistant

    }); // tempoChgTimeCont.forEach((timeContDur) => { //each new time container END
    tempoChanges_thisPlayer[tempoChanges_thisPlayer.length - 1].tempo = firstLastTempoChange; //replace last tempo change in cycle with the same as first for looping consistancy
    scoreDataObject.tempoChanges_perPlayer.push(tempoChanges_thisPlayer);
    //##endef Calculate Which Frames to Change Tempo

    //##ef Tempo Change Flags


    let tempoFlagLocs_thisPlr = []; // 1 index per frame {tempo:,frameNum:}
    for (let i = 0; i < 100000; i++) tempoFlagLocs_thisPlr.push([]); // populate with -1 to replace later
    let leadIn_tempoFlagLocs_thisPlr = []; //make a set of lead in frames
    for (let i = 0; i < RUNWAY_LENGTH_FRAMES; i++) leadIn_tempoFlagLocs_thisPlr.push([]);

    let tempoChg_signPos_thisPlayer = [];

    // For each tempo change flag, calculating where it will be for each frame between end of runway and gofret
    tempoChanges_thisPlayer.forEach((tempoFrmNumObj, tempChgIx) => { //{tempo:,frameNum:}

      let tempoNum = tempoFrmNumObj.tempo;
      let goFrmNum = tempoFrmNumObj.frameNum; //this is the frame num where the sign is at the go fret

      for (let i = RUNWAY_LENGTH_FRAMES; i >= 0; i--) { //Need to add a zLocation for every frame the sign is on the runway; count backwards so the soonist frame is the furtherest back position on runway and the last frame is 0-zpos

        let tempoNum_zPos_obj = {};
        let frameNum = goFrmNum - i; //RUNWAY_LENGTH_FRAMES to 0

        if (frameNum >= 0) { //so you don't go to negative array index

          tempoNum_zPos_obj['tempoNum'] = tempoNum;
          let zLoc = Math.round(-PX_PER_FRAME * i) + GO_Z;
          tempoNum_zPos_obj['zLoc'] = zLoc;
          tempoFlagLocs_thisPlr[frameNum].push(tempoNum_zPos_obj); //replace the index in main array for this frame; there is a set of tempo flag locations for each frame cause there could be several tempo flags on scene that frame

          //pop off last frame for looping
          if (tempChgIx == (tempoChanges_thisPlayer.length - 1)) { //last tempo change with tempo num and frame num for this player
            if (i == 0) { // last frame of this cycle
              tempoFlagLocs_thisPlr.splice(frameNum); // truncate array to end of loop; was 100,000 long; frameNum instead of frameNum-1 will lob off last frame so it is clean loop, otherwise it goes to z=0 and the first frame of loop is also z=0
            }
          } //   if (tempChgIx == (tempoChanges_thisPlayer.length - 1)) END

        } // if (frameNum >= 0) END
        //
        else { //for lead-in

          tempoNum_zPos_obj['tempoNum'] = tempoNum;
          let zLoc = Math.round(-PX_PER_FRAME * i) + GO_Z;
          tempoNum_zPos_obj['zLoc'] = zLoc;
          leadIn_tempoFlagLocs_thisPlr[RUNWAY_LENGTH_FRAMES + frameNum].push(tempoNum_zPos_obj); //replace the index in lead in array for this frame; frameNum will be negative

        } //else END

      } // for (let i = RUNWAY_LENGTH_FRAMES; i >= 0; i--) END

      //MAKE ANOTHER LOOP HERE FOR DUR TO HOLD FLAG AT GO FRET
      if (tempChgIx < tempoChanges_thisPlayer.length - 1) { //because we are referencing the next frame
        let tDurFrames = tempoChanges_thisPlayer[tempChgIx + 1].frameNum - goFrmNum; //until the next tempo change flag reaches the go fret
        for (let i = 1; i < tDurFrames; i++) { //i=1 because flag is already there for 1 frame at gofret

          let tempoNum_zPos_obj = {};

          tempoNum_zPos_obj['tempoNum'] = tempoNum;
          tempoNum_zPos_obj['zLoc'] = GO_Z;
          let tFrameNum = goFrmNum + i;
          tempoFlagLocs_thisPlr[tFrameNum].push(tempoNum_zPos_obj);

        } // for (let i = 1; i < tDurFrames; i++) END
      }

    }); // tempoChanges_thisPlayer.forEach((tempoFrmNumObj) => END

    scoreDataObject.tempoFlagLocs_perPlayer.push(tempoFlagLocs_thisPlr);
    scoreDataObject.leadIn_tempoFlagLocs_perPlayer.push(leadIn_tempoFlagLocs_thisPlr);


    //##endef Tempo Change Flags

    //##ef Player Tokens


    //An Array length = to tempoFlagLocs_thisPlr, that contains the current tempo for this player for this frame
    //In Update look up that frame's scrolling cursor location for the right tempo listed here; incorporate toplevel var so player token can see all scrolling cursor locations for that frame
    let playerTokenTempoNum_thisPlr = new Array(tempoFlagLocs_thisPlr.length).fill(-1);

    tempoChanges_thisPlayer.forEach((tempoChgObj, tchgIx) => {
      if (tchgIx > 0) { //so we can use previous index

        let thisTempo = tempoChgObj.tempo;
        let thisFrameNum = tempoChgObj.frameNum;
        let lastTempo = tempoChanges_thisPlayer[tchgIx - 1].tempo;
        let lastFrameNum = tempoChanges_thisPlayer[tchgIx - 1].frameNum;
        let tNumToFill = thisFrameNum - lastFrameNum;

        for (let i = 0; i < tNumToFill; i++) {
          playerTokenTempoNum_thisPlr[lastFrameNum + i] = lastTempo;
        }

      } // if (tchgIx > 0) END
    }); // tempoChanges_thisPlayer.forEach((tempoChgObj, tchgIx) => END

    scoreDataObject.playerTokenTempoNum_perPlayer.push(playerTokenTempoNum_thisPlr);


    //##endef Player Tokens


    //##endef Tempo Changes


  } // for(let plrNum=0;plrNum<NUM_PLAYERS;plrNum++) => END
  //##endef CALCULATIONS PER PLAYER

  //##ef CALCULATIONS FOR UNISONS


  //##ef Calculate frame number and duration of unisons

  let unisonTempoChangeObjs = [];
  let unisonDurSet = [8, 8, 5, 5, 12, 15];
  let unisonTime = 0;
  // Choose a unison duration then a gap from obj below; Repeat gap ranges using numIter below
  let unison_gapRange_numIterations = [{
      gapRange: [38, 41],
      numIter: 2
    },
    {
      gapRange: [34, 36],
      numIter: 1
    },
    {
      gapRange: [60, 65],
      numIter: 3
    },
    {
      gapRange: [34, 36],
      numIter: 1
    },
    {
      gapRange: [38, 41],
      numIter: 2
    }
  ];

  let firstLastUnisonTempo; // so first and last tempo are the same for the loop

  unison_gapRange_numIterations.forEach((gapIterDict, gapIx) => {

    let numIter = gapIterDict.numIter;
    let tTempoSet = [0, 1, 2, 3, 4];

    for (let iterIx = 0; iterIx < numIter; iterIx++) {

      let tChgObj = {};

      let unisonFrame = Math.round(unisonTime * FRAMERATE); //convert to frames
      tChgObj['frame'] = unisonFrame;
      let tDur = choose(unisonDurSet);
      let tDurFrames = Math.round(tDur * FRAMERATE); //convert to frames
      tChgObj['durFrames'] = tDurFrames;
      //choose tempo
      if (tTempoSet.length == 0) tTempoSet = [0, 1, 2, 3, 4]; //when all used up replenish
      let tTempoIx = chooseIndex(tTempoSet); //select the index number from the remaining tempo set
      let tNewTempo = tTempoSet[tTempoIx];
      tTempoSet.splice(tTempoIx, 1); //remove this tempo from set
      tChgObj['tempo'] = tNewTempo;
      if (gapIx == 0 && iterIx == 0) firstLastUnisonTempo = tNewTempo;

      let timeToNextUnison = rrand(gapIterDict.gapRange[0], gapIterDict.gapRange[1]);
      unisonTime += timeToNextUnison;

      scoreDataObject.unisons.push(tChgObj);

    } // for (let iterIx = 0; iterIx < numIter; iterIx++) END

  }); //unison_gapRange_numIterations.forEach((gapIterDict) => END

  scoreDataObject.unisons[scoreDataObject.unisons.length - 1].tempo = firstLastUnisonTempo;

  //##endef Calculate frame number and duration of unisons

  //##ef Unison Flags

  //Make loop size array to store unison state for each frame in loop
  //For Each Unison Flag, find all frames that it is on scene and store in scoreDataObject.unisonFlagLocs
  let lastFrameInUnisonLoop = scoreDataObject.unisons[scoreDataObject.unisons.length - 1].frame + scoreDataObject.unisons[scoreDataObject.unisons.length - 1].durFrames;
  for (let i = 0; i < lastFrameInUnisonLoop; i++) {
    scoreDataObject.unisonFlagLocs.push([]);
  }
  for (let i = 0; i < RUNWAY_LENGTH_FRAMES; i++) scoreDataObject.leadIn_unisonFlagLocs.push([]);

  let tempoChg_signPos_thisPlayer = [];

  scoreDataObject.unisons.forEach((tempoFrmNumObj, tempChgIx) => { //{tempo:,frame:, durFrames:}

    let tempoNum = tempoFrmNumObj.tempo;
    let goFrmNum = tempoFrmNumObj.frame; //this is the frame num where the sign is at the go fret
    let tDurFrames = tempoFrmNumObj.durFrames;

    for (let i = (RUNWAY_LENGTH_FRAMES - 1); i >= 0; i--) { //Need to add a zLocation for every frame the sign is on the runway; count backwards so the soonist frame is the furtherest back position on runway and the last frame is 0-zpos

      let tempoNum_zPos_obj = {};
      let frameNum = goFrmNum - i; //

      if (frameNum >= 0) { //so you don't go to negative array index

        tempoNum_zPos_obj['tempoNum'] = tempoNum;
        let zLoc = Math.round(-PX_PER_FRAME * i);
        tempoNum_zPos_obj['zLoc'] = zLoc;
        tempoNum_zPos_obj['end'] = false;
        scoreDataObject.unisonFlagLocs[frameNum].push(tempoNum_zPos_obj); //replace the index in main array for this frame

      } // if (frameNum >= 0) END
      //
      else { //for lead-in  if frameNum < 0

        tempoNum_zPos_obj['tempoNum'] = tempoNum;
        let zLoc = Math.round(-PX_PER_FRAME * i);
        tempoNum_zPos_obj['zLoc'] = zLoc;
        tempoNum_zPos_obj['end'] = false;
        scoreDataObject.leadIn_unisonFlagLocs[RUNWAY_LENGTH_FRAMES + frameNum].push(tempoNum_zPos_obj); //replace the index in main array for this frame

      } //else END

    } // for (let i = RUNWAY_LENGTH_FRAMES; i >= 0; i--) END

    //MAKE ANOTHER LOOP HERE FOR DUR TO HOLD FLAG AT GO FRET
    for (let i = 1; i < tDurFrames; i++) {

      let tempoNum_zPos_obj = {};

      tempoNum_zPos_obj['tempoNum'] = tempoNum;
      tempoNum_zPos_obj['zLoc'] = 0;
      tempoNum_zPos_obj['end'] = false;
      let tFrameNum = goFrmNum + i;
      scoreDataObject.unisonFlagLocs[tFrameNum].push(tempoNum_zPos_obj);

    } // for (let i = 1; i < tDurFrames; i++) END

  }); // scoreData.unisons.forEach((tempoFrmNumObj, tempChgIx) => END


  // FOR SET OF UNISON OFF FLAGS
  scoreDataObject.unisons.forEach((tempoFrmNumObj, tempChgIx) => { //{tempo:,frame:, durFrames:}

    if (tempChgIx < scoreDataObject.unisons.length - 1) {

      let tempoNum = tempoFrmNumObj.tempo;
      let goFrmNum = tempoFrmNumObj.frame + tempoFrmNumObj.durFrames; //this is the frame num where the sign is at the go fret
      let tDurFrames = tempoFrmNumObj.durFrames;

      for (let i = (RUNWAY_LENGTH_FRAMES - 1); i >= 0; i--) { //Need to add a zLocation for every frame the sign is on the runway; count backwards so the soonist frame is the furtherest back position on runway and the last frame is 0-zpos

        let tempoNum_zPos_obj = {};
        let frameNum = goFrmNum - i; //

        if (frameNum >= 0) { //so you don't go to negative array index

          tempoNum_zPos_obj['tempoNum'] = tempoNum;
          let zLoc = Math.round(-PX_PER_FRAME * i);
          tempoNum_zPos_obj['zLoc'] = zLoc;
          tempoNum_zPos_obj['end'] = true;
          scoreDataObject.unisonFlagLocs[frameNum].push(tempoNum_zPos_obj); //replace the index in main array for this frame

        } // if (frameNum >= 0) END
        //
        else { //for lead-in

          tempoNum_zPos_obj['tempoNum'] = tempoNum;
          let zLoc = Math.round(-PX_PER_FRAME * i);
          tempoNum_zPos_obj['zLoc'] = zLoc;
          tempoNum_zPos_obj['end'] = true;
          scoreDataObject.leadIn_unisonFlagLocs[RUNWAY_LENGTH_FRAMES + frameNum].push(tempoNum_zPos_obj); //replace the index in main array for this frame

        } //else END

      } // for (let i = RUNWAY_LENGTH_FRAMES; i >= 0; i--) END
    }

  }); // scoreData.unisons.forEach((tempoFrmNumObj, tempChgIx) => END

  //##endef Unison Flags

  //##ef Unison Player Tokens

  scoreDataObject.unisonPlayerTokenTempoNum = new Array(scoreDataObject.unisonFlagLocs.length).fill(-1);

  scoreDataObject.unisons.forEach((tempoChgObj, tchgIx) => {

    let thisTempo = tempoChgObj.tempo;
    let thisFrameNum = tempoChgObj.frame;
    let tNumToFill = tempoChgObj.durFrames;

    for (let i = 0; i < tNumToFill; i++) {
      scoreDataObject.unisonPlayerTokenTempoNum[thisFrameNum + i] = thisTempo;
    }

  }); // tempoChangesByFrameNum_thisPlr.forEach((tempoChgObj, tchgIx) => END


  //##endef Unison Player Tokens


  //##endef CALCULATIONS FOR UNISONS

  //##ef CALCULATIONS FOR NOTATION


  //Time Containers & amount of rests
  // 11 containers in a palindrome short-longer-longer ... longest-mirror
  let restsTimeContainers = generatePalindromeTimeContainers({
    numContainersOneWay: 6,
    startCont_minMax: [5, 7],
    pctChg_minMax: [0.27, 0.36]
  });
  //find out total time
  let restsLoopTotalTime = 0;
  restsTimeContainers.forEach((tTime) => {
    restsLoopTotalTime += tTime;
  });
  // Overall loop length will be x times restsLoopTotalTime
  let numRestsLoop = 7;
  let maxNumRests = 13;
  let restsByFrameSetLength = restsTimeContainers.length * numRestsLoop;
  for (let i = 0; i < 100000; i++) {
    if ((restsByFrameSetLength % maxNumRests) == 0) {
      break;
    } else {
      restsByFrameSetLength++;
    }
  }

  // Figure out which frames will add/subtract rest
  let restsByFrame = [];
  let tCumFrmCt_rests = 0;
  let addMinusRestsCt = 0;
  let restType = 0;
  let restSetInc = 0;
  for (let i = 0; i < restsByFrameSetLength; i++) {
    let tOb = {};
    let sec = restsTimeContainers[restSetInc];
    let incInFrms = Math.round(sec * FRAMERATE);
    tCumFrmCt_rests += incInFrms;
    tOb['frame'] = tCumFrmCt_rests;
    if (addMinusRestsCt == 0) restType = (restType + 1) % 2
    tOb['restType'] = restType;
    restSetInc = (restSetInc + 1) % restsTimeContainers.length;
    addMinusRestsCt = (addMinusRestsCt + 1) % maxNumRests;
    restsByFrame.push(tOb);
  }
  let motiveSetByFrame_length = restsByFrame[restsByFrame.length - 1].frame + 1; //plus 1 because restsByFrame.frame will be index num and length needs to be one more as ix starts at 0

  //For motives, do a choose for dur between changes
  //Make a set as long as restsTimeContainers
  //cycle through all the motives - Make function
  let motiveNumberSet = numberedSetFromSize({
    sz: (motiveDictionary.length - 1)
  });
  let orderedMotiveNumSet = chooseAndCycle({
    loopSet: motiveNumberSet,
    num: 5000
  });
  let dursBtwnMotiveChgSet = [5, 7, 3, 6, 11, 13, 8, 9, 17];
  //Make big set of motive change objects: {motiveNum:, time:}
  let motiveChangeTimesObjSet = [];
  let cumMotiveChgTime = 0;

  for (let i = 0; i < 100000; i++) {

    let tObj = {};
    cumMotiveChgTime += choose(dursBtwnMotiveChgSet);
    let chgFrmNum = Math.round(cumMotiveChgTime * FRAMERATE);
    tObj['motiveNum'] = orderedMotiveNumSet[i];
    tObj['frame'] = chgFrmNum;
    motiveChangeTimesObjSet.push(tObj);

    if (cumMotiveChgTime > (restsLoopTotalTime * numRestsLoop)) break;

  } // for (let i = 0; i < 100000; i++) END

  //Make a frame by frame set with all the rests and motive changes state of all 16 beats each frame
  // take the time of last entry of motiveChangeTimesObjSet as the length of final looping set - convert to frames

  //fill all frames with all quarters then replace
  let motiveChgByFrameSet = [];
  for (let i = 0; i < motiveSetByFrame_length; i++) {
    motiveChgByFrameSet.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  let motiveChgByFrameSet_currSet = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


  for (var restIx = 1; restIx < restsByFrame.length; restIx++) {

    let restObj = restsByFrame[restIx - 1];
    let restFrame = restObj.frame;
    let restType = restObj.restType;
    let next_restObj = restsByFrame[restIx];
    let next_restFrame = next_restObj.frame;
    let next_restType = next_restObj.restType;

    if (restType == 1) { //add rest

      let tNotesSet = deepCopy(motiveChgByFrameSet_currSet);

      for (var i = 0; i < 1000; i++) { // this is to avoid infinite while loop

        let tChoice = chooseIndex(tNotesSet); //randomly choose a notation item so that the rests do not appear in order

        if (tNotesSet[tChoice] != -1) {

          tNotesSet[tChoice] = -1; //add a rest

          //copy new array over range
          for (let frmIx = restFrame; frmIx < next_restFrame; frmIx++) {

            motiveChangeTimesObjSet.forEach((mObj) => {
              let tchgFrmNum = mObj.frame;
              let tmNum = mObj.motiveNum;
              if (tchgFrmNum == frmIx) {

                for (let j = 0; j < 100; j++) {
                  let tix = chooseIndex(tNotesSet);
                  if (tNotesSet[tix] != -1) {
                    tNotesSet[tix] = tmNum;
                    break;
                  }
                }

              }

            });

            //Work in motiveChangeTimesObjSet
            let tSet = deepCopy(tNotesSet);
            motiveChgByFrameSet[frmIx] = tSet;
          }

          // Update curr set
          motiveChgByFrameSet_currSet = deepCopy(tNotesSet);

          break;

        } //   if (tNotesSet[noteIx] != -1) END

      } //   for (var i = 0; i < 1000; i++) END

    } // if (restType == 1) { END

    if (restType == 0) { //take away rest

      let tNotesSet = deepCopy(motiveChgByFrameSet_currSet);

      for (var i = 0; i < 1000; i++) { // this is to avoid infinite while loop

        let tChoice = chooseIndex(tNotesSet); //randomly choose a notation item so that the rests do not appear in order

        if (tNotesSet[tChoice] == -1) {

          tNotesSet[tChoice] = 0; //use motiveChangeTimesObjSet here

          //copy new array over range
          for (let frmIx = restFrame; frmIx < next_restFrame; frmIx++) {

            motiveChangeTimesObjSet.forEach((mObj) => {
              let tchgFrmNum = mObj.frame;
              let tmNum = mObj.motiveNum;
              if (tchgFrmNum == frmIx) {

                for (let j = 0; j < 100; j++) {
                  let tix = chooseIndex(tNotesSet);
                  if (tNotesSet[tix] != -1) {
                    tNotesSet[tix] = tmNum;
                    break;
                  }
                }


              }

            });

            let tSet = deepCopy(tNotesSet);
            motiveChgByFrameSet[frmIx] = tSet;
          }

          // Update curr set
          motiveChgByFrameSet_currSet = deepCopy(tNotesSet);

          break;

        } //   if (tNotesSet[noteIx] != -1) END

      } //   for (var i = 0; i < 1000; i++) END

    } // if (restType == 1) { END

  } // for (var restIx = 1; restIx < restsByFrame.length; restIx++) END

  scoreDataObject.motiveSet = motiveChgByFrameSet;


  //##endef CALCULATIONS FOR NOTATION

  // console.log(scoreDataObject);
  return scoreDataObject;

} // function generateScoreData() END


//#endef GENERATE SCORE DATA

//#ef SCORE DATA MANAGER


function makeScoreDataManager() {

  // #ef Score Data Manager Panel

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

  // #endef END Score Data Manager Panel

  // #ef Generate New Score Data Button

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

    } // action: function() END
  }); // let generateNewScoreDataButton = mkButton( END

  // #endef END Generate New Score Data Button

  // #ef Save Score Data Button

  let saveScoreDataButton = mkButton({
    canvas: scoreDataManagerPanel.content,
    w: scoreDataManagerW - 44,
    h: 44,
    top: scoreDataManagerH - 70,
    left: 15,
    label: 'Save Current Score Data',
    fontSize: 16,
    action: function() {
      console.log(scoreData);
      let scoreDataString = JSON.stringify(scoreData);
      let scoreDataFileName = generateFileNameWdate('sf004');
      downloadStrToHD(scoreDataString, scoreDataFileName, 'text/plain');
    }
  });

  // #endef END Save Score Data Button

  // #ef Load Score Data From File Button

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

  // #endef END Load Score Data Button

  //#ef Load Score Data from Server Button

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
        pieceId: PIECE_ID
      });
    }
  });

  // Step 2: Server responds with list of file names
  SOCKET.on('sf004_loadPieceFromServerBroadcast', function(data) {

    let requestingId = data.pieceId;

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

  //#endef END Load Score Data from Server Button

  scoreDataManagerPanel.smallify();

} // function makeScoreDataManager() END


//#endef END SCORE DATA MANAGER

//#ef BUILD WORLD


//##ef Make World Panel

function makeWorldPanel() {

  worldPanel = mkPanel({
    w: CANVAS_W,
    h: CANVAS_H,
    title: 'SoundFlow #4',
    onwindowresize: true,
    clr: clr_blueGrey
  });

} // function makeWorldPanel() END

//##endef Make World Panel

//##ef Make ThreeJS Scene


function makeThreeJsScene() {

  SCENE = new THREE.Scene();

  //###ef Camera
  CAMERA = new THREE.PerspectiveCamera(75, RENDERER_W / RENDERER_H, 1, 3000);
  CAMERA.position.set(0, CAM_Y, CAM_Z);
  CAMERA.rotation.x = rads(CAM_ROTATION_X);
  //###endef END Camera

  //###ef Lights
  SUN = new THREE.DirectionalLight(0xFFFFFF, 1.2);
  SUN.position.set(100, 600, 175);
  SCENE.add(SUN);
  SUN2 = new THREE.DirectionalLight(0x40A040, 0.6);
  SUN2.position.set(-100, 350, 200);
  SCENE.add(SUN2);
  //###endef END Lights

  //###ef Renderer
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
  //###endef Renderer

} // function makeThreeJsScene() end


//##endef Make ThreeJS Scene

//##ef Make Runway


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


//##endef Make Runway

//##ef Make Tracks


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

  }); // xPosOfTracks.forEach((trXpos) => END

} // makeTracks() END


//##endef Make Tracks

//##ef Make Go Frets


function makeGoFrets() {

  //Make set of go frets: goFrets[]; Make set of GO indicators: goFretsGo[]
  let goFretGeometry = new THREE.BoxBufferGeometry(GO_FRET_W, GO_FRET_H, GO_FRET_L);
  let goFretGoGeometry = new THREE.BoxBufferGeometry(GO_FRET_W + 2, GO_FRET_H + 2, GO_FRET_L + 2);

  xPosOfTracks.forEach((trXpos, trIx) => {

    newGoFret = new THREE.Mesh(goFretGeometry, materialColors[trIx]);

    newGoFret.position.z = GO_Z;
    newGoFret.position.y = GO_FRET_Y;
    newGoFret.position.x = trXpos;
    newGoFret.rotation.x = rads(-14);

    SCENE.add(newGoFret);
    goFrets.push(newGoFret);

    newGoFretGo = new THREE.Mesh(goFretGoGeometry, matl_yellow);

    newGoFretGo.position.z = GO_Z;
    newGoFretGo.position.y = GO_FRET_Y;
    newGoFretGo.position.x = trXpos;
    newGoFretGo.rotation.x = rads(-14);
    newGoFretGo.visible = false;

    SCENE.add(newGoFretGo);
    goFretsGo.push(newGoFretGo);

  }); //xPosOfTracks.forEach((trXpos) END

} //makeGoFrets() end


//##endef Make Go Frets

//##ef Make Tempo Frets


function makeTempoFrets() {

  let tempoFretGeometry = new THREE.BoxBufferGeometry(TEMPO_FRET_W, TEMPO_FRET_H, TEMPO_FRET_L);

  xPosOfTracks.forEach((trXpos, trIx) => {

    let thisTracksTempoFrets = [];

    for (let tFretIx = 0; tFretIx < NUM_TEMPO_FRETS_TO_FILL; tFretIx++) {

      newTempoFret = new THREE.Mesh(tempoFretGeometry, materialColors[trIx]);

      newTempoFret.position.z = GO_Z - TEMPO_FRET_L - (TEMPO_FRET_L * tFretIx);
      newTempoFret.position.y = TEMPO_FRET_Y;
      newTempoFret.position.x = trXpos;
      newTempoFret.rotation.x = rads(-14);

      SCENE.add(newTempoFret);
      newTempoFret.visible = false;
      thisTracksTempoFrets.push(newTempoFret);

    } //for (let i = 0; i < NUM_TEMPO_FRETS_TO_FILL; i++) End

    tempoFretsPerTrack.push(thisTracksTempoFrets);

  }); //xPosOfTracks.forEach((trXpos) END

} //makeTempoFrets() end


//##endef Make Tempo Frets

//##ef Make BBs


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
      strokeW: BB_BOUNCE_WEIGHT + 2
    });
    bbSet[bbIx].bbBouncePadOn.setAttributeNS(null, 'display', 'none');

    bbSet[bbIx]['offIndicator'] = mkSvgRect({
      svgContainer: bbSet[bbIx].svgCont,
      x: 0,
      y: 0,
      w: BB_W,
      h: BB_H,
      fill: 'rgba(173, 173, 183, 0.9)',
    });
    bbSet[bbIx].offIndicator.setAttributeNS(null, 'display', 'none');

  } //for (let bbIx = 0; bbIx < NUM_TRACKS; bbIx++) END

} //makeBouncingBalls() end


//##endef Make BBs

//##ef Make Staff Notation


function makeStaffNotation() {

  //##ef DIV & SVG Containers
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
  //##endef DIV & SVG Containers

  //##ef Staff Lines
  let rhythmicNotationStaffLines = [];
  for (let staffIx = 0; staffIx < NUM_STAFFLINES; staffIx++) {
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
  //##endef Staff Lines

  //##ef Draw Initial Notation
  // Make all motives and make display:none; Display All Quarters
  //make an SVG for each motive at each beat
  beatCoords.forEach((beatCoordsObj, beatIx) => { //each beat loop

    let tx = beatCoordsObj.x;
    let ty = beatCoordsObj.y;

    // motiveDictionary = [{ // {path:, lbl:, num:, w:, h:}//used to be notationSvgPaths_labels
    motiveDictionary.forEach((motiveObj) => { //each motive loop

      let tLabel = motiveObj.lbl;
      let motiveNum = motiveObj.num;
      let tDisp = tLabel == 'quarter' ? 'yes' : 'none'; //initial notation displayed

      // Create HTML SVG image
      let tSvgImage = document.createElementNS(SVG_NS, "image");
      tSvgImage.setAttributeNS(XLINK_NS, 'xlink:href', '/pieces/sf004/notationSVGs/' + tLabel + '.svg');
      tSvgImage.setAttributeNS(null, "y", ty - motiveObj.h);
      tSvgImage.setAttributeNS(null, "x", tx);
      tSvgImage.setAttributeNS(null, "visibility", 'visible');
      tSvgImage.setAttributeNS(null, "display", tDisp);
      rhythmicNotationObj.svgCont.appendChild(tSvgImage);

      motivesByBeat[beatIx][motiveNum] = tSvgImage;

    }); //notationSvgPaths_labels.forEach((motiveObj)  END

  }); //beatCoords.forEach((beatCoordsObj) END
  //##endef END Draw Initial Notation

} // makeStaffNotation() END


//##endef Make Staff Notation

//##ef Make Scrolling Tempo Cursors


function makeScrollingTempoCursors() {

  for (let tempoCsrIx = 0; tempoCsrIx < NUM_TEMPOS; tempoCsrIx++) {

    let tLine = mkSvgLine({
      svgContainer: rhythmicNotationObj.svgCont,
      x1: 0,
      y1: HALF_NOTEHEAD_H - NOTATION_CURSOR_H,
      x2: 0,
      y2: HALF_NOTEHEAD_H,
      stroke: TEMPO_COLORS[tempoCsrIx],
      strokeW: 3
    });
    tLine.setAttributeNS(null, 'stroke-linecap', 'round');
    tLine.setAttributeNS(null, 'display', 'none');
    // tLine.setAttributeNS(null, 'transform', "translate(" + beatCoords[9].x.toString() + "," + beatCoords[9].y.toString() + ")");
    tempoCursors.push(tLine);

  } //for (let tempoCsrIx = 0; tempoCsrIx < NUM_TEMPOS; tempoCsrIx++) END

} // function makeScrollingTempoCursors() END


//##endef Make Scrolling Tempo Cursors

//##ef Make Player Tokens


//Make number-of-players worth of tokens for each tempo
function makePlayerTokens() {

  //circle, triangle, diamond, watermellon, square,
  for (let tempoIx = 0; tempoIx < NUM_TEMPOS; tempoIx++) {

    let tPlrSet = [];

    for (let playerIx = 0; playerIx < NUM_PLAYERS; playerIx++) {

      let thisPlrTokenObj = mkPlrTkns(rhythmicNotationObj.svgCont, playerIx);

      tPlrSet.push(thisPlrTokenObj);

    } //for (let playerIx = 0; playerIx < NUM_PLAYERS; playerIx++) END

    playerTokens.push(tPlrSet);

  } //for (let tempoIx = 0; tempoIx < NUM_TEMPOS; tempoIx++) END

} //function makePlayerTokens() end


//##endef Make Player Tokens

//##ef Make Signs


function makeSigns() { //Make a collection of possible signs to use each frame; different color each track; a collection for each player

  let signGeometry = new THREE.PlaneBufferGeometry(SIGN_W, SIGN_H, 32);

  for (let plrIx = 0; plrIx < NUM_PLAYERS; plrIx++) {
    let thisPlrsSigns = [];
    xPosOfTracks.forEach((trXpos, trIx) => {

      let thisTracksSigns = [];

      for (let tSignIx = 0; tSignIx < NUM_AVAILABLE_SIGN_MESHES_PER_TRACK; tSignIx++) {

        let signMaterial =
          new THREE.MeshLambertMaterial({
            color: TEMPO_COLORS[trIx],
            side: THREE.DoubleSide,
            opacity: 0.7,
            transparent: true,
          });

        let sign = new THREE.Mesh(signGeometry, signMaterial);

        sign.position.z = GO_Z;
        sign.position.x = trXpos;
        sign.position.y = 0;
        sign.rotation.x = rads(CAM_ROTATION_X);

        SCENE.add(sign);
        sign.visible = false;
        thisTracksSigns.push(sign);

      } //for (let tSignIx = 0; tSignIx < NUM_TEMPO_FRETS_TO_FILL; tSignIx++) end

      thisPlrsSigns.push(thisTracksSigns);

    }); // xPosOfTracks.forEach((trXpos, trIx) end

    signsByPlrByTrack.push(thisPlrsSigns);

  } // for(let plrIx=0;plrIx<NUM_PLAYERS;plrIx++) END

} //makeSigns() end


//##endef Make Signs

//##ef Make Unison Signs


function makeUnisonSigns() { //Make a collection of possible signs to use each frame; different color each track; a collection for each player

  let signGeometry = new THREE.PlaneBufferGeometry(SIGN_W, SIGN_H, 32);

  xPosOfTracks.forEach((trXpos, trIx) => {

    let thisTracksSigns = [];
    let thisTracksOffSigns = [];

    for (let tSignIx = 0; tSignIx < NUM_AVAILABLE_SIGN_MESHES_PER_TRACK; tSignIx++) {

      let signMaterial =
        new THREE.MeshLambertMaterial({
          color: clr_yellow,
          side: THREE.DoubleSide,
          opacity: 0.7,
          transparent: true,
        });

      let sign = new THREE.Mesh(signGeometry, signMaterial);

      sign.position.z = GO_Z;
      sign.position.x = trXpos;
      sign.position.y = 0;
      sign.rotation.x = rads(CAM_ROTATION_X);

      SCENE.add(sign);
      sign.visible = false;
      thisTracksSigns.push(sign);

    } //for (let tSignIx = 0; tSignIx < NUM_TEMPO_FRETS_TO_FILL; tSignIx++) end

    unisonSignsByTrack.push(thisTracksSigns);

    // UNISON OFF SIGNS
    for (let tSignIx = 0; tSignIx < NUM_AVAILABLE_SIGN_MESHES_PER_TRACK; tSignIx++) {

      let signMaterial =
        new THREE.MeshLambertMaterial({
          color: "black",
          side: THREE.DoubleSide,
          opacity: 0.7,
          transparent: true,
        });

      let sign = new THREE.Mesh(signGeometry, signMaterial);

      sign.position.z = GO_Z;
      sign.position.x = trXpos;
      sign.position.y = 0;
      sign.rotation.x = rads(CAM_ROTATION_X);

      SCENE.add(sign);
      sign.visible = false;
      thisTracksOffSigns.push(sign);

    } //for (let tSignIx = 0; tSignIx < NUM_TEMPO_FRETS_TO_FILL; tSignIx++) end

    unisonOffSignsByTrack.push(thisTracksOffSigns);

  }); // xPosOfTracks.forEach((trXpos, trIx) end

} //makeUnisonSigns() end


//##endef Make Unison Signs

//##ef Make Unison Tokens


function makeUnisonToken() {
  unisonToken = mkPlrTkns(rhythmicNotationObj.svgCont, 5);
}


//##endef Make Unison Tokens

//##ef Make Pitch Sets


function makePitchSets() {

  //###ef DIV & SVG Containers
  pitchSetsObj['div'] = mkDiv({
    canvas: worldPanel.content,
    w: PITCH_SETS_W,
    h: PITCH_SETS_H,
    top: PITCH_SETS_TOP,
    left: PITCH_SETS_LEFT,
    bgClr: 'white'
  });
  pitchSetsObj['svgCont'] = mkSVGcontainer({
    canvas: pitchSetsObj.div,
    w: PITCH_SETS_W,
    h: PITCH_SETS_H,
    x: 0,
    y: 0
  });
  //###endef DIV & SVG Containers

  //###ef Make Pitch Set SVGs
  pitchSetsDictionary.forEach((psObj) => { //each motive loop // pitchSetsDictionary = [{ // {path:,lbl:,num:,w:,h:}

    let tLbl = psObj.lbl;
    let tPsNum = psObj.num;
    let tx = PITCH_SETS_CENTER_W - (psObj.w / 2);
    let ty = PITCH_SETS_MIDDLE_H - (psObj.h / 2);

    let tDisplay = tLbl == 'e4_e5' ? 'yes' : 'none';
    // let tDisplay = tLbl == 'e4cluster_e5cluster_b4cluster' ? 'yes' : 'none';

    // Create HTML SVG image
    let tSvgImage = document.createElementNS(SVG_NS, "image");
    tSvgImage.setAttributeNS(XLINK_NS, 'xlink:href', psObj.path);
    tSvgImage.setAttributeNS(null, "x", tx);
    tSvgImage.setAttributeNS(null, "y", ty);
    tSvgImage.setAttributeNS(null, "visibility", 'visible');
    tSvgImage.setAttributeNS(null, "display", tDisplay);
    pitchSetsObj.svgCont.appendChild(tSvgImage);

    pitchSetsObj.svgs[tPsNum] = tSvgImage;

  }); // pitchSetsDictionary.forEach((psObj) =>  END
  //###endef END Make Pitch Set SVGs

  //###ef Pitch Set Change Indicator
  pitchSetsObj['chgIndicator'] = mkSvgRect({
    svgContainer: pitchSetsObj.svgCont,
    x: 0,
    y: 0,
    w: PITCH_SETS_W,
    h: PITCH_SETS_H,
    fill: 'none',
    stroke: clr_neonMagenta,
    strokeW: 8
  });

  pitchSetsObj['chgIndicator'].setAttributeNS(null, 'display', 'none');
  //###endef END Pitch Set Change Indicator

} // function makePitchSets() END


//##endef Make Pitch Sets

//##ef Make Articulations


//###ef function positionMarcato
function positionMarcato(beatNum, subdivision, partial) {

  let tCoords = {};

  switch (subdivision) {

    case 3:
      tCoords['x'] = beatCoords[beatNum].x + 1 + (((BEAT_L_PX) / 3) * (partial - 1));
      break;

    case 4:
      tCoords['x'] = beatCoords[beatNum].x + 1 + (((BEAT_L_PX - 3) / 4) * (partial - 1));
      break;

    case 5:
      tCoords['x'] = beatCoords[beatNum].x + 1 + (((BEAT_L_PX - 3) / 5) * (partial - 1));
      break;

  } // end switch

  return tCoords;

} // function positionMarcato(beatNum, subdivision, partial) end
//###endef END function positionMarcato

function makeArticulations() {

  for (let key in articulationsObj) {

    let artObj = articulationsObj[key];

    let tPath = artObj.path;
    let tLbl = key;
    let tAmt = artObj.amt;
    let tArtSet = [];

    for (let artIx = 0; artIx < tAmt; artIx++) { // create tAmt number of the same SVG

      let tArt = document.createElementNS(SVG_NS, "image");
      tArt.setAttributeNS(XLINK_NS, 'xlink:href', tPath);
      tArt.setAttributeNS(null, "x", 0);
      tArt.setAttributeNS(null, "y",  2);
      tArt.setAttributeNS(null, "visibility", 'visible');
      tArt.setAttributeNS(null, "display", 'none');
      rhythmicNotationObj.svgCont.appendChild(tArt);

      tArtSet.push(tArt);

    } // for (let artIx = 0; artIx < tAmt; artIx++) END

    articulationsObj[key]['imgSet'] = tArtSet;

  } // for (let key in articulationsObj) END

} // makeArticulations() END


//##endef Make Articulations


//#endef BUILD WORLD









//
