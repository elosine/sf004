//#ef RUNTIME


//#ef Global Vars

const NUM_TEMPOS = 5;
const NUM_PLAYERS = 5;
const TEMPO_COLORS = [clr_brightOrange, clr_brightGreen, clr_brightBlue, clr_lavander, clr_darkRed2];
// const TEMPO_COLORS = [clr_brightOrange, clr_lavander, clr_brightGreen, clr_brightBlue, clr_darkRed2];

// #ef Animation Engine Variables

const FRAMERATE = 60;
const MS_PER_FRAME = Math.round(1000.0 / FRAMERATE);
let FRAMECOUNT = 0;
let PIECE_TIME_MS = 0
const PX_PER_SEC = 100;
const PX_PER_FRAME = PX_PER_SEC / FRAMERATE;
const LEAD_IN_TIME_SEC = 2;
const LEAD_IN_TIME_MS = LEAD_IN_TIME_SEC * 1000;
const LEAD_IN_FRAMES = Math.round(LEAD_IN_TIME_SEC * FRAMERATE);

// #endef END Animation Engine Variables

// #ef notationSvgPaths_labels
let notationSvgPaths_labels = [{
    path: "/pieces/sf004/notationSVGs/quarter.svg",
    lbl: 'quarter'
  },
  {
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
    path: "/pieces/sf004/notationSVGs/qtr_rest.svg",
    lbl: 'qtr_rest'
  }
];
// #endef END notationSvgPaths_labels


// #endef END Global Vars

//#ef SOCKET IO

let ioConnection;

if (window.location.hostname == 'localhost') {
  ioConnection = io();
} else {
  ioConnection = io.connect(window.location.hostname);
}
const SOCKET = ioConnection;

//#endef > END SOCKET IO

//#ef TimeSync

const TS = timesync.create({
  server: '/timesync',
  interval: 1000
});

//#endef TimeSync END

// #ef INIT

function init() {

  processUrlArgs();

  scoreData = generateScoreData();
  console.log(scoreData);

  calculateScore();

  makeScoreDataManager();

  makeWorldPanel();

  makeThreeJsScene();

  makeRunway();

  makeTracks();

  makeGoFrets();

  makeTempoFrets();

  makeBouncingBalls();

  makeRhythmicNotation();

  makeScrollingCursors();

  makePlayerTokens();

  // playerTokens[3][3].svg.setAttributeNS(null, 'display', 'yes');
  // playerTokens[3][3].txt.setAttributeNS(null, 'display', 'yes');
  //
  // playerTokens[4][3].svg.setAttributeNS(null, 'display', 'yes');
  // playerTokens[4][3].txt.setAttributeNS(null, 'display', 'yes');
  // playerTokens[4][3].txt.setAttributeNS(null, 'x', '100px');
  // let td = describeArc(100, beatCoords[0].y - NOTATION_CURSOR_H - 16, 15, 90, 270)
  //
  // playerTokens[4][3].svg.setAttributeNS(null,'d',td);

  makeSigns();

  makePitchSets();

  makeArticulations();

  makeUnisonSigns();

  makeUnisonToken();

  makeScrollingBBs();

  RENDERER.render(SCENE, CAMERA);

  makeControlPanel();

} // function init() end

// #endef END INIT

// #ef URL Args

let PIECE_ID;
let partsToRun = [];
// let partsToRun = [0, 1, 2, 3, 4];
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

// #endef END URL Args

// #ef Generate Score Data


let scoreData;

let generateScoreData = function() {

  let tempScoreData = {};

  //##ef Tempos

  let tempos = [];

  // Generate 5 Tempos
  let baseTempo = choose([85, 91, 77]);
  let tempoRangeVarianceMin = 0.0045;
  let tempoRangeVarianceMax = 0.007;

  let tTempo = baseTempo;
  for (let i = 0; i < 5; i++) {
    tTempo += rrand(tempoRangeVarianceMin, tempoRangeVarianceMax) * tTempo;
    tempos.push(tTempo);
  }

  tempScoreData['tempos'] = tempos;

  //##endef Tempos

  //##ef Tempo Changes Per Player

  let tempoChangeFrameNum_perPlayer = [];

  for (let plrNum = 0; plrNum < NUM_PLAYERS; plrNum++) {


    //##ef Generate time containers within which a certian rate of tempo change will take place
    // 7 containers in a palindrome long-shorter-shorter-shorter-Mirror
    let tempoChgTimeCont = generatePalindromeTimeContainers({
      numContainersOneWay: 4,
      startCont_minMax: [90, 110],
      pctChg_minMax: [-0.25, -0.31]
    });
    //##endef Generate time containers within which a certian speed of tempo will take place

    //##ef Generate Set of when tempo changes are to occur in Frames
    // duration with tempo changes will be in this pattern: short - medium - long
    // in conjunction with time containers. so 1st tc from short array, next tc from medium array etc...
    let shortTempoChgDursSec = [4, 4, 5, 7];
    let mediumTempoChgDursSec = [9, 9, 11, 13];
    let longTempoChgDursSec = [14, 14, 16, 18];

    let tempoChangeFrames_thisPlayer = [];
    let tTimeElapsed = 0;
    tempoChangeFrames_thisPlayer.push(0); // so there is a starting tempo
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
        tempoChangeFrames_thisPlayer.push(timeElapsedAsFrames); //add to this players array of frames to change tempo

      } while (timeElapsed_thisTC <= timeContDur);

      timeContainerRemainder = timeElapsed_thisTC - timeContDur; //a negative number pass on remainder so pattern of tempo change durations remains consistant

    }); //tempoChgTimeCont.forEach((timeContDur) => END


    //##endef Generate Set of when tempo changes are to occur in beats

    tempoChangeFrameNum_perPlayer.push(tempoChangeFrames_thisPlayer);

  } // for(let plrNum=0;plrNum<NUM_PLAYERS;plrNum++) => END

  tempScoreData['tempoChanges'] = tempoChangeFrameNum_perPlayer;


  //##endef Tempo Changes Per Player

  //##ef Unison Tempo Changes
  //TOO MANY UNISONS REVISE THIS
  let unisonTempoChangeObjs = [];
  let unisonDurSet = [4, 4, 3, 3, 7, 9];
  let unisonTime = 0;

  let unison_gapRange_numIterations = [{
      gapRange: [21, 23],
      numIter: 1
    },
    {
      gapRange: [38, 41],
      numIter: 2
    },
    {
      gapRange: [34, 36],
      numIter: 3
    },
    {
      gapRange: [60, 65],
      numIter: 1
    },
    {
      gapRange: [34, 36],
      numIter: 3
    },
    {
      gapRange: [38, 41],
      numIter: 2
    },
    {
      gapRange: [21, 23],
      numIter: 1
    }
  ];


  unison_gapRange_numIterations.forEach((gapIterDict) => {

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

      let timeToNextUnison = rrand(gapIterDict.gapRange[0], gapIterDict.gapRange[1]);
      unisonTime += timeToNextUnison;

      unisonTempoChangeObjs.push(tChgObj);

    }

  }); //unison_gapRange_numIterations.forEach((gapIterDict) => END


  tempScoreData['unisons'] = unisonTempoChangeObjs;

  //##endef Unison Tempo Changes

  //##ef Notation Motives


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
    sz: (notationSvgPaths_labels.length - 1)
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

  //Make a frame by frame set with all the rests and motive changes state of all 8 beats each frame
  // take the time of last entry of motiveChangeTimesObjSet as the length of final looping set - convert to frames

  //fill all frames with all quarters then replace
  //##ef Insert Rests
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




    if (restType == 0) { //add rest

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
  tempScoreData['motiveSet'] = motiveChgByFrameSet;

  //##endef Insert Rests


  //##endef Notation Motives

  return tempScoreData;

} //generateScoreData = function() END


// #endef END Generate Score Data

// #ef Calculate Score


// #ef Calculate Score Vars


//##ef Tempo Frets
let tempoFretLocs_eachFrame_perTempo = [];
let goFrameCycles_perTempo = [];
let tempoFrets_leadInFrames_perTempo = [];
//##endef Tempo Frets

//##ef Go Frames
let goFramesCycle_perTempo = []; //cycle length from tempo frames
let goFrames_leadInFrames_perTempo = []
//##endef Go Frames

//##ef BBs
let bbYpos_perTempo = [];
let bbYpos_leadIn_perTempo = [];
//##endef BBs

//#ef Scrolling Cursors
let scrollingCsrCoords_perTempo = [];
//#endef Scrolling Cursors

//#ef Tempo Change Flags
let tempoFlagLocsByFrame_perPlr = [];
let leadIn_tempoFlagLocsByFrame_perPlr = [];
//#endef Tempo Change Flags

//#ef Player Tokens
let playerTokenLocationByFrame_perPlr = [];
//#endef Player Tokens

//#ef Unisons
let setOfUnisonFlagLocByFrame = [];
let leadInSet_unisonFlagLocByFrame = [];
let unisonPlrTokenLocByFrame;
//#endef Unisons


// #endef END Calculate Score Vars

