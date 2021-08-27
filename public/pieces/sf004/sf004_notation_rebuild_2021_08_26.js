//#ef GLOBAL VARIABLES


let scoreData;
let NUM_TEMPOS = 5;
let TOTAL_NUM_BEATS = 16;

//#ef Timing
const FRAMERATE = 60;
//#endef Timing


//#endef GLOBAL VARIABLES

//#ef INIT


function init() {

  scoreData = generateScoreData();
  console.log(scoreData);

} // function init() END


//#endef INIT

//#ef GENERATE SCORE DATA


//##ef GENERATE SCORE DATA - VARIABLES
//##endef GENERATE SCORE DATA - VARIABLES

function generateScoreData() {


  let scoreDataObject = {};
  scoreDataObject['tempos'] = [];
  scoreDataObject['tempoFretsLoopLengthInFrames_perTempo'] = [];
  scoreDataObject['goFrames_perTempo'] = [];

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


    let framesPerBeat = FRAMERATE / (tempo / 60);
    let beatsPerHour = (tempo * 60);
    // make about an hours worth of beats divisible by 16 for scrolling cursor coordination
    let beatsPerCycle = Math.floor(beatsPerHour / TOTAL_NUM_BEATS);
    while ((beatsPerCycle % TOTAL_NUM_BEATS) != 0) {
      beatsPerCycle++;
      if (beatsPerCycle > 9999) break;
    }

    let goFrames_thisTempo = [];
    for (var beatIx = 0; beatIx < beatsPerCycle; beatIx++) {
      goFrames_thisTempo.push(Math.round(framesPerBeat * beatIx));
    }

    // CALCULATE LENGTH OF LOOP FOR THIS TEMPO IN FRAMES
    // The end of the loop will be the the last go frame in this cycle
    let tempoFretsLoopLengthInFrames_thisTempo = goFrames_thisTempo[goFrames_thisTempo.length - 1];
    scoreDataObject.tempoFretsLoopLengthInFrames_perTempo.push(tempoFretsLoopLengthInFrames_thisTempo); //store in object variable
    // Remove last frame to assure accurate loop; last frame should be a go frame, this makes 0 of the next cycle the actual next go frame
    goFrames_thisTempo.pop();

    scoreDataObject.goFrames_perTempo.push(goFrames_thisTempo);


    //##endef Calculate Loop Length & Go Frames

    //##ef Calculate Go Fret Locations Per Frame




    //##ef Calculate Go Fret Locations Per Frame


  }); // scoreDataObject.tempos.forEach((tempo) => { // CALCULATE FOR EACH TEMPO END


  return scoreDataObject;
} // function generateScoreData() END


//#endef GENERATE SCORE DATA
