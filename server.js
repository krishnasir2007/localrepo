const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ballRadius = 8;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 3;
let dy = -3;
let speedMultiplier = 1;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

const brickRowCount = 8;
const brickColumnCount = 12;
const brickWidth = 50;
const brickHeight = 20;
const brickPadding = 8;
const brickOffsetTop = 30;
const brickOffsetLeft = 20;

let rightPressed = false;
let leftPressed = false;
let score = 0;
let isRunning = false;
let gameOver = false;
let timeElapsed = 0;
let timerInterval;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) paddleX = relativeX - paddleWidth / 2;
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score++;
          document.getElementById("score").textContent = score;
          if (score === brickRowCount * brickColumnCount) showGameOver("🎉 YOU WIN! 🎉");
        }
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0ff";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0f0";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#ffa600";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function draw() {
  if (!isRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
    else showGameOver("💥 GAME OVER 💥");
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  x += dx * speedMultiplier;
  y += dy * speedMultiplier;

  requestAnimationFrame(draw);
}

function showGameOver(text) {
  isRunning = false;
  gameOver = true;
  clearInterval(timerInterval);
  const msg = document.getElementById("gameOverText");
  msg.textContent = text;
  msg.style.visibility = "visible";
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeElapsed++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById("timer").textContent = formatted;
}

const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", () => {
  if (!isRunning && !gameOver) {
    isRunning = true;
    startTimer();
    draw();
    startBtn.textContent = "Restart";
  } else {
    document.location.reload();
  }
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  if (isRunning) {
    isRunning = false;
    stopTimer();
  } else if (!gameOver) {
    isRunning = true;
    startTimer();
    draw();
  }
});

const speedControl = document.getElementById("speedControl");
const speedValue = document.getElementById("speedValue");
speedControl.addEventListener("input", (e) => {
  speedMultiplier = e.target.value / 3;
  speedValue.textContent = e.target.value;
});