let calculateScore = function() {

  //#ef Calculations Per Tempo


  scoreData.tempos.forEach((tTempo, thisTempoIx) => {

    // #ef Tempo Frets


    //##ef Comments
    // There will be an array of tempo fret locations for each tempo
    // The array will contain an array of Tempo Fret locations for each frame
    // The array can loop and is tempoLoopLengthBeats beats long, can change below
    //##endef Comments

    //##ef Tempo Fret Vars
    let beatsPerSec = tTempo / 60;
    let pxPerBeat_pxBtwnFrets = PX_PER_SEC / beatsPerSec;
    let framesPerBeat = pxPerBeat_pxBtwnFrets / PX_PER_FRAME;
    let tempoLoopLengthBeats = TOTAL_NUM_BEATS * 10;
    let tfSetCycle = Math.ceil(framesPerBeat); // num of frames that need to pass to travel one beat worth of distance
    let thisTempoLoop_numFrames = Math.round(framesPerBeat * tempoLoopLengthBeats); // number equal to tempoLoopLengthBeats beats worth of frames this will be the number of frames in the cycle
    let maxLocsToCalc = thisTempoLoop_numFrames * tfSetCycle; //the maximum number of tempo fret locations to calculate so that there will be enough locations in the last frame of the cycle
    //##endef Tempo Fret Vars

    //##ef LEAD IN FRAMES

    let maxTfsOnRunway = RUNWAY_L / pxPerBeat_pxBtwnFrets;
    let tfLocsSet = []; //one set of tempo fret locations from location lead in start

    // Make set of tflocations for each frame of lead in
    for (let tfLocIx = 0; tfLocIx < maxTfsOnRunway; tfLocIx++) { // Make set of tflocations for each frame of lead in
      tfLocsSet.push((pxPerBeat_pxBtwnFrets * -tfLocIx) - (LEAD_IN_FRAMES * PX_PER_FRAME));
    }

    let thisTempos_leadInFramesTfLocs_perFrame = [];

    for (let frmIx = 0; frmIx < LEAD_IN_FRAMES; frmIx++) { //for each lead in frame

      let thisFrameLocs = []; //set of locations for this frame

      tfLocsSet.forEach((loc) => { //take basic set from 0 and add 1 frame worth of distance
        thisFrameLocs.push(Math.round(loc + (PX_PER_FRAME * frmIx)));
      });

      thisTempos_leadInFramesTfLocs_perFrame.push(thisFrameLocs); //set of frames for this tempo

    } // for (let frmIx = 0; frmIx < LEAD_IN_FRAMES; frmIx++) END

    tempoFrets_leadInFrames_perTempo.push(thisTempos_leadInFramesTfLocs_perFrame); //push this tempos frames to overall array with all tempos

    //##endef LEAD IN FRAMES

    //##ef Tempo Frets Loop
    let tFrameCt = 0;
    let pxAdv = 0; // cumulitive frames*PX_PER_FRAME

    let thisTemposTfLocByFrameCycle = []; //array of frames for this tempo

    for (let frmIx = 0; frmIx < thisTempoLoop_numFrames; frmIx++) { //total num of frames in the cycle

      let tfLocByFrame = []; //set of locations for one frame

      for (let locIx = 0; locIx < maxLocsToCalc; locIx++) { //need to calculate many locations to fill cycle

        let tfLoc = (locIx * -pxPerBeat_pxBtwnFrets) + pxAdv; //advance each TF each frame


        // if (tfLoc <= pxPerBeat_pxBtwnFrets) { // does not include tfs that have already passed the go fret by more than one beat
        if (tfLoc <= 0) { // does not include tfs that have already passed the go fret

          tfLocByFrame.push(Math.round(tfLoc));

        }
        if (tfLoc < -RUNWAY_L) break; // can stop loop if tf is not on the runway yet


      } //  ffor (let locIx = 0; locIx < maxLocsToCalc; locIx++)  END

      tFrameCt++;
      pxAdv = tFrameCt * PX_PER_FRAME;
      thisTemposTfLocByFrameCycle.push(tfLocByFrame)

    } //or (let frmIx = 0; frmIx < thisTempoLoop_numFrames; frmIx++) END

    tempoFretLocs_eachFrame_perTempo.push(thisTemposTfLocByFrameCycle);
    //##endef Tempo Frets Loop


    // #endef END Tempo Frets

    // #ef Go Frames

    //##ef Lead In

    let thisTempo_leadIn_goFrames = [];

    for (let frmIx = 0; frmIx < LEAD_IN_FRAMES; frmIx++) {

      thisTempo_leadIn_goFrames.push(0);

    } // for (let frmIx = 0; frmIx < LEAD_IN_FRAMES; frmIx++) END

    goFrames_leadInFrames_perTempo.push(thisTempo_leadIn_goFrames);

    //##endef Lead In

    //##ef CALCULATE GO FRAMES

    let setOfGoFrames = []; // set of each frame number that is a go frame
    let maxNumGoFrames = (thisTempoLoop_numFrames / framesPerBeat) + 100; // to set a limit on below loop

    for (let frmIx = 0; frmIx < maxNumGoFrames; frmIx++) { //Find which frames are goframes

      let goFrameNum = Math.ceil(frmIx * framesPerBeat); //round up; it is the next whole frame that goes

      if (goFrameNum >= thisTempoLoop_numFrames) break; //end loop here; you'll only need the num of goframes for this tempos frame loop

      setOfGoFrames.push(goFrameNum);

    } //  for (let frmIx = 0; frmIx < maxNumGoFrames; frmIx++) END
    goFramesCycle_perTempo.push(setOfGoFrames);

    //##endef CALCULATE GO FRAMES

    //##ef Make Go Frames Cycle
    let thisTemposGoFrames = [];

    for (let frmIx = 0; frmIx < thisTempoLoop_numFrames; frmIx++) { //Make a goframe state for each frame in cycle

      let goFrmState = 0;

      for (let goFrmNumIx = 0; goFrmNumIx < setOfGoFrames.length; goFrmNumIx++) { //compare to goFrame num set

        let goFrmNum = setOfGoFrames[goFrmNumIx];

        if (goFrmNum == frmIx) {
          goFrmState = 1;
          break;
        }

      }

      thisTemposGoFrames.push(goFrmState);

    } // for (let frmIx = 0; frmIx < thisTempoLoop_numFrames; frmIx++)  END

    //##endef Make Go Frames Cycle

    //##ef Go Frames Blink
    let thisTemposGoFrames_blink = deepCopy(thisTemposGoFrames);

    let goFrmBlink = 14; //num of frames to hold go frame go

    for (let frmIx = 0; frmIx < thisTemposGoFrames.length; frmIx++) { // find go frames and make the subsequent goFrmBlink amt of frames go frames as well

      let frmState = thisTemposGoFrames[frmIx];

      if (frmState == 1) {

        for (let i = 1; i < goFrmBlink; i++) { //set the next few frames as go

          if ((frmIx + i) < thisTemposGoFrames.length) { //so you don't go past last frame in array

            thisTemposGoFrames_blink[frmIx + i] = 1; //make next few frames goframe on

          }

        } //  for (let i = 1; i < goFrmBlink; i++) END

        frmIx = frmIx + goFrmBlink; //move loop on past the frames you made into go frames

      } //  if (frmState == 1) END

    } //for (let frmIx = 0; frmIx < thisTemposGoFrames.length; frmIx++) END

    goFrameCycles_perTempo.push(thisTemposGoFrames_blink);

    //##endef Go Frames Blink

    // #endef END Go Frames

    // #ef BBs

    //##ef Calc BBs

    let bbYpos_thisTempo = [];
    let leadInDescent = [];

    setOfGoFrames.forEach((goFrm, goFrmIx) => { //setOfGoFrames contains the frame number of each go frame

      if (goFrmIx > 0) { //start on second so you can use previous index

        let previousGoFrame = setOfGoFrames[goFrmIx - 1];
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

        });

        let descentPlot = plot(function(x) {
          return Math.pow(x, descentFactor);
        }, [0, 1, 0, 1], numFramesDown, BB_TRAVEL_DIST);

        descentPlot.forEach((descentPos) => {

          let tBbY = BBCIRC_BOTTOM_CY - descentPos.y;
          bbYpos_thisTempo.push(Math.round(tBbY));

          //save first bounce for lead-in
          if (goFrmIx == 1) {
            leadInDescent.push(tBbY);
          }

        });

      } // if(goFrmIx>0) END

    }); // setOfGoFrames.forEach((goFrm, goFrmIx) => END

    //##endef Calc BBs

    //##ef Lead In - BBs

    //Make a lead in set of bbYpos_leadIn_thisTempo with thisTempo_leadIn_goFrames length & all BBCIRC_BOTTOM_CY
    let bbYpos_leadIn_thisTempo = [];
    thisTempo_leadIn_goFrames.forEach((item, i) => {
      bbYpos_leadIn_thisTempo.push(BBCIRC_BOTTOM_CY);
    });

    //make 1 descent just before first beat
    leadInDescent.forEach((bbYpos, dIx) => { //leadInDescent is already reversed so first index is lowest bbYpos
      let startIx = bbYpos_leadIn_thisTempo.length - 1 - leadInDescent.length;
      let thisIx = startIx + dIx;
      bbYpos_leadIn_thisTempo[thisIx] = bbYpos;
    });


    //##endef Lead In - BBs


    bbYpos_perTempo.push(bbYpos_thisTempo);
    bbYpos_leadIn_perTempo.push(bbYpos_leadIn_thisTempo);


    // #endef END BBs

    // #ef Scrolling Cursors

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

    //#endef Scrolling Cursors

    //#ef Calc Tempo Changes



    //#endef Calc Tempo Changes

    //#ef Player Tokens



    //#endef Player Tokens

  }); // scoreData.tempos.forEach((tTempo) => END


  //#endef Calculations Per Tempo

  //#ef Calculations Per Player


  scoreData.tempoChanges.forEach((tempoChgFrameNumSet, plrIx) => {


    //#ef Tempo Change Flags


    let tempoFlagLocsByFrame_thisPlr = []; // 1 index per frame {tempo:,frameNum:}
    for (let i = 0; i < 100000; i++) tempoFlagLocsByFrame_thisPlr.push([]); // populate with -1 to replace later
    let leadIn_tempoFlagLocsByFrame_thisPlr = []; //make a set of lead in frames
    for (let i = 0; i < (RUNWAY_L_IN_NUMFRAMES - 1); i++) leadIn_tempoFlagLocsByFrame_thisPlr.push([]);

    //##ef Choose Tempo for each tempo change

    // scoreData.tempoChanges or here tempoChgFrameNumSet lists which framenumber to change tempo on for this player
    // This section will decide which tempo to use
    let tempoChangesByFrameNum_thisPlr = []; //{tempo:,frameNum}
    let tTempoSet = [0, 1, 2, 3, 4];

    tempoChgFrameNumSet.forEach((frmToChgTempo, setIx) => {

      let tNewTempo_frmNum_obj = {};

      //decide which tempo; cycle through them all
      if (tTempoSet.length == 0) tTempoSet = [0, 1, 2, 3, 4]; //when all used up replenish
      let tTempoIx = chooseIndex(tTempoSet); //select the index number from the remaining tempo set
      let tNewTempo = tTempoSet[tTempoIx];
      tTempoSet.splice(tTempoIx, 1); //remove this tempo from set

      tNewTempo_frmNum_obj['tempo'] = tNewTempo;
      tNewTempo_frmNum_obj['frameNum'] = frmToChgTempo;
      tempoChangesByFrameNum_thisPlr.push(tNewTempo_frmNum_obj);

    }); // tempoChgFrameNumSet.forEach((frmToChgTempo, setIx) => END

    //##endef Choose Tempo for each tempo change

    //##ef Determine Sign Z Position for each tempo change for each frame - this player


    let tempoChg_signPos_thisPlayer = [];

    tempoChangesByFrameNum_thisPlr.forEach((tempoFrmNumObj, tempChgIx) => { //{tempo:,frameNum:}

      let tempoNum = tempoFrmNumObj.tempo;
      let goFrmNum = tempoFrmNumObj.frameNum; //this is the frame num where the sign is at the go fret

      for (let i = (RUNWAY_L_IN_NUMFRAMES - 1); i >= 0; i--) { //Need to add a zLocation for every frame the sign is on the runway; count backwards so the soonist frame is the furtherest back position on runway and the last frame is 0-zpos

        let tempoNum_zPos_obj = {};
        let frameNum = goFrmNum - i; //

        if (frameNum >= 0) { //so you don't go to negative array index

          tempoNum_zPos_obj['tempoNum'] = tempoNum;
          let zLoc = Math.round(-PX_PER_FRAME * i);
          tempoNum_zPos_obj['zLoc'] = zLoc;
          tempoFlagLocsByFrame_thisPlr[frameNum].push(tempoNum_zPos_obj); //replace the index in main array for this frame

          //pop off last frame for looping
          if (tempChgIx == (tempoChangesByFrameNum_thisPlr.length - 1)) { //last tempo change with tempo num and frame num for this player
            if (i == 0) { // last frame of this cycle

              tempoFlagLocsByFrame_thisPlr.splice(frameNum); // truncate array to end of loop; was 100,000 long; frameNum instead of frameNum-1 will lob off last frame so it is clean loop, otherwise it goes to z=0 and the first frame of loop is also z=0

            }
          } //   if (tempChgIx == (tempoChangesByFrameNum_thisPlr.length - 1)) END

        } // if (frameNum >= 0) END
        //
        else { //for lead-in

          tempoNum_zPos_obj['tempoNum'] = tempoNum;
          let zLoc = Math.round(-PX_PER_FRAME * i);
          tempoNum_zPos_obj['zLoc'] = zLoc;
          leadIn_tempoFlagLocsByFrame_thisPlr[RUNWAY_L_IN_NUMFRAMES - 1 + frameNum].push(tempoNum_zPos_obj); //replace the index in main array for this frame

        } //else END

      } // for (let i = RUNWAY_L_IN_NUMFRAMES; i >= 0; i--) END

      //MAKE ANOTHER LOOP HERE FOR DUR TO HOLD FLAG AT GO FRET
      if (tempChgIx < tempoChangesByFrameNum_thisPlr.length - 1) {
        let tDurFrames = tempoChangesByFrameNum_thisPlr[tempChgIx + 1].frameNum - goFrmNum;
        for (let i = 1; i < tDurFrames; i++) {

          let tempoNum_zPos_obj = {};

          tempoNum_zPos_obj['tempoNum'] = tempoNum;
          tempoNum_zPos_obj['zLoc'] = 0;
          let tFrameNum = goFrmNum + i;
          tempoFlagLocsByFrame_thisPlr[tFrameNum].push(tempoNum_zPos_obj);

        } // for (let i = 1; i < tDurFrames; i++) END
      }

    }); // tempoChangesByFrameNum_thisPlr.forEach((tempoFrmNumObj) => END

    //##endef  Determine Sign Z Position for each tempo change for each frame - this player

    tempoFlagLocsByFrame_perPlr.push(tempoFlagLocsByFrame_thisPlr);
    leadIn_tempoFlagLocsByFrame_perPlr.push(leadIn_tempoFlagLocsByFrame_thisPlr);


    //#endef Tempo Change Flags

    //#ef Player Tokens


    //An Array length = to playerTokenLocationByFrame, that contains the current tempo for this player for this frame
    //In Update look up that frame's scrolling cursor location for the right tempo listed here
    let playerTokenLocationByFrame_thisPlr = new Array(tempoFlagLocsByFrame_thisPlr.length).fill(-1);

    tempoChangesByFrameNum_thisPlr.forEach((tempoChgObj, tchgIx) => {
      if (tchgIx > 0) { //cause we are looking backwards

        let thisTempo = tempoChgObj.tempo;
        let thisFrameNum = tempoChgObj.frameNum;
        let lastTempo = tempoChangesByFrameNum_thisPlr[tchgIx - 1].tempo;
        let lastFrameNum = tempoChangesByFrameNum_thisPlr[tchgIx - 1].frameNum;
        let tNumToFill = thisFrameNum - lastFrameNum;

        for (let i = 0; i < tNumToFill; i++) {
          playerTokenLocationByFrame_thisPlr[lastFrameNum + i] = lastTempo;
        }

      } // if (tchgIx > 0) END
    }); // tempoChangesByFrameNum_thisPlr.forEach((tempoChgObj, tchgIx) => END

    playerTokenLocationByFrame_perPlr.push(playerTokenLocationByFrame_thisPlr);

    //#endef Player Tokens


  }); // scoreData.tempoChanges.forEach((tempoChgFrameNumSet, plrIx) => END


  //#endef Calculations Per Player

  //#ef Calculations for Unisons


  //#ef Unison Flags

  //Make loop size array to store unison state for each frame in loop
  let lastFrameInUnisonLoop = scoreData.unisons[scoreData.unisons.length - 1].frame + scoreData.unisons[scoreData.unisons.length - 1].durFrames;
  for (let i = 0; i < lastFrameInUnisonLoop; i++) {
    setOfUnisonFlagLocByFrame.push([]);
  }

  for (let i = 0; i < (RUNWAY_L_IN_NUMFRAMES - 1); i++) leadInSet_unisonFlagLocByFrame.push([]);


  let tempoChg_signPos_thisPlayer = [];

  scoreData.unisons.forEach((tempoFrmNumObj, tempChgIx) => { //{tempo:,frame:, durFrames:}

    let tempoNum = tempoFrmNumObj.tempo;
    let goFrmNum = tempoFrmNumObj.frame; //this is the frame num where the sign is at the go fret
    let tDurFrames = tempoFrmNumObj.durFrames;

    for (let i = (RUNWAY_L_IN_NUMFRAMES - 1); i >= 0; i--) { //Need to add a zLocation for every frame the sign is on the runway; count backwards so the soonist frame is the furtherest back position on runway and the last frame is 0-zpos

      let tempoNum_zPos_obj = {};
      let frameNum = goFrmNum - i; //

      if (frameNum >= 0) { //so you don't go to negative array index

        tempoNum_zPos_obj['tempoNum'] = tempoNum;
        let zLoc = Math.round(-PX_PER_FRAME * i);
        tempoNum_zPos_obj['zLoc'] = zLoc;
        tempoNum_zPos_obj['end'] = false;
        setOfUnisonFlagLocByFrame[frameNum].push(tempoNum_zPos_obj); //replace the index in main array for this frame

      } // if (frameNum >= 0) END
      //
      else { //for lead-in

        tempoNum_zPos_obj['tempoNum'] = tempoNum;
        let zLoc = Math.round(-PX_PER_FRAME * i);
        tempoNum_zPos_obj['zLoc'] = zLoc;
        tempoNum_zPos_obj['end'] = false;
        leadInSet_unisonFlagLocByFrame[RUNWAY_L_IN_NUMFRAMES - 1 + frameNum].push(tempoNum_zPos_obj); //replace the index in main array for this frame

      } //else END

    } // for (let i = RUNWAY_L_IN_NUMFRAMES; i >= 0; i--) END

    //MAKE ANOTHER LOOP HERE FOR DUR TO HOLD FLAG AT GO FRET
    for (let i = 1; i < tDurFrames; i++) {

      let tempoNum_zPos_obj = {};

      tempoNum_zPos_obj['tempoNum'] = tempoNum;
      tempoNum_zPos_obj['zLoc'] = 0;
      tempoNum_zPos_obj['end'] = false;
      let tFrameNum = goFrmNum + i;
      setOfUnisonFlagLocByFrame[tFrameNum].push(tempoNum_zPos_obj);

    } // for (let i = 1; i < tDurFrames; i++) END

  }); // scoreData.unisons.forEach((tempoFrmNumObj, tempChgIx) => END


  // FOR SET OF UNISON OFF FLAGS
  scoreData.unisons.forEach((tempoFrmNumObj, tempChgIx) => { //{tempo:,frame:, durFrames:}

    if (tempChgIx < scoreData.unisons.length - 1) {

      let tempoNum = tempoFrmNumObj.tempo;
      let goFrmNum = tempoFrmNumObj.frame + tempoFrmNumObj.durFrames; //this is the frame num where the sign is at the go fret
      let tDurFrames = tempoFrmNumObj.durFrames;

      for (let i = (RUNWAY_L_IN_NUMFRAMES - 1); i >= 0; i--) { //Need to add a zLocation for every frame the sign is on the runway; count backwards so the soonist frame is the furtherest back position on runway and the last frame is 0-zpos

        let tempoNum_zPos_obj = {};
        let frameNum = goFrmNum - i; //

        if (frameNum >= 0) { //so you don't go to negative array index

          tempoNum_zPos_obj['tempoNum'] = tempoNum;
          let zLoc = Math.round(-PX_PER_FRAME * i);
          tempoNum_zPos_obj['zLoc'] = zLoc;
          tempoNum_zPos_obj['end'] = true;
          setOfUnisonFlagLocByFrame[frameNum].push(tempoNum_zPos_obj); //replace the index in main array for this frame

        } // if (frameNum >= 0) END
        //
        else { //for lead-in

          tempoNum_zPos_obj['tempoNum'] = tempoNum;
          let zLoc = Math.round(-PX_PER_FRAME * i);
          tempoNum_zPos_obj['zLoc'] = zLoc;
          tempoNum_zPos_obj['end'] = true;
          leadInSet_unisonFlagLocByFrame[RUNWAY_L_IN_NUMFRAMES - 1 + frameNum].push(tempoNum_zPos_obj); //replace the index in main array for this frame

        } //else END

      } // for (let i = RUNWAY_L_IN_NUMFRAMES; i >= 0; i--) END
    }

  }); // scoreData.unisons.forEach((tempoFrmNumObj, tempChgIx) => END

  //#endef Unison Flags

  //#ef Unison Player Token

  //#ef Unison Player Tokens

  unisonPlrTokenLocByFrame = new Array(setOfUnisonFlagLocByFrame.length).fill(-1);

  scoreData.unisons.forEach((tempoChgObj, tchgIx) => {

    let thisTempo = tempoChgObj.tempo;
    let thisFrameNum = tempoChgObj.frame;
    let tNumToFill = tempoChgObj.durFrames;

    for (let i = 0; i < tNumToFill; i++) {
      unisonPlrTokenLocByFrame[thisFrameNum + i] = thisTempo;
    }

  }); // tempoChangesByFrameNum_thisPlr.forEach((tempoChgObj, tchgIx) => END


  //#endef Unison Player Tokens

  //#endef Unison Player Token


  //#endef Calculations for Unisons



} // let calculateScore = function()


