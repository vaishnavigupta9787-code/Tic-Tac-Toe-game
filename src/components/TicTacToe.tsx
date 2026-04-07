"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { calculateWinner, isDraw, CellValue, Player } from "@/utils/tictactoe";

const emptyBoard: CellValue[] = Array.from({ length: 9 }, () => null);

type Scores = Record<Player, number>;

export default function TicTacToe() {
  const [board, setBoard] = useState<CellValue[]>(emptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [draw, setDraw] = useState(false);
  const [vsAI, setVsAI] = useState(false);
  const [scores, setScores] = useState<Scores>({ X: 0, O: 0 });

  const boardLocked = useMemo(() => {
    return winner !== null || draw || (vsAI && currentPlayer === "O");
  }, [winner, draw, vsAI, currentPlayer]);

  const statusText = useMemo(() => {
    if (winner) {
      if (vsAI && winner === "O") return "Computer Wins 🤖";
      return `Player ${winner} Wins 🎉`;
    }
    if (draw) return "It's a Draw 🤝";
    if (vsAI && currentPlayer === "O") return "Computer Thinking...";
    return `Player ${currentPlayer}'s Turn`;
  }, [winner, draw, vsAI, currentPlayer]);

  const resetBoard = () => {
    setBoard(emptyBoard);
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine(null);
    setDraw(false);
  };

  const handleMove = useCallback(
    (index: number, player: Player) => {
      if (board[index] || winner || draw) return;

      const nextBoard = [...board];
    nextBoard[index] = player;
    setBoard(nextBoard);

    const result = calculateWinner(nextBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScores((prev) => ({
        ...prev,
        [result.winner]: prev[result.winner] + 1,
      }));
      return;
    }

    if (isDraw(nextBoard)) {
      setDraw(true);
      return;
    }

      setCurrentPlayer(player === "X" ? "O" : "X");
    },
    [board, winner, draw]
  );

  const handleCellClick = useCallback(
    (index: number) => {
      if (boardLocked) return;
      handleMove(index, currentPlayer);
    },
    [boardLocked, handleMove, currentPlayer]
  );

  const toggleMode = (nextVsAI: boolean) => {
    setVsAI(nextVsAI);
    setScores({ X: 0, O: 0 });
    resetBoard();
  };

  useEffect(() => {
    if (!vsAI || winner || draw || currentPlayer !== "O") return;
    const available = board
      .map((value, index) => (value === null ? index : null))
      .filter((value): value is number => value !== null);
    if (available.length === 0) return;

    const timeout = setTimeout(() => {
      const choice = available[Math.floor(Math.random() * available.length)];
      handleMove(choice, "O");
    }, 450);

    return () => clearTimeout(timeout);
  }, [vsAI, winner, draw, currentPlayer, board, handleMove]);

  return (
    <div className="relative w-full max-w-3xl">
      <div className="absolute -top-20 -right-24 h-60 w-60 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
              Playzone
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl font-[var(--font-display)] tracking-wide">
              Tic Tac Toe
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Classic strategy with a sleek, modern twist.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 p-1">
            <button
              type="button"
              onClick={() => toggleMode(false)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                !vsAI
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Player vs Player
            </button>
            <button
              type="button"
              onClick={() => toggleMode(true)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                vsAI
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Player vs AI
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => {
              const isWinningCell = winningLine?.includes(index);
              return (
                <button
                  key={`cell-${index}`}
                  type="button"
                  onClick={() => handleCellClick(index)}
                  disabled={boardLocked || cell !== null}
                  aria-label={`Cell ${index + 1}`}
                  className={`group relative aspect-square rounded-2xl border border-white/10 bg-white/5 text-4xl font-semibold text-white shadow-inner transition duration-200 md:text-5xl ${
                    isWinningCell
                      ? "border-emerald-300/70 bg-emerald-300/20 shadow-[0_0_25px_rgba(52,211,153,0.35)]"
                      : "hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
                  } ${boardLocked || cell ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`inline-flex h-full w-full items-center justify-center ${
                      cell ? "animate-[pop_180ms_ease-out]" : ""
                    } ${cell === "X" ? "text-emerald-200" : "text-sky-200"}`}
                  >
                    {cell ?? ""}
                  </span>
                  {!cell && !boardLocked && (
                    <span className="absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-white/30" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
            <div role="status" aria-live="polite">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Status
              </p>
              <p className="mt-3 text-2xl font-semibold text-white font-[var(--font-display)] tracking-wide">
                {statusText}
              </p>
              <p className="mt-2 text-sm text-white/60">
                {winner || draw
                  ? "Hit restart to play another round."
                  : "Make your move and claim the grid."}
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Player X
                </span>
                <span className="text-lg font-semibold text-emerald-200">
                  {scores.X}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {vsAI ? "Computer (O)" : "Player O"}
                </span>
                <span className="text-lg font-semibold text-sky-200">
                  {scores.O}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetBoard}
              className="w-full rounded-2xl border border-white/10 bg-white/15 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:bg-white/25"
            >
              Restart Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
