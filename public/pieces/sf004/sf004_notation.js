//<editor-fold> << GLOBAL VARIABLES >> ------------------------------------- //
//<editor-fold>  < GLOBAL VARS - TIMING >                //
const FRAMERATE = 60.0;
const MSPERFRAME = Math.round(1000.0 / FRAMERATE);
let frameCount = 0;
let lastFrame_epochTime = 0;
let pieceClock0_epochTime = 0;
let pieceLeadInDur_MS = 8000;
let cumulativeChangeBtwnFrames_MS = 0;
//<editor-fold> FUNCTION: startPiece() -------- >
function startPiece() {
  // To start the animation engine:
  // 1) Get the current epochTime from timeSync
  // 2) Initialize the lastFrame time as current epochTime
  // 3) Set the epochTime-stamp of what is concidered 0 on the piece clock
  //// -> This will be the now_epochTime + the duration of lead-in time
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
//<editor-fold>  < GLOBAL VARS - TIMESYNC ENGINE >       //
const TS = timesync.create({
  server: '/timesync',
  interval: 1000
});
//</editor-fold> > END GLOBAL VARS - TIMESYNC ENGINE END
//</editor-fold> >> END GLOBAL VARIABLES END  /////////////////////////////////

//<editor-fold> << START UP >> --------------------------------------------- //
function init() {
  startPiece();
}
//</editor-fold> >> END START UP END //////////////////////////////////////////

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
  console.log(cumulativeChangeBtwnFrames_MS);
  // Update lastFrame_epochTime with current timestamp for next cycle
  lastFrame_epochTime = ts_now_epochTime;
  // For as many times as the cumulativeChangeBtwnFrames_MS is >= the framerate
  while (cumulativeChangeBtwnFrames_MS >= MSPERFRAME) {
    // Run the animationEngine 1 frame
    update(MSPERFRAME, ts_now_epochTime);
    draw();
    // Continue advancing the animationEngine frame-by-frame until the cumulativeChangeBtwnFrames_MS is < the framerate
    cumulativeChangeBtwnFrames_MS -= MSPERFRAME;
    // Any remainder is carried over to the next cycle, guaranteeing a fixed framerate
  }
  if (animation_isGo) requestAnimationFrame(animationEngine); // gate for use with pause
}
//</editor-fold> END ANIMATION ENGINE - ENGINE             END
//<editor-fold>     < ANIMATION ENGINE - UPDATE >           //
function update(a_MSPERFRAME, ts_now_epochTime) {
  frameCount++;
}
//</editor-fold> END ANIMATION ENGINE - UPDATE             END
//<editor-fold>     < ANIMATION ENGINE - DRAW >             //
function draw() {}
//</editor-fold> END ANIMATION ENGINE - DRAW               END
//</editor-fold>  > END ANIMATION ENGINE  /////////////////////////////////////









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