// #endef END Calculate Score


//#endef RUNTIME

// #ef WORLD


// #ef World Panel

// #ef World Panel Variables
let worldPanel;
const CANVAS_L_R_MARGINS = 35;
const CANVAS_MARGIN = 7;
const CANVAS_W = 692 + (CANVAS_L_R_MARGINS * 2) + (CANVAS_MARGIN * 2);
const CANVAS_H = 578;
const CANVAS_CENTER = CANVAS_W / 2;
// #endef END World Panel Variables

function makeWorldPanel() {

  worldPanel = mkPanel({
    w: CANVAS_W,
    h: CANVAS_H,
    title: 'SoundFlow #4',
    onwindowresize: true,
    clr: clr_blueGrey
  });

}

// #endef END World Panel

// #ef ThreeJS Scene

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

function makeThreeJsScene() {

  SCENE = new THREE.Scene();

  // #ef Camera

  CAMERA = new THREE.PerspectiveCamera(75, RENDERER_W / RENDERER_H, 1, 3000);
  CAMERA.position.set(0, CAM_Y, CAM_Z);
  CAMERA.rotation.x = rads(CAM_ROTATION_X);

  // #endef END Camera

  // #ef Lights

  SUN = new THREE.DirectionalLight(0xFFFFFF, 1.2);
  SUN.position.set(100, 600, 175);
  SCENE.add(SUN);
  SUN2 = new THREE.DirectionalLight(0x40A040, 0.6);
  SUN2.position.set(-100, 350, 200);
  SCENE.add(SUN2);

  // #endef END Lights

  // #ef RENDERER_DIV & RENDERER

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

  // #endef END RENDERER_DIV & RENDERER

} // function makeThreeJsScene() end

