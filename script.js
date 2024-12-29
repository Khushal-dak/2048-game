// DOM Elements
const grid = document.getElementById('game-grid');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const timerElement = document.getElementById('timer');
const movesElement = document.getElementById('moves');
const targetScoreElement = document.getElementById('target-score');
const pauseButton = document.getElementById('pause-btn');
const resumeButton = document.getElementById('resume-btn');
const popupOverlay = document.getElementById('popup-overlay');
const levelPopup = document.getElementById('level-popup');

let score = 0;
let level = 1;
let timer = 30;
let moves = Infinity;
let isPaused = false;
let gridArray = Array(4).fill(null).map(() => Array(4).fill(0));
let timerInterval;

const levels = [
  { scoreTarget: 300, time: 30, moves: Infinity },
  { scoreTarget: 500, time: 40, moves: Infinity },
  { scoreTarget: 700, time: 50, moves: 50 },
  { scoreTarget: 1000, time: 45, moves: 40 },
  { scoreTarget: 2000, time: 30, moves: 10 }
];

// Initialize Grid
function initializeGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const block = document.createElement('div');
      block.classList.add('block');
      block.dataset.row = i;
      block.dataset.col = j;
      grid.appendChild(block);
    }
  }
  spawnBlock();
  spawnBlock();
  updateGrid();
  startTimer();
}

// Spawn a New Block
function spawnBlock() {
  let emptyCells = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (gridArray[i][j] === 0) emptyCells.push({ row: i, col: j });
    }
  }

  if (emptyCells.length > 0) {
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    gridArray[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
  }
}

// Update the Grid Display
function updateGrid() {
  document.querySelectorAll('.block').forEach(block => {
    const row = block.dataset.row;
    const col = block.dataset.col;
    const value = gridArray[row][col];
    block.textContent = value === 0 ? '' : value;
    block.className = 'block';
    if (value > 0) block.classList.add(`value-${value}`);
  });

  const currentLevel = levels[level - 1];
  targetScoreElement.textContent = currentLevel.scoreTarget;
  checkGameOver();
}

// Check if the Game is Over
function checkGameOver() {
  const currentLevel = levels[level - 1];
  if ((moves === 0 || timer === 0) && score < currentLevel.scoreTarget) {
    alert("Game Over! You did not reach the target score.");
    resetLevel();
  }
}

// Start the Timer
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isPaused && timer > 0) {
      timer--;
      timerElement.textContent = timer;
    } else if (timer === 0 || moves === 0) {
      clearInterval(timerInterval);
      checkGameOver();
    }
  }, 1000);
}

// Update the Score
function updateScore(newScore) {
  score += newScore;
  scoreElement.textContent = score;
}

// Check Level Completion
function checkLevelCompletion() {
  const currentLevel = levels[level - 1];
  if (score >= currentLevel.scoreTarget) {
    showLevelCompletionPopup();
  }
}

// Show Level Completion Popup
function showLevelCompletionPopup() {
  popupOverlay.style.display = 'block';
  levelPopup.style.display = 'block';
  setTimeout(() => {
    levelPopup.classList.add('show');
  }, 500);
}

// Go to the Next Level
function nextLevel() {
  level++;
  if (level > levels.length) {
    alert('You have completed all levels!');
    return;
  } else {
    const nextLevel = levels[level - 1];
    timer = nextLevel.time;
    moves = nextLevel.moves;
    timerElement.textContent = timer;
    movesElement.textContent = moves === Infinity ? 'Unlimited' : moves;
    levelElement.textContent = level;
    initializeGrid();
    popupOverlay.style.display = 'none';
    levelPopup.style.display = 'none';
  }
}

// Reset the Level
function resetLevel() {
  level = 1;
  score = 0;
  moves = Infinity;
  timer = 30;
  levelElement.textContent = level;
  scoreElement.textContent = score;
  movesElement.textContent = moves === Infinity ? 'Unlimited' : moves;
  timerElement.textContent = timer;
  initializeGrid();
}

// Pause and Resume Game
pauseButton.addEventListener('click', () => {
  isPaused = true;
  pauseButton.disabled = true;
  resumeButton.disabled = false;
  clearInterval(timerInterval);
});

resumeButton.addEventListener('click', () => {
  isPaused = false;
  pauseButton.disabled = false;
  resumeButton.disabled = true;
  startTimer();
});

// Handle Grid Movement
function move(direction) {
  if (isPaused) return;

  let moved = false;
  let newGrid = gridArray.map(arr => arr.slice());

  switch (direction) {
    case 'up':
      for (let col = 0; col < 4; col++) {
        let stack = [];
        for (let row = 0; row < 4; row++) {
          if (gridArray[row][col] !== 0) stack.push(gridArray[row][col]);
        }
        stack = merge(stack);
        for (let row = 0; row < 4; row++) {
          newGrid[row][col] = stack[row] || 0;
        }
      }
      break;
    case 'down':
      for (let col = 0; col < 4; col++) {
        let stack = [];
        for (let row = 3; row >= 0; row--) {
          if (gridArray[row][col] !== 0) stack.push(gridArray[row][col]);
        }
        stack = merge(stack);
        for (let row = 3; row >= 0; row--) {
          newGrid[row][col] = stack[3 - row] || 0;
        }
      }
      break;
    case 'left':
      for (let row = 0; row < 4; row++) {
        let stack = [];
        for (let col = 0; col < 4; col++) {
          if (gridArray[row][col] !== 0) stack.push(gridArray[row][col]);
        }
        stack = merge(stack);
        for (let col = 0; col < 4; col++) {
          newGrid[row][col] = stack[col] || 0;
        }
      }
      break;
    case 'right':
      for (let row = 0; row < 4; row++) {
        let stack = [];
        for (let col = 3; col >= 0; col--) {
          if (gridArray[row][col] !== 0) stack.push(gridArray[row][col]);
        }
        stack = merge(stack);
        for (let col = 3; col >= 0; col--) {
          newGrid[row][col] = stack[3 - col] || 0;
        }
      }
      break;
  }

  if (!isEqual(gridArray, newGrid)) {
    gridArray = newGrid;
    spawnBlock();
    updateGrid();
    checkLevelCompletion();
  }
}

// Merge Stack Logic
function merge(stack) {
  let result = [];
  for (let i = 0; i < stack.length; i++) {
    if (stack[i] === stack[i + 1]) {
      const mergedValue = stack[i] * 2;
      result.push(mergedValue);
      updateScore(mergedValue);
      i++;
    } else {
      result.push(stack[i]);
    }
  }
  return result;
}

// Check if Two Grids are Equal
function isEqual(arr1, arr2) {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

// Event Listeners for Key Presses
window.addEventListener('keydown', e => {
  if (isPaused) return;
  switch (e.key) {
    case 'ArrowUp':
      move('up');
      break;
    case 'ArrowDown':
      move('down');
      break;
    case 'ArrowLeft':
      move('left');
      break;
    case 'ArrowRight':
      move('right');
      break;
  }
});

// Initialize the Game
initializeGrid();
