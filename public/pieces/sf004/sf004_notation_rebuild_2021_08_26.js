//#ef GLOBAL VARIABLES


let scoreData;
let NUM_TEMPOS = 5;

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


//##ef VARIABLES - Generate Score Data





//##endef VARIABLES - Generate Score Data

function generateScoreData() {

  let scrDatOb = {};

  //##ef Generate Tempos

  scrDatOb['tempos'] = [];

  // Generate 5 Tempos
  let baseTempo = choose([85, 91, 77]);
  let tempoRangeVarianceMin = 0.0045;
  let tempoRangeVarianceMax = 0.007;

  let tTempo = baseTempo;
  for (let tempoIx = 0; tempoIx < NUM_TEMPOS; tempoIx++) {
    tTempo += rrand(tempoRangeVarianceMin, tempoRangeVarianceMax) * tTempo;
    scrDatOb.tempos.push(tTempo);
  }

  //##endef Generate Tempos

  //##ef Tempo Frets

  scrDatOb.tempos.forEach((tempo) => {

    let framesPerBeat = (tempo / 60) * FRAMERATE;
    //make about an hours worth divisible by 16 for scrolling cursor coordination
    tempo*60
    //escape while
  }); // scrDatOb.tempos.forEach((tempo) => END



  //##endef Tempo Frets


  return scrDatOb;
} // function generateScoreData() END


//#endef GENERATE SCORE DATA