// #endef END ThreeJs Scene

// #ef Runway


// #ef Runway Variables

const RUNWAY_W = RENDERER_W;
const RUNWAY_H = RENDERER_H;
const RUNWAY_L = 1000;
const HALF_RUNWAY_W = RUNWAY_W / 2;
const HALF_RUNWAY_LENGTH = RUNWAY_L / 2;
const RUNWAY_L_IN_NUMFRAMES = Math.round(RUNWAY_L / PX_PER_FRAME);

// #endef END Runway Variables

// #ef makeRunway

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

// #endef END makeRunway


// #endef END Runway

// #ef Tracks

// #ef Tracks Variables

const NUM_TRACKS = NUM_TEMPOS;
const TRACK_DIAMETER = 8;
const HALF_TRACK_DIAMETER = TRACK_DIAMETER / 2;
const TRACK_GAP = RUNWAY_W / NUM_TRACKS;
const HALF_TRACK_GAP = TRACK_GAP / 2;
let xPosOfTracks = [];
for (let trIx = 0; trIx < NUM_TRACKS; trIx++) {
  xPosOfTracks.push(-HALF_RUNWAY_W + (TRACK_GAP * trIx) + HALF_TRACK_GAP);
}

// #endef END Tracks Variables

// #ef makeTracks

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

// #endef END makeTracks

// #endef END Tracks

// #ef Go Frets

// #ef GoFrets Variables

let goFrets = [];
let goFretsGo = [];
const GO_FRET_W = 54;
const GO_FRET_H = 11;
const HALF_GO_FRET_H = GO_FRET_H / 2;
const GO_FRET_L = 13;
const HALF_GO_FRET_L = GO_FRET_L / 2;
const GO_Z = -HALF_GO_FRET_L;
const GO_FRET_Y = HALF_TRACK_DIAMETER;

// #endef END GoFrets Variables

// #ef makeGoFrets

