const vh = window.innerHeight;
const vw = window.innerWidth;
// const vh = 50;
// const vw = 50;

const imageDataArray = () => new Uint8ClampedArray(vw * vh * 4);

const emptyState = () => {
  const columns = new Array(vw).fill(0);
  return columns.map(() => new Array(vh));
};

const startState = emptyState();

const basicGlider = `
 X 
  X
XXX
`;
const basicGliderInverted = `
XXX
X  
 X 
`;

function transposeArray(array){
  return array[0].map(function(col, i){
    return array.map(function(row){
        return row[i];
    });
  });
}

function textLifeToArrayLife(textLife) {
  return transposeArray(
    textLife
      .slice(1, -1)
      .split('\n')
      .map(str => str
        .split('')
        .map(c => c === 'X' ? 1 : 0)
      )
    );
}

function putTextLifeIntoStateAtLocation(state, textLife, x, y) {
  const arrayLife = textLifeToArrayLife(textLife);
  if (x+arrayLife.length >= vw || y+arrayLife[0].length >= vh) { return false; }
  
  arrayLife.forEach((column, xIndex) => 
    column.forEach((pixel, yIndex) => 
      state[x+xIndex][y+yIndex] = pixel
    )
  );
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function unlikelyLife(prob = 0.15) {
  return getRandomInt(100) < (prob * 100) ? 1 : 0;
}

function same(stateA, stateB) {
  for (let y = 0; y < vh; y++) {
    for (let x = 0; x < vw; x++) {
      if (stateA[x][y] !== stateB[x][y]) {
        return false;
      }
    }
  }
  return true;
}

function shouldBeAliveNextTick(currentState, x, y) {
  const n = numberOfLiveNeighbors(currentState, x, y);
  if (n === 3 || (currentState[x][y] === 1 && n === 2)) {
    return true;
  } else {
    return false;
  }
}

function waa(arr, index) { // wrappedArrayAccess
  if (index < 0) {
    return arr[arr.length + index];
  } else if (index >= arr.length) {
    return arr[index - arr.length];
  } else {
    return arr[index];
  }
}

function numberOfLiveNeighbors(currentState, x, y) {
  let n = 0;
  n += waa(waa(currentState, x-1), y-1);
  n += waa(waa(currentState, x  ), y-1);
  n += waa(waa(currentState, x+1), y-1);
  n += waa(waa(currentState, x-1), y  );
  n += waa(waa(currentState, x+1), y  );
  n += waa(waa(currentState, x-1), y+1);
  n += waa(waa(currentState, x  ), y+1);
  n += waa(waa(currentState, x+1), y+1);
  return n;
}

function nextStateAndPixels(currentState) {
  const pixels = imageDataArray();
  const nextState = emptyState();
  let i = 0;
  for (let y = 0; y < vh; y++) {
    for (let x = 0; x < vw; x++) {
      const alive = shouldBeAliveNextTick(currentState, x, y);
      nextState[x][y] = +alive;
      for (let j = 0; j < 3; j++) {
        pixels[i+j] = 255 - 255 * alive;
      }
      pixels[i+3] = 255;
      i += 4;
    }
  }
  return {
    nextState,
    imageData: new ImageData(pixels, vw, vh),
  };
}

function step(ctx, currentState, n) {
  // console.log(
  //   transposeArray(currentState).map(row => row.join("")).join("\n")
  // );
  const { nextState, imageData} = nextStateAndPixels(currentState);
  ctx.clearRect(0, 0, vw, vh);
  ctx.putImageData(imageData, 0, 0);
  if (!same(nextState, currentState)) {
    console.log('new generation');
    window.requestAnimationFrame(() => step(ctx, nextState, n+1));
  }
}

async function main() {
  const gameCanvas = document.getElementById('game-canvas');
  gameCanvas.height = vh;
  gameCanvas.width = vw;
  fixBlur(gameCanvas);
  const ctx = gameCanvas.getContext('2d');

  for (let y = 0; y < vh; y++) {
    for (let x = 0; x < vw; x++) {
      startState[x][y] = unlikelyLife(0.80);
    }
  }

  // putTextLifeIntoStateAtLocation(startState, basicGliderInverted, 10, 10);
  // console.log(numberOfLiveNeighbors(startState, 2, 2));

  window.requestAnimationFrame(() => step(ctx, startState, 2));
}

function fixBlur(canvas) {
  //get DPI
  const dpi = window.devicePixelRatio;
  //get CSS height
  //the + prefix casts it to an integer
  //the slice method gets rid of "px"
  const style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
  //get CSS width
  const style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
  //scale the canvas
  canvas.setAttribute('height', style_height * dpi);
  canvas.setAttribute('width', style_width * dpi);
}

window.addEventListener('DOMContentLoaded', main);
