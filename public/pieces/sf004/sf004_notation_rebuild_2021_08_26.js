//#ef GLOBAL VARIABLES


let scoreData;
let NUM_TEMPOS = 5;
let TOTAL_NUM_BEATS = 16
const TEMPO_COLORS = [clr_brightOrange, clr_brightGreen, clr_brightBlue, clr_lavander, clr_darkRed2];


//##ef Timing
const FRAMERATE = 60;
const PX_PER_SEC = 100;
const PX_PER_FRAME = PX_PER_SEC / FRAMERATE;
//##endef Timing

// #ef World Panel Variables
let worldPanel;
const CANVAS_L_R_MARGINS = 35;
const CANVAS_MARGIN = 7;
const CANVAS_W = 692 + (CANVAS_L_R_MARGINS * 2) + (CANVAS_MARGIN * 2);
const CANVAS_H = 578;
const CANVAS_CENTER = CANVAS_W / 2;
// #endef END World Panel Variables

// #ef ThreeJS Scene Variables
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
// #endef END ThreeJS Scene Variables

//##ef Runway Variables
const RUNWAY_W = RENDERER_W;
const RUNWAY_H = RENDERER_H;
const RUNWAY_LENGTH = 1000;
const HALF_RUNWAY_W = RUNWAY_W / 2;
const HALF_RUNWAY_LENGTH = RUNWAY_LENGTH / 2;
const RUNWAY_LENGTH_FRAMES = Math.round(RUNWAY_LENGTH / PX_PER_FRAME);
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


//#endef GLOBAL VARIABLES

//#ef INIT


function init() {

  scoreData = generateScoreData();
  console.log(scoreData);

} // function init() END


//#endef INIT

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


  scoreDataObject.tempos.forEach((tempo) => { // CALCULATE FOR EACH TEMPO


    //##ef Calculate Loop Length & Go Frames


    // make about an hours worth of beats divisible by 16(TOTAL_NUM_BEATS) for scrolling cursor coordination
    let framesPerBeat = FRAMERATE / (tempo / 60);
    let beatsPerHour = (tempo * 60);
    let beatsPerCycle = Math.floor(beatsPerHour / TOTAL_NUM_BEATS);
    while ((beatsPerCycle % TOTAL_NUM_BEATS) != 0) { //keep adding beats until the cycle is divisible by TOTAL_NUM_BEATS
      beatsPerCycle++;
      if (beatsPerCycle > 9999) break;
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
    let leadInDescent = [];

    goFrames_thisTempo.forEach((goFrm, goFrmIx) => { //goFrames_thisTempo contains the frame number of each go frame

      if (goFrmIx > 0) { //start on second so you can use previous index

        let previousGoFrame = goFrames_thisTempo[goFrmIx - 1];
        let thisBeatDurInFrames = goFrm - previousGoFrame; //because of necessary rounding beats last various amounts of frames usually with in 1 frame difference
        let ascentPct = 0.35; //looks best when descent is longer than ascent
        let descentPct = 1 - ascentPct;
        let numFramesUp = Math.floor(ascentPct * thisBeatDurInFrames);
        let numFramesDown = Math.ceil(descentPct * thisBeatDurInFrames);

        let ascentFactor = 0.2;
        let descentFactor = 2.8;

        let ascentPlot = plot(function(x) {
          return Math.pow(x, ascentFactor);
        }, [0, 1, 0, 1], numFramesUp, BB_TRAVEL_DIST); //will create an object with numFramesUp length (x) .y is what you want

        ascentPlot.forEach((ascentPos) => {
          let tBbY = BBCIRC_TOP_CY + ascentPos.y; //calculate the absolute y position of bb
          bbYpos_thisTempo.push(Math.round(tBbY)); //populate bbYpos_thisTempo array with bby position for every frame

          //save first bounce for lead-in
          if (goFrmIx == 1) {
            leadInDescent.push(tBbY);
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
    leadInDescent.forEach((bbYpos) => { //leadInDescent is already reversed so first index is lowest bbYpos
      leadIn_bbYpos_thisTempo.push(bbYpos);
    });
    scoreDataObject.leadIn_bbYpos_perTempo.push(leadIn_bbYpos_thisTempo);
    //##endef Lead In


    //##endef Calculate BBs

    //##ef Calculate Scrolling Cursors


    let scrollingCsrCoords_thisTempo = []; //[obj:{x:,y1:,y2:}]
    let currBeatNum_InLoop = 0;
    let incWithinBeat_eachFrame = 0; //how much to add to x between goframes/beats

    thisTemposGoFrames.forEach((goFrmState, frmIx) => { //use go frames array so that all tempo elements are coordinated by go frame

      let tCoordsObj = {}; //{x:,y1:,y2:}
      let notationPxPerFrame_thisTempo = BEAT_L_PX / framesPerBeat; //how many pixels to advance per frame for this tempo

      if (goFrmState == 1) { //what happens on goframes; go frames will coordinate all so cursors will be on beat each goframe

        if (frmIx > 0) currBeatNum_InLoop = (currBeatNum_InLoop + 1) % TOTAL_NUM_BEATS; //increment beat in notation loop; don't increment first beat

        // store coordinates for this beat
        tCoordsObj['x'] = beatCoords[currBeatNum_InLoop].x; //look up x coordinate for this beat
        tCoordsObj['y1'] = beatCoords[currBeatNum_InLoop].y + HALF_NOTEHEAD_H - NOTATION_CURSOR_H;
        tCoordsObj['y2'] = beatCoords[currBeatNum_InLoop].y + HALF_NOTEHEAD_H;

        incWithinBeat_eachFrame = 0; //reset the x incrementer between beats

      } // if (goFrmState == 1) END
      //
      else { // What happens between go frames

        incWithinBeat_eachFrame += notationPxPerFrame_thisTempo; //increment cursor 1 frame worth of beat
        tCoordsObj['x'] = beatCoords[currBeatNum_InLoop].x + incWithinBeat_eachFrame;
        tCoordsObj['y1'] = beatCoords[currBeatNum_InLoop].y + HALF_NOTEHEAD_H - NOTATION_CURSOR_H;
        tCoordsObj['y2'] = beatCoords[currBeatNum_InLoop].y + HALF_NOTEHEAD_H;

      } // else { // What happens between go frames END

      scrollingCsrCoords_thisTempo.push(tCoordsObj);

    }); // thisTemposGoFrames.forEach((goFrmState, frmIx) => END

    scrollingCsrCoords_perTempo.push(scrollingCsrCoords_thisTempo);


    //##endef Calculate Scrolling Cursors


  }); // scoreDataObject.tempos.forEach((tempo) => { // CALCULATE FOR EACH TEMPO END


  return scoreDataObject;
} // function generateScoreData() END


//#endef GENERATE SCORE DATA