function makeGoFrets() {

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
// #endef End makeGoFrets

// #ef wipeGoFrets
function wipeGoFrets() {
  goFrets.forEach((goFret, fretIx) => {
    goFret.visible = false;
    goFretsGo[fretIx].visible = false;
  });
}
// #endef END wipeGoFrets

// #ef updateGoFrets

function updateGoFrets() {

  if (FRAMECOUNT < LEAD_IN_FRAMES) {

    goFrames_leadInFrames_perTempo.forEach((goFrmSet, tempoIx) => { // A set of locations for each frame for each tempo which loops

      let goFrmSetIx = FRAMECOUNT % goFrmSet.length; // module loops the set of frames

      let goFrmState = goFrmSet[goFrmSetIx];

      switch (goFrmState) {

        case 0:

          goFrets[tempoIx].visible = true;
          goFretsGo[tempoIx].visible = false;

          break;

        case 1:

          goFrets[tempoIx].visible = false;
          goFretsGo[tempoIx].visible = true;

          break;

      } //switch (goFrmState) END

    }); //goFrameCycles_perTempo.forEach((goFrmSet, tempoIx) => END

  } //  if (FRAMECOUNT < LEAD_IN_FRAMES) END
  else {

    goFrameCycles_perTempo.forEach((goFrmSet, tempoIx) => { // A set of locations for each frame for each tempo which loops

      let goFrmSetIx = (FRAMECOUNT - LEAD_IN_FRAMES) % goFrmSet.length;

      let goFrmState = goFrmSet[goFrmSetIx];

      switch (goFrmState) {

        case 0:

          goFrets[tempoIx].visible = true;
          goFretsGo[tempoIx].visible = false;

          break;

        case 1:

          goFrets[tempoIx].visible = false;
          goFretsGo[tempoIx].visible = true;

          break;

      } //switch (goFrmState) END

    }); //goFrameCycles_perTempo.forEach((goFrmSet, tempoIx) => END

  } //else END

} // function updateGoFrets() END

// #endef END updateGoFrets

// #endef END Go Frets

// #ef Tempo Frets

// #ef Tempo Frets Variables

let tempoFretsPerTrack = [];
const TEMPO_FRET_W = GO_FRET_W - 2;
const TEMPO_FRET_H = GO_FRET_H - 2;
const TEMPO_FRET_L = GO_FRET_L - 5;
const TEMPO_FRET_Y = HALF_TRACK_DIAMETER;
const NUM_TEMPO_FRETS_TO_FILL = RUNWAY_L / TEMPO_FRET_L;

// #endef END Tempo Frets Variables

// #ef makeTempoFrets

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

// #endef END makeTempoFrets

// #ef wipeTempoFrets
function wipeTempoFrets() {
  tempoFretsPerTrack.forEach((arrayOfTempoFretsForOneTrack) => {
    arrayOfTempoFretsForOneTrack.forEach((tTempoFret) => {
      tTempoFret.visible = false;
    });
  });
}
// #endef END wipeTempoFrets

// #ef updateTempoFrets

function updateTempoFrets() {

  // ##ef Loop for Lead In FRAMES
  if (FRAMECOUNT < LEAD_IN_FRAMES) { //LEAD_IN_FRAMES-1 cause loops start on 0 and go to length-1

    tempoFrets_leadInFrames_perTempo.forEach((thisTempo_tfSet, tempoIx) => { // Set of Tempo Frets for each Tempo

      let tfSetIx = FRAMECOUNT;

      thisTempo_tfSet[tfSetIx].forEach((tfLoc, tfIx) => { //each tf location for this tempo

        tempoFretsPerTrack[tempoIx][tfIx].position.z = GO_Z + tfLoc; //tempoFretsPerTrack is set of tfs already created by tempo
        tempoFretsPerTrack[tempoIx][tfIx].visible = true;

      }); // tempoFrets_leadInFrames_perTempo.forEach((thisTempo_tfSet, tempoIx) => END

    }); //tempoFrets_leadInFrames_perTempo.forEach((thisTempo_tfSet, tempoIx) => END

  } // if (FRAMECOUNT < LEAD_IN_FRAMES) END
  // ##endef Loop for Lead In FRAMES

  //##ef Loop for Regular TF Cycles
  else {

    // TEMPO FRETS TEMPO thisTempoLoop_numFrames
    tempoFretLocs_eachFrame_perTempo.forEach((setOfTempoFretLocsByFrame, tempoIx) => { // A set of locations for each frame for each tempo which loops

      let tempoFretLocationsSetNum = (FRAMECOUNT - LEAD_IN_FRAMES) % setOfTempoFretLocsByFrame.length; //adjust frame count for lead in frames and modulo for cycle length

      setOfTempoFretLocsByFrame[tempoFretLocationsSetNum].forEach((loc, tfIx) => { //this goes through the set of tfs that were created at init, only draws the necessary ones and positions them

        tempoFretsPerTrack[tempoIx][tfIx].position.z = GO_Z + loc;
        tempoFretsPerTrack[tempoIx][tfIx].visible = true;

      }); //tempoFretLocs_eachFrame_perTempo.forEach((setOfTempoFretLocsByFrame, tempoIx) => END

    }); // tempoFretLocs_eachFrame_perTempo.forEach((setOfTempoFretLocsByFrame, tempoIx) => END

  } //else END

  //##endef Loop for Regular TF Cycles

} //function updateTempoFrets()  END


// #endef END updateTempoFrets

// #endef END Tempo Frets

// #ef Bouncing Balls


// #ef BouncingBalls Variables

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

// #endef END BouncingBalls Variables

// #ef makeBouncingBalls

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

// #endef END makeBouncingBalls

// #ef wipeBbComplex

function wipeBbComplex() {

  bbSet.forEach((tbb) => {

    // tbb.bbCirc.setAttributeNS(null, 'display', 'none');
    tbb.bbBouncePadOff.setAttributeNS(null, 'display', 'none');
    tbb.bbBouncePadOn.setAttributeNS(null, 'display', 'none');
    // tbb.offIndicator.setAttributeNS(null, 'display', 'yes');

  });

}

// #endef END wipeBbComplex

// #ef updateBbBouncePad

function updateBbBouncePad() {

  if (FRAMECOUNT < LEAD_IN_FRAMES) {

    goFrames_leadInFrames_perTempo.forEach((goFrmSet, tempoIx) => { // A set of locations for each frame for each tempo which loops

      let goFrmSetIx = FRAMECOUNT % goFrmSet.length; // module loops the set of frames

      let goFrmState = goFrmSet[goFrmSetIx];

      switch (goFrmState) {

        case 0:

          bbSet[tempoIx].bbBouncePadOn.setAttributeNS(null, 'display', 'none');
          bbSet[tempoIx].bbBouncePadOff.setAttributeNS(null, 'display', 'yes');

          break;

        case 1:

          bbSet[tempoIx].bbBouncePadOn.setAttributeNS(null, 'display', 'yes');
          bbSet[tempoIx].bbBouncePadOff.setAttributeNS(null, 'display', 'none');

          break;

      } //switch (goFrmState) END

    }); //goFrameCycles_perTempo.forEach((goFrmSet, tempoIx) => END

  } //  if (FRAMECOUNT < LEAD_IN_FRAMES) END
  else {

    goFrameCycles_perTempo.forEach((goFrmSet, tempoIx) => { // A set of locations for each frame for each tempo which loops

      let goFrmSetIx = (FRAMECOUNT - LEAD_IN_FRAMES) % goFrmSet.length;

      let goFrmState = goFrmSet[goFrmSetIx];

      switch (goFrmState) {

        case 0:

          bbSet[tempoIx].bbBouncePadOn.setAttributeNS(null, 'display', 'none');
          bbSet[tempoIx].bbBouncePadOff.setAttributeNS(null, 'display', 'yes');

          break;

        case 1:

          bbSet[tempoIx].bbBouncePadOn.setAttributeNS(null, 'display', 'yes');
          bbSet[tempoIx].bbBouncePadOff.setAttributeNS(null, 'display', 'none');

          break;

      } //switch (goFrmState) END

    }); //goFrameCycles_perTempo.forEach((goFrmSet, tempoIx) => END

  } //else END

} // function updateBbBouncePad() END

// #endef END updateBbBouncePad

// #ef updateBBs

function updateBBs() {

  //##ef Lead In - BBs
  if (FRAMECOUNT < LEAD_IN_FRAMES) {

    bbYpos_leadIn_perTempo.forEach((leadInSet, tempoIx) => { // A set of locations for each frame for each tempo which loops

      bbSet[tempoIx].bbCirc.setAttributeNS(null, 'cy', leadInSet[FRAMECOUNT]);

    }); //   bbYpos_leadIn_perTempo.forEach((leadInSet, tempoIx) =>  END

  } //  if (FRAMECOUNT < LEAD_IN_FRAMES) END
  //##endef Lead In - bbs

  //##ef Animate BBs
  else {

    bbYpos_perTempo.forEach((bbYposSet, tempoIx) => { // Loop: set of goFrames

      let bbYposSetIx = (FRAMECOUNT - LEAD_IN_FRAMES) % bbYposSet.length; //adjust current FRAMECOUNT to account for lead-in and loop this tempo's set of goFrames

      let tBbCy = bbYposSet[bbYposSetIx];
      bbSet[tempoIx].bbCirc.setAttributeNS(null, 'cy', tBbCy);
      bbSet[tempoIx].bbCirc.setAttributeNS(null, 'display', 'yes');

    }); //goFrameCycles_perTempo.forEach((bbYposSet, tempoIx) => END

  } //else END

  //##endef Animate BBs


} // function updateBbBouncePad() END

// #endef END updateBBs


// #endef END BouncingBalls

// #ef Rhythmic Notation


// #ef rhythmicNotation Variables

let rhythmicNotationObj = {};
let notationImageObjectSet = {};

const BEAT_L_PX = 85;
const TOP_STAFF_LINE_Y = 113;
const VERT_DIST_BTWN_STAVES = 133;
const VERT_DIST_BTWN_STAFF_LINES = 8;
const FIRST_BEAT_L = 12;
const LAST_BEAT_W = BEAT_L_PX - FIRST_BEAT_L;
const NUM_BEATS_PER_STAFFLINE = 8;
const LAST_BEAT_NUM_IN_LINE = NUM_BEATS_PER_STAFFLINE - 1;
const STAFF_BTM_MARGIN = 40;
const NUM_STAFFLINES = 2;
const TOTAL_NUM_BEATS = NUM_BEATS_PER_STAFFLINE * NUM_STAFFLINES;
const NOTEHEAD_W = 10;
const NOTEHEAD_H = 8;
const HALF_NOTEHEAD_H = NOTEHEAD_H / 2;
const RHYTHMIC_NOTATION_CANVAS_W = FIRST_BEAT_L + (BEAT_L_PX * NUM_BEATS_PER_STAFFLINE) + FIRST_BEAT_L; //canvas longer to display notation but cursors will only travel duration of beat thus not to the end of the canvas
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
  beatXLocations.push(FIRST_BEAT_L + (beatLocIx * BEAT_L_PX));
}

