// <editor-fold> Global Vars
let partsToRun = [];
let pieceId;
// </editor-fold> END Global Vars

// <editor-fold> Init
let init = function() {
  // Extract URL Args
  let urlArgs = getUrlArgs();
  pieceId = urlArgs.id; //pieceId
  let partsToRunStrArray = urlArgs.parts.split(';');
  partsToRunStrArray.forEach((partNumAsStr) => {
    partsToRun.push(parseInt(partNumAsStr)); //partsToRun
  });
}
// </editor-fold> END Init





// <editor-fold>
// </editor-fold> END
