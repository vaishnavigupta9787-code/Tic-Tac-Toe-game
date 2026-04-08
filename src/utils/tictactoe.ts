export type Player = "X" | "O";
export type CellValue = Player | null;

const winningCombos: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function calculateWinner(board: CellValue[]) {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: combo };
    }
  }

  return { winner: null, line: null as number[] | null };
}

export function isDraw(board: CellValue[]) {
  return board.every((cell) => cell !== null);
}

function getAvailableMoves(board: CellValue[]) {
  return board
    .map((value, index) => (value === null ? index : null))
    .filter((value): value is number => value !== null);
}

function minimax(
  board: CellValue[],
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player
) {
  const result = calculateWinner(board);
  if (result.winner === aiPlayer) return 10 - depth;
  if (result.winner === humanPlayer) return depth - 10;
  if (isDraw(board)) return 0;

  const moves = getAvailableMoves(board);
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of moves) {
      const next = [...board];
      next[move] = aiPlayer;
      const score = minimax(next, depth + 1, false, aiPlayer, humanPlayer);
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  }

  let bestScore = Infinity;
  for (const move of moves) {
    const next = [...board];
    next[move] = humanPlayer;
    const score = minimax(next, depth + 1, true, aiPlayer, humanPlayer);
    bestScore = Math.min(bestScore, score);
  }
  return bestScore;
}

export function getBestMove(
  board: CellValue[],
  aiPlayer: Player,
  humanPlayer: Player
) {
  let bestScore = -Infinity;
  let bestMove = -1;
  const moves = getAvailableMoves(board);
  for (const move of moves) {
    const next = [...board];
    next[move] = aiPlayer;
    const score = minimax(next, 0, false, aiPlayer, humanPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

export function getRandomMove(board: CellValue[]) {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) return -1;
  return moves[Math.floor(Math.random() * moves.length)];
}