let beatCoords = [];
for (let staffIx = 0; staffIx < NUM_STAFFLINES; staffIx++) {
  for (let beatPerStaffIx = 0; beatPerStaffIx < NUM_BEATS_PER_STAFFLINE; beatPerStaffIx++) {
    let tCoordObj = {};
    tCoordObj['x'] = FIRST_BEAT_L + (beatPerStaffIx * BEAT_L_PX);
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

function makeRhythmicNotation() {

  // #ef DIV/SVG Container

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

  // #endef END DIV/SVG Container

  // #ef StaffLines
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
  // #endef END Staff Lines

  // #ef Draw Initial Notation

  // Make all motives and make display:none; Display All Quarters
  function makeMotives() { // This function runs in loop below, after await so all image sizes are loaded

    //make an SVG for each motive at each beat
    beatCoords.forEach((beatCoordsObj, beatIx) => { //each beat loop

      let tx = beatCoordsObj.x;
      let ty = beatCoordsObj.y;

      notationSvgPaths_labels.forEach((pathLblObj) => { //each motive loop

        let tLabel = pathLblObj.lbl;
        let tDisp = tLabel == 'quarter' ? 'yes' : 'none'; //initial notation displayed
        // let tDisp = tLabel == 'triplet' ? 'yes' : 'none';

        // Create HTML SVG image
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

      if (i == (notationSvgPaths_labels.length - 1)) { //does not run makeMotives until all images are loaded

        makeMotives();

      }

    })();

  }); //notationSvgPaths_labels.forEach((pathLblObj, i) end

  // #endef END Draw Initial Notation

} //makeRhythmicNotation() end

// #ef Notation Scrolling Cursors

let tempoCursors = [];

function makeScrollingCursors() {

  for (let tempoCsrIx = 0; tempoCsrIx < NUM_TEMPOS; tempoCsrIx++) {

    let tLine = mkSvgLine({
      svgContainer: rhythmicNotationObj.svgCont,
      x1: beatCoords[0].x,
      y1: beatCoords[0].y + HALF_NOTEHEAD_H - NOTATION_CURSOR_H,
      x2: beatCoords[0].x,
      y2: beatCoords[0].y + HALF_NOTEHEAD_H, //beatCoords[0].y is 3rd staff line
      stroke: TEMPO_COLORS[tempoCsrIx],
      strokeW: 3
    });
    tLine.setAttributeNS(null, 'stroke-linecap', 'round');
    tLine.setAttributeNS(null, 'display', 'none');
    tempoCursors.push(tLine);

  } //for (let tempoCsrIx = 0; tempoCsrIx < NUM_TEMPOS; tempoCsrIx++) END

}

// #ef wipeTempoCsrs

function wipeTempoCsrs() {

  tempoCursors.forEach((tempoCsr) => {

    tempoCsr.setAttributeNS(null, 'display', 'none');

  });


}

// #endef END wipeTempoCsrs

// #endef END Notation Scrolling Cursors

// #ef Make Scrolling BB


// #ef Scrolling BBs Variables

let scr_bbSet = [];
for (let i = 0; i < NUM_TEMPOS; i++) scr_bbSet.push({});
const SCR_BB_W = 26;
const SCR_BB_H = NOTATION_CURSOR_H;
const SCR_BB_TOP = beatCoords[0].y + HALF_NOTEHEAD_H - NOTATION_CURSOR_H;
const SCR_BB_CENTER = SCR_BB_W / 2;
const SCR_BB_PAD_LEFT = 4;
// const BB_GAP = 16;
const SCR_BBCIRC_RADIUS = 6;
const SCR_BBCIRC_TOP_CY = SCR_BBCIRC_RADIUS + 2;
const SCR_BBCIRC_BOTTOM_CY = SCR_BB_H - SCR_BBCIRC_RADIUS;
const SCR_BB_TRAVEL_DIST = SCR_BBCIRC_BOTTOM_CY - SCR_BBCIRC_TOP_CY;
const SCR_BB_BOUNCE_WEIGHT = 6;
const SCR_HALF_BB_BOUNCE_WEIGHT = SCR_BB_BOUNCE_WEIGHT / 2;

// #endef END Scrolling BBs Variables

function makeScrollingBBs() {

  for (let scrBbIx = 0; scrBbIx < NUM_TEMPOS; scrBbIx++) {

          bbSet[scrBbIx]['div'] = mkDiv({
          canvas: rhythmicNotationObj.svgCont,
          w: SCR_BB_W,
          h: SCR_BB_H,
          top: SCR_BB_TOP,
          left:   beatCoords[0].x - SCR_BB_W,
          bgClr: 'white'
        });

        bbSet[scrBbIx]['svgCont'] = mkSVGcontainer({
          canvas: bbSet[scrBbIx].div,
          w: SCR_BB_W,
          h: SCR_BB_H,
          x: 0,
          y: 0
        });

        bbSet[scrBbIx]['bbCirc'] = mkSvgCircle({
          svgContainer: bbSet[scrBbIx].svgCont,
          cx: SCR_BB_CENTER,
          cy: SCR_BBCIRC_TOP_CY,
          r: SCR_BBCIRC_RADIUS,
          fill: TEMPO_COLORS[scrBbIx],
          stroke: 'white',
          strokeW: 0
        });

        bbSet[scrBbIx]['bbBouncePadOff'] = mkSvgLine({
          svgContainer: bbSet[scrBbIx].svgCont,
          x1: 0,
          y1: SCR_BB_H - SCR_HALF_BB_BOUNCE_WEIGHT,
          x2: SCR_BB_W,
          y2: SCR_BB_H - SCR_HALF_BB_BOUNCE_WEIGHT,
          stroke: 'black',
          strokeW: SCR_BB_BOUNCE_WEIGHT
        });

        bbSet[scrBbIx]['bbBouncePadOn'] = mkSvgLine({
          svgContainer: bbSet[scrBbIx].svgCont,
          x1: 0,
          y1: SCR_BB_H - SCR_HALF_BB_BOUNCE_WEIGHT,
          x2: SCR_BB_W,
          y2: SCR_BB_H - SCR_HALF_BB_BOUNCE_WEIGHT,
          stroke: 'yellow',
          strokeW: SCR_BB_BOUNCE_WEIGHT + 2
        });
        bbSet[scrBbIx].bbBouncePadOn.setAttributeNS(null, 'display', 'none');


        bbSet[scrBbIx]['offIndicator'] = mkSvgRect({
          svgContainer: bbSet[scrBbIx].svgCont,
          x: 0,
          y: 0,
          w: SCR_BB_W,
          h: SCR_BB_H,
          fill: 'rgba(173, 173, 183, 0.9)',
        });
        bbSet[scrBbIx].offIndicator.setAttributeNS(null, 'display', 'none');

  } //for (let scrBbIx = 0; scrBbIx < NUM_TEMPOS; scrBbIx++) END

} // function makeScrollingBBs() END


// #endef END Make Scrolling BB

// #ef updateScrollingCsrs


function updateScrollingCsrs() {

  if (FRAMECOUNT > LEAD_IN_FRAMES) { //No lead in motion for scrolling cursors

    scrollingCsrCoords_perTempo.forEach((posObjSet, tempoIx) => { // Loop: set of goFrames

      let setIx = (FRAMECOUNT - LEAD_IN_FRAMES) % posObjSet.length; //adjust current FRAMECOUNT to account for lead-in and loop this tempo's set of goFrames

      let tX = posObjSet[setIx].x;
      let tY1 = posObjSet[setIx].y1;
      let tY2 = posObjSet[setIx].y2;
      tempoCursors[tempoIx].setAttributeNS(null, 'x1', tX);
      tempoCursors[tempoIx].setAttributeNS(null, 'x2', tX);
      tempoCursors[tempoIx].setAttributeNS(null, 'y1', tY1);
      tempoCursors[tempoIx].setAttributeNS(null, 'y2', tY2);
      tempoCursors[tempoIx].setAttributeNS(null, 'display', 'yes');

    }); //goFrameCycles_perTempo.forEach((bbYposSet, tempoIx) => END

  } // if (FRAMECOUNT > LEAD_IN_FRAMES) END

} // function updateScrollingCsrs() END


// #endef END updateScrollingCsrs

// #ef Make Player Tokens

let playerTokens = []; //tempo[ player[ {:svg,:text} ] ]

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

//#endef Make Player Tokens

// #ef wipePlayerTokens

function wipePlayerTokens() {

  playerTokens.forEach((thisTemposPlrTokens) => {
    thisTemposPlrTokens.forEach((plrTknObj) => {


      plrTknObj.svg.setAttributeNS(null, 'display', 'none');
      plrTknObj.txt.setAttributeNS(null, 'display', 'none');



    });
  });

}

// #endef END wipePlayerTokens

//#ef Update Player Tokens


function updatePlayerTokens() {

  playerTokenLocationByFrame_perPlr.forEach((playerTokenLocationByFrame, plrIx) => { //{tempoNum}
    if (partsToRun.includes(plrIx)) {

      if (FRAMECOUNT > LEAD_IN_FRAMES) { //No lead in motion for player Tokens


        let setIx = (FRAMECOUNT - LEAD_IN_FRAMES) % playerTokenLocationByFrame.length; //adjust current FRAMECOUNT to account for lead-in and loop this tempo's set of goFrames

        let tTempoNum = playerTokenLocationByFrame[setIx];
        let tPlrTokenObj = playerTokens[tTempoNum][plrIx];
        let coordLookUpIx = (FRAMECOUNT - LEAD_IN_FRAMES) % scrollingCsrCoords_perTempo[tTempoNum].length;
        let tBaseX = scrollingCsrCoords_perTempo[tTempoNum][coordLookUpIx].x;
        let tBaseY = scrollingCsrCoords_perTempo[tTempoNum][coordLookUpIx].y1;

        tPlrTokenObj.move(tBaseX, tBaseY);
        tPlrTokenObj.svg.setAttributeNS(null, "display", 'yes');
        tPlrTokenObj.txt.setAttributeNS(null, "display", 'yes');
        tPlrTokenObj.svg.setAttributeNS(null, "stroke", TEMPO_COLORS[tTempoNum]);


      } // if (FRAMECOUNT > LEAD_IN_FRAMES) END

    } // function updatePlayerTokens() END
  });

}


// #endef END Update Player Tokens

// #ef wipeRhythmicNotation

function wipeRhythmicNotation() {

  motivesByBeat.forEach((thisBeatsMotiveDic) => {

    for (let key in thisBeatsMotiveDic) {

      let tMotive = thisBeatsMotiveDic[key];
      tMotive.setAttributeNS(null, 'display', 'none');

    }

  });

}

// #endef END wipeRhythmicNotation

//#ef Update Notation


function updateNotation() { //FOR UPDATE, HAVE TO HAVE DIFFERENT SIZE LOOP FOR EACH PLAYER

  if (FRAMECOUNT > (LEAD_IN_FRAMES - 1)) {
    let setIx = (FRAMECOUNT - LEAD_IN_FRAMES) % scoreData.motiveSet.length; //adjust current FRAMECOUNT to account for lead-in and loop this tempo's set of goFrames

    scoreData.motiveSet[setIx].forEach((motiveNum, beatNum) => { //a set of objects of flags that are on scene {tempoNum:,zLoc:}

      motivesByBeat[beatNum][motiveDict[motiveNum]].setAttributeNS(null, "display", 'yes');

    }); //   motiveChgByFrameSet[setIx].forEach((motiveNum, beatNum) => END

  } //else if (FRAMECOUNT > (LEAD_IN_FRAMES - 1)) END

} // function updateNotation() END


//#endef Update Notation


// #endef END Rhythmic Notation

// #ef Signs


// #ef Signs Variables

const SIGN_W = TEMPO_FRET_W - 10;
const SIGN_H = 150;
const HALF_SIGN_H = SIGN_H / 2;
let signsByPlrByTrack = [];
const NUM_AVAILABLE_SIGN_MESHES_PER_TRACK = Math.round(NUM_TEMPO_FRETS_TO_FILL / 10);

// #endef END Signs Variables

// #ef makeSigns

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

// #endef END makeSigns

// #ef wipeSigns

function wipeSigns() {

  signsByPlrByTrack.forEach((arrayOfSignsForThisPlayer) => {
    arrayOfSignsForThisPlayer.forEach((arrayOfSignsForOneTrack) => {
      arrayOfSignsForOneTrack.forEach((tSign) => {
        tSign.visible = false;
      });
    });
  });

}

// #endef END wipeSigns

// #ef updateSigns


function updateSigns() { //FOR UPDATE, HAVE TO HAVE DIFFERENT SIZE LOOP FOR EACH PLAYER

  tempoFlagLocsByFrame_perPlr.forEach((tempoFlagLocsByFrame_thisPlr, plrIx) => { //{tempoNum}
    if (partsToRun.includes(plrIx)) {

      //##ef Lead In
      if (FRAMECOUNT < LEAD_IN_FRAMES && FRAMECOUNT >= (LEAD_IN_FRAMES - leadIn_tempoFlagLocsByFrame_perPlr[plrIx].length)) {

        let setIx = leadIn_tempoFlagLocsByFrame_perPlr[plrIx].length - LEAD_IN_FRAMES + FRAMECOUNT;
        if (leadIn_tempoFlagLocsByFrame_perPlr[plrIx][setIx].length > 0) { //if there is a flag on scene,otherwise it will be an empty array

          leadIn_tempoFlagLocsByFrame_perPlr[plrIx][setIx].forEach((signObj, flagIx) => { //a set of objects of flags that are on scene {tempoNum:,zLoc:}

            let tempo_trackNum = signObj.tempoNum;
            let zLoc = signObj.zLoc;
            let tSign = signsByPlrByTrack[plrIx][tempo_trackNum][flagIx]; //3d array- each player has a set of flags for each tempo/track

            tSign.position.z = GO_Z + zLoc;
            tSign.position.x = xPosOfTracks[tempo_trackNum];
            tSign.visible = true;

          }); // tempoFlagLocsByFrame_thisPlr.forEach((setOfSignsThisFrame) => END

        } // if (tempoFlagLocsByFrame_thisPlr[setIx] != -1) END

      } // if (FRAMECOUNT < LEAD_IN_FRAMES && FRAMECOUNT >= leadIn_tempoFlagLocsByFrame_perPlr[plrIx].length) END
      //##endef Lead


      //##ef Loop After Lead In
      else if (FRAMECOUNT > (LEAD_IN_FRAMES - 1)) {
        let setIx = (FRAMECOUNT - LEAD_IN_FRAMES) % tempoFlagLocsByFrame_thisPlr.length; //adjust current FRAMECOUNT to account for lead-in and loop this tempo's set of goFrames

        if (tempoFlagLocsByFrame_thisPlr[setIx].length > 0) { //if there is a flag on scene,otherwise it will be an empty array

          tempoFlagLocsByFrame_thisPlr[setIx].forEach((signObj, flagIx) => { //a set of objects of flags that are on scene {tempoNum:,zLoc:}

            let tempo_trackNum = signObj.tempoNum;
            let zLoc = signObj.zLoc;
            let tSign = signsByPlrByTrack[plrIx][tempo_trackNum][flagIx]; //3d array- each player has a set of flags for each tempo/track

            tSign.position.z = GO_Z + zLoc;
            tSign.position.x = xPosOfTracks[tempo_trackNum];
            tSign.visible = true;

          }); // tempoFlagLocsByFrame_thisPlr.forEach((setOfSignsThisFrame) => END

        } // if (tempoFlagLocsByFrame_thisPlr[setIx] != -1) END
      } //else if (FRAMECOUNT > (LEAD_IN_FRAMES - 1)) END
      //##endef Loop After Lead In





    } // if (partsToRun.includes(plrIx) END

  }); // tempoFlagLocsByFrame_perPlr.forEach((posObjSet, tempoIx) =>  END

} // function updateSigns() END


// #endef END updateSigns


// #endef END Signs

//#ef Unisons



//#ef Make Unison Signs


let unisonSignsByTrack = [];
let unisonOffSignsByTrack = [];

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


//#endef Make Unison Signs

//#ef Make Unison Tokens


let unisonToken;

function makeUnisonToken() {

  unisonToken = mkPlrTkns(rhythmicNotationObj.svgCont, 5);

}


//#endef Make Unison Tokens

//#ef Wipe Unison Signs

function wipeUnisonSigns() {

  unisonSignsByTrack.forEach((arrayOfSignsForOneTrack) => {
    arrayOfSignsForOneTrack.forEach((tSign) => {
      tSign.visible = false;
    });
  });

  unisonOffSignsByTrack.forEach((arrayOfSignsForOneTrack) => {
    arrayOfSignsForOneTrack.forEach((tSign) => {
      tSign.visible = false;
    });
  });

}

//#endef Wipe Unison Signs

//#ef Wipe Unison Tokens

function wipeUnisonToken() {

  unisonToken.svg.setAttributeNS(null, 'display', 'none');
  unisonToken.txt.setAttributeNS(null, 'display', 'none');

}

//#endef Wipe Unison Tokens

//#ef Update Unison Signs

function updateUnisonSigns() { //FOR UPDATE, HAVE TO HAVE DIFFERENT SIZE LOOP FOR EACH PLAYER

  //##ef Lead In
  if (FRAMECOUNT < LEAD_IN_FRAMES && FRAMECOUNT >= (LEAD_IN_FRAMES - leadInSet_unisonFlagLocByFrame.length)) {

    let setIx = leadInSet_unisonFlagLocByFrame.length - LEAD_IN_FRAMES + FRAMECOUNT;
    if (leadInSet_unisonFlagLocByFrame[setIx].length > 0) { //if there is a flag on scene,otherwise it will be an empty array

      leadInSet_unisonFlagLocByFrame[setIx].forEach((signObj, flagIx) => { //a set of objects of flags that are on scene {tempoNum:,zLoc:}

        let tempo_trackNum = signObj.tempoNum;
        let zLoc = signObj.zLoc;

        let tSign;
        if (signObj.end) {
          tSign = unisonOffSignsByTrack[tempo_trackNum][flagIx];
        } else {
          tSign = unisonSignsByTrack[tempo_trackNum][flagIx];
        }

        tSign.position.z = GO_Z + zLoc;
        tSign.position.x = xPosOfTracks[tempo_trackNum];
        tSign.visible = true;

      }); // tempoFlagLocsByFrame_thisPlr.forEach((setOfSignsThisFrame) => END

    } // if (tempoFlagLocsByFrame_thisPlr[setIx] != -1) END

  } // if (FRAMECOUNT < LEAD_IN_FRAMES && FRAMECOUNT >= leadIn_tempoFlagLocsByFrame_perPlr[plrIx].length) END
  //##endef Lead

  //##ef Loop After Lead In
  else if (FRAMECOUNT > (LEAD_IN_FRAMES - 1)) {
    let setIx = (FRAMECOUNT - LEAD_IN_FRAMES) % setOfUnisonFlagLocByFrame.length; //adjust current FRAMECOUNT to account for lead-in and loop this tempo's set of goFrames

    if (setOfUnisonFlagLocByFrame[setIx].length > 0) { //if there is a flag on scene,otherwise it will be an empty array

      setOfUnisonFlagLocByFrame[setIx].forEach((signObj, flagIx) => { //a set of objects of flags that are on scene {tempoNum:,zLoc:}

        let tempo_trackNum = signObj.tempoNum;
        let zLoc = signObj.zLoc;

        let tSign;
        if (signObj.end) {
          tSign = unisonOffSignsByTrack[tempo_trackNum][flagIx];
        } else {
          tSign = unisonSignsByTrack[tempo_trackNum][flagIx];
        }

        tSign.position.z = GO_Z + zLoc;
        tSign.position.x = xPosOfTracks[tempo_trackNum];
        tSign.visible = true;

      }); // tempoFlagLocsByFrame_thisPlr.forEach((setOfSignsThisFrame) => END

    } // if (tempoFlagLocsByFrame_thisPlr[setIx] != -1) END
  } //else if (FRAMECOUNT > (LEAD_IN_FRAMES - 1)) END
  //##endef Loop After Lead In

} // function updateUnisonSigns() END

//#endef Update Unison Signs

//#ef Update Unison Tokens



function updateUnisonPlayerToken() {

  if (FRAMECOUNT > LEAD_IN_FRAMES) { //No lead in motion for player Tokens

    let setIx = (FRAMECOUNT - LEAD_IN_FRAMES) % unisonPlrTokenLocByFrame.length;

    if (unisonPlrTokenLocByFrame[setIx] != -1) {
      let tTempoNum = unisonPlrTokenLocByFrame[setIx];
      let coordLookUpIx = (FRAMECOUNT - LEAD_IN_FRAMES) % scrollingCsrCoords_perTempo[tTempoNum].length;
      let tBaseX = scrollingCsrCoords_perTempo[tTempoNum][coordLookUpIx].x;
      let tBaseY = scrollingCsrCoords_perTempo[tTempoNum][coordLookUpIx].y1;

      unisonToken.move(tBaseX, tBaseY);
      unisonToken.svg.setAttributeNS(null, "display", 'yes');
      unisonToken.txt.setAttributeNS(null, "display", 'yes');
      unisonToken.svg.setAttributeNS(null, "fill", TEMPO_COLORS[tTempoNum]);
      unisonToken.svg.setAttributeNS(null, "stroke", TEMPO_COLORS[tTempoNum]);

    }


  } // if (FRAMECOUNT > LEAD_IN_FRAMES) END


}


//#endef Update Unison Tokens


//#endef Unisons

// #ef Pitch Sets

// #ef Pitch Sets Variables

pitchSetsObj = {};
pitchSetsObj['svgs'] = {};
pitchSetImgObjects = {};
let PITCH_SETS_W = 120;
let PITCH_SETS_H = 80;
let PITCH_SETS_TOP = BB_TOP + BB_H - PITCH_SETS_H;
let PITCH_SETS_LEFT = RHYTHMIC_NOTATION_CANVAS_L;
let PITCH_SETS_CENTER_W = PITCH_SETS_W / 2;
let PITCH_SETS_MIDDLE_H = PITCH_SETS_H / 2;

// #ef pitchSetSvgs_path_lbl

let pitchSetsPath = "/pieces/sf004/notationSVGs/pitchSets/";

let pitchSetSvgs_path_lbl = [{
    path: pitchSetsPath + 'e4_e5.svg',
    lbl: 'e4_e5'
  },
  {
    path: pitchSetsPath + 'e4_e5_b4.svg',
    lbl: 'e4_e5_b4'
  },
  {
    path: pitchSetsPath + 'e4_e5_b4cluster.svg',
    lbl: 'e4_e5_b4cluster'
  },
  {
    path: pitchSetsPath + 'e4cluster_e5cluster_b4cluster.svg',
    lbl: 'e4cluster_e5cluster_b4cluster'
  }
];

// #endef END pitchSetSvgs_path_lbl

// #endef END Pitch Sets Variables

function makePitchSets() {

  // #ef DIV/SVG Container

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

  // #endef END DIV/SVG Container

  // #ef Make Pitch Set SVGs

  function makePitchSetSvgs() { // This function runs in loop below, after await so all image sizes are loaded

    pitchSetSvgs_path_lbl.forEach((pathLblObj) => { //each motive loop

      let tLbl = pathLblObj.lbl;
      let tx = PITCH_SETS_CENTER_W - (pitchSetImgObjects[tLbl].width / 2);
      let ty = PITCH_SETS_MIDDLE_H - (pitchSetImgObjects[tLbl].height / 2);

      let tDisplay = tLbl == 'e4_e5' ? 'yes' : 'none';
      // let tDisplay = tLbl == 'e4cluster_e5cluster_b4cluster' ? 'yes' : 'none';

      // Create HTML SVG image
      let tSvgImage = document.createElementNS(SVG_NS, "image");
      tSvgImage.setAttributeNS(XLINK_NS, 'xlink:href', pathLblObj.path);
      tSvgImage.setAttributeNS(null, "x", tx);
      tSvgImage.setAttributeNS(null, "y", ty);
      tSvgImage.setAttributeNS(null, "visibility", 'visible');
      tSvgImage.setAttributeNS(null, "display", tDisplay);
      pitchSetsObj.svgCont.appendChild(tSvgImage);

      pitchSetsObj.svgs[tLbl] = tSvgImage;

    }); // pitchSetSvgs_path_lbl.forEach((pathLblObj) =>  END

  } //function makePitchSetSvgs() END


  // MAIN LOOP HERE: Load Notation SVGs to get image height/width for positioning
  pitchSetSvgs_path_lbl.forEach((pathLblObj, i) => {

    let tPath = pathLblObj.path;

    (async () => { //generic async wrapper to avoid error

      let tImg = await run_getImage(tPath); // Runs wrapper which runs getImage everything below this await waits for response
      pitchSetImgObjects[pathLblObj.lbl] = tImg;

      if (i == (pitchSetSvgs_path_lbl.length - 1)) { // only run make function after last image is loaded
        makePitchSetSvgs();
      }

    })();

  }); // pitchSetSvgs_path_lbl.forEach((pathLblObj, i) => END

  // #endef END Make Pitch Set SVGs

  // #ef Pitch Set Change Indicator

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

  // #endef END Pitch Set Change Indicator

}

// #ef wipePitchSets

function wipePitchSets() {

  pitchSetsObj.chgIndicator.setAttributeNS(null, 'display', 'none');

  let tSvgsSet = pitchSetsObj['svgs'];

  for (let key in tSvgsSet) {

    let tPsSvg = tSvgsSet[key];
    tPsSvg.setAttributeNS(null, 'display', 'none');

  }

}

// #endef END wipePitchSets

// #endef END Pitch Sets

// #ef Articulations

// #ef Articulations Variables

let articulationsPath = "/pieces/sf004/notationSVGs/dynamics_accents/";

let articulationsObj = {
  marcato: {
    path: articulationsPath + 'marcato.svg',
    amt: (TOTAL_NUM_BEATS * 5)
  },
  sf: {
    path: articulationsPath + 'sf.svg',
    amt: TOTAL_NUM_BEATS
  }
};

// #ef function posMarcato

function posMarcato(beatNum, subdivision, partial) {

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

} // function posMarcato(beatNum, subdivision, partial) end

// #endef END function posMarcato

// #endef END Articulations Variables

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
      tArt.setAttributeNS(null, "x", beatCoords[0].x);
      tArt.setAttributeNS(null, "y", beatCoords[0].y + 2);
      tArt.setAttributeNS(null, "visibility", 'visible');
      tArt.setAttributeNS(null, "display", 'none');
      rhythmicNotationObj.svgCont.appendChild(tArt);

      tArtSet.push(tArt);

    } // for (let artIx = 0; artIx < tAmt; artIx++) END

    articulationsObj[key]['imgSet'] = tArtSet;

  } // for (let key in articulationsObj) END

} // makeArticulations() END

