let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let turnMsg = document.querySelector("#turn-msg");

let turnX = true; // Player 1 = X, Player 2 = O
let count = 0;
let gameOver = false;

const winPatterns = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8],
];

// Show turn
const updateTurn = () => {
  if (gameOver) return;
  turnMsg.innerText = turnX
    ? "Player 1 (X) Turn"
    : "Player 2 (O) Turn";
};

// Reset Game
const resetGame = () => {
  turnX = true;
  count = 0;
  gameOver = false;
  enableBoxes();
  msgContainer.classList.add("hide");
  updateTurn();
};

// Box Click
boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (gameOver || box.innerText !== "") return;

    box.innerText = turnX ? "X" : "O";
    box.disabled = true;
    count++;

    checkWinner();

    turnX = !turnX;
    updateTurn();

    if (count === 9 && !gameOver) {
      gameDraw();
    }
  });
});

// Winner
const showWinner = (winner) => {
  msg.innerText = `🎉 Player ${winner === "X" ? "1 (X)" : "2 (O)"} Wins!`;
  msgContainer.classList.remove("hide");
  disableBoxes();
  gameOver = true;
};

// Draw
const gameDraw = () => {
  msg.innerText = "🤝 Game Draw!";
  msgContainer.classList.remove("hide");
  gameOver = true;
};

// Check Winner
const checkWinner = () => {
  for (let pattern of winPatterns) {
    let [a, b, c] = pattern;

    let v1 = boxes[a].innerText;
    let v2 = boxes[b].innerText;
    let v3 = boxes[c].innerText;

    if (v1 && v1 === v2 && v2 === v3) {
      showWinner(v1);
      return;
    }
  }
};

// Disable
const disableBoxes = () => {
  boxes.forEach((box) => (box.disabled = true));
};

// Enable
const enableBoxes = () => {
  boxes.forEach((box) => {
    box.disabled = false;
    box.innerText = "";
  });
};

// Buttons
newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);