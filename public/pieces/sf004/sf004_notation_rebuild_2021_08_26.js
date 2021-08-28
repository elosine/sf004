//#ef GLOBAL VARIABLES


let scoreData;
let NUM_TEMPOS = 5;
let NUM_PLAYERS = 5;
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

// #ef rhythmicNotation Variables

let rhythmicNotationObj = {};
let notationImageObjectSet = {};

const BEAT_LENGTH_PX = 85;
const TOP_STAFF_LINE_Y = 113;
const VERT_DIST_BTWN_STAVES = 133;
const VERT_DIST_BTWN_STAFF_LINES = 8;
const FIRST_BEAT_L = 12;
const LAST_BEAT_W = BEAT_LENGTH_PX - FIRST_BEAT_L;
const NUM_BEATS_PER_STAFFLINE = 8;
const LAST_BEAT_NUM_IN_LINE = NUM_BEATS_PER_STAFFLINE - 1;
const STAFF_BTM_MARGIN = 40;
const NUM_STAFFLINES = 2;
const NOTEHEAD_W = 10;
const NOTEHEAD_H = 8;
const HALF_NOTEHEAD_H = NOTEHEAD_H / 2;
const RHYTHMIC_NOTATION_CANVAS_W = FIRST_BEAT_L + (BEAT_LENGTH_PX * NUM_BEATS_PER_STAFFLINE) + FIRST_BEAT_L; //canvas longer to display notation but cursors will only travel duration of beat thus not to the end of the canvas
const RHYTHMIC_NOTATION_CANVAS_H = TOP_STAFF_LINE_Y + ((NUM_STAFFLINES - 1) * VERT_DIST_BTWN_STAVES) + STAFF_BTM_MARGIN;
const RHYTHMIC_NOTATION_CANVAS_TOP = CANVAS_MARGIN + RENDERER_H + BB_H + CANVAS_MARGIN;
const RHYTHMIC_NOTATION_CANVAS_L = CANVAS_MARGIN + CANVAS_L_R_MARGINS;
const NOTATION_CURSOR_H = 83;

let motivesByBeat = [];
let motiveDict = {
  '-1': 'qtr_rest',
  '0': 'quarter',
  '1': 'dot8thR_16th',
  '2': 'eighthR_8th',
  '3': 'eighthR_two16ths',
  '4': 'quadruplet',
  '5': 'quintuplet',
  '6': 'triplet',
  '7': 'two16th_8thR'
}
for (let beatIx = 0; beatIx < TOTAL_NUM_BEATS; beatIx++) {
  motivesByBeat.push({});
}

// #ef Beat Coordinates
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
// #endef Beat Coordinates


// #ef dynamicsAccents_paths_labels
let dynamicsAccents_paths_labels = [{
  path: "/pieces/sf004/notationSVGs/dynamics_accents/sf.svg",
  lbl: 'sf'
}];
// #endef END dynamicsAccents_paths_labels

// #endef END rhythmicNotation Variables


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
  scoreDataObject['scrollingCsrCoords_perTempo'] = [];
  scoreDataObject['tempoChanges_perPlayer'] = [];
  scoreDataObject['tempoFlagLocs_perPlayer'] = [];
  scoreDataObject['leadIn_tempoFlagLocs_perPlayer'] = [];
  scoreDataObject['playerTokenTempoNum_perPlayer'] = [];
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



  //##endef CALCULATIONS FOR UNISONS


  return scoreDataObject;
} // function generateScoreData() END


//#endef GENERATE SCORE DATA