// #ef wipeArticulations

function wipeArticulations() {

  for (let key in articulationsObj) {

    let artImgSet = articulationsObj[key];

    artImgSet.imgSet.forEach((tSvg) => {

      tSvg.setAttributeNS(null, 'display', 'none');

    });

  }

}

// #endef END wipeArticulations

// #endef END Articulations


// #endef END WORLD

// #ef ANIMATION

//#ef Animation Engine

// #ef Animation Engine Variables

let cumulativeChangeBtwnFrames_MS = 0;
let lastFrame_epoch;
let animationEngineIsRunning = false;

// #endef END Animation Engine Variables

//#ef Animation Engine

function animationEngine(timestamp) {

  let ts_Date = new Date(TS.now());
  let ts_now_epoch = ts_Date.getTime();
  cumulativeChangeBtwnFrames_MS += ts_now_epoch - lastFrame_epoch;
  lastFrame_epoch = ts_now_epoch;

  while (cumulativeChangeBtwnFrames_MS >= MS_PER_FRAME) {

    pieceClock(ts_now_epoch);
    wipe();
    update();
    draw();

    cumulativeChangeBtwnFrames_MS -= MS_PER_FRAME;

  } // while (cumulativeChangeBtwnFrames_MS >= MS_PER_FRAME) END

  if (animationEngineIsRunning) requestAnimationFrame(animationEngine);

} // function animationEngine(timestamp) END

