const vh = window.innerHeight;
const vw = window.innerWidth;

const imageDataArray = () => new Uint8ClampedArray(vw * vh * 4);

const emptyState = () => {
  const columns = new Array(vw).fill(0);
  return columns.map(() => new Array(vh));
};

const startState = emptyState();

for (let y = 0; y < vh; y++) {
  for (let x = 0; x < vw; x++) {
    startState[x][y] = unlikelyLife();
  }
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

function numberOfLiveNeighbors(currentState, x, y) {
  let n = 0;
  if (x > 0) {
    n += currentState[x-1][y];
    if (y > 0) {
      n += currentState[x-1][y-1];
    }
    if (y < vh-1) {
      n += currentState[x-1][y+1];
    }
  }
  if (x < vw-1) {
    n += currentState[x+1][y];
    if (y > 0) {
      n += currentState[x+1][y-1];
    }
    if (y < vh-1) {
      n += currentState[x+1][y+1];
    }
  }
  if (y > 0) {
    n += currentState[x][y-1];
  }
  if (y < vh-1) {
    n += currentState[x][y+1];
  }
  return n;
}

function nextStateAndPixels(currentState) {
  const pixels = imageDataArray();
  const nextState = emptyState();
  let i = 0;
  for (let y = 0; y < vh; y++) {
    for (let x = 0; x < vw; x++) {
      const alive = shouldBeAliveNextTick(currentState, x, y);
      nextState[x][y] = alive;
      for (let j = 0; j < 3; j++) {
        pixels[i+j] = 255 * alive;
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

function step(ctx, currentState) {
  const { nextState, imageData} = nextStateAndPixels(currentState);
  ctx.clearRect(0, 0, vw, vh);
  ctx.putImageData(imageData, 0, 0);
  if (!same(nextState, currentState)) {
    console.log('new generation');
    window.requestAnimationFrame(() => step(ctx, nextState));
  }
}

async function main() {
  const gameCanvas = document.getElementById('game-canvas');
  gameCanvas.height = vh;
  gameCanvas.width = vw;
  const ctx = gameCanvas.getContext('2d');
  window.requestAnimationFrame(() => step(ctx, startState));
}

window.addEventListener('DOMContentLoaded', main);