//#endef Animation Engine END

//#ef Piece Clock

function pieceClock(nowEpochTime) {

  PIECE_TIME_MS = nowEpochTime - startTime_epoch - LEAD_IN_TIME_MS;
  FRAMECOUNT++;

}

//#endef Piece Clock

// #ef Wipe
function wipe() {

  wipeTempoFrets();
  wipeGoFrets();
  wipeSigns();
  wipeBbComplex();
  wipePitchSets();
  wipeRhythmicNotation();
  wipeTempoCsrs();
  wipePlayerTokens();
  wipeArticulations();
  wipeUnisonSigns();
  wipeUnisonToken();

} // function wipe() END

// #endef END Wipe

//#ef Update

function update() {

  updateTempoFrets();
  updateGoFrets();
  updateBBs();
  updateBbBouncePad();
  updateScrollingCsrs();
  updateSigns();
  updatePlayerTokens();
  updateUnisonSigns();
  updateUnisonPlayerToken();
  updateNotation();

}

//#endef update END

//#ef Draw

function draw() {
  RENDERER.render(SCENE, CAMERA);
}

//#endef Draw END

//#endef Animation Engine END

// #ef markStartTime_startAnimation

let startTime_epoch = 0;

// Broadcast Start Time when Start Button is pressed
let markStartTime_startAnimation = function() {

  let ts_Date = new Date(TS.now());
  let t_startTime_epoch = ts_Date.getTime();
  // Send start time to server to broadcast to rest of players
  SOCKET.emit('sf004_newStartTimeBroadcast_toServer', {
    pieceId: PIECE_ID,
    startTime_epoch: t_startTime_epoch
  });

} // let markStartTime = function() END

// Receive new start time from server broadcast and set startTime_epoch
SOCKET.on('sf004_newStartTime_fromServer', function(data) {

  if (data.pieceId == PIECE_ID) {
    startTime_epoch = data.startTime_epoch;
    lastFrame_epoch = data.startTime_epoch;
    animationEngineIsRunning = true;
    requestAnimationFrame(animationEngine);

  }

}); // SOCKET.on('sf004_newStartTime_fromServer', function(data) END

// #endef END markStartTime_startAnimation

//#endef ANIMATION

// #ef PANELS


// #ef SCORE DATA MANAGER

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
    }
  });

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

  //#endef END Load Score Data from Server Button


  scoreDataManagerPanel.smallify();

}

// #endef END SCORE DATA MANAGER

// #ef Control Panel

// #ef Control Panel Vars

const CTRLPANEL_W = 89;
const CTRLPANEL_H = 200;
const CTRLPANEL_BTN_W = 60;
const CTRLPANEL_BTN_H = 35;
const CTRLPANEL_BTN_L = (CTRLPANEL_W / 2) - (CTRLPANEL_BTN_W / 2);
const CTRLPANEL_MARGIN = 7;

// #endef END Control Panel Vars


function makeControlPanel() {

  // #ef Control Panel Panel

  let controlPanelPanel = mkPanel({
    w: CTRLPANEL_W,
    h: CTRLPANEL_H,
    title: 'sf004 Control Panel',
    ipos: 'left-top',
    offsetX: '0px',
    offsetY: '0px',
    autopos: 'none',
    headerSize: 'xs',
    onwindowresize: true,
    contentOverflow: 'hidden',
    clr: 'black'
  });

  // #endef END Control Panel Panel

  // #ef Start Piece Button

  let startButton = mkButton({
    canvas: controlPanelPanel.content,
    w: CTRLPANEL_BTN_W,
    h: CTRLPANEL_BTN_H,
    top: CTRLPANEL_MARGIN,
    left: CTRLPANEL_MARGIN,
    label: 'Start',
    fontSize: 16,
    action: function() {
      markStartTime_startAnimation();
    }
  });

  // #endef END Start Piece Button

} // function makeControlPanel() END

// #endef END Control Panel


// #endef PANELS
