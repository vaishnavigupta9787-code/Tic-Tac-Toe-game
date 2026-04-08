"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  calculateWinner,
  getBestMove,
  getRandomMove,
  isDraw,
  CellValue,
  Player,
} from "@/utils/tictactoe";

const emptyBoard: CellValue[] = Array.from({ length: 9 }, () => null);

type Scores = Record<Player, number>;
type Difficulty = "easy" | "hard";

export default function TicTacToe() {
  const [board, setBoard] = useState<CellValue[]>(emptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [draw, setDraw] = useState(false);
  const [vsAI, setVsAI] = useState(false);
  const [scores, setScores] = useState<Scores>({ X: 0, O: 0 });
  const [draws, setDraws] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const audioContextRef = useRef<AudioContext | null>(null);

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

  const playTone = useCallback(
    (frequency: number, duration: number, volume = 0.12) => {
      if (!soundOn) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = volume;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration / 1000);
    },
    [soundOn]
  );

  const playClickSound = useCallback(() => {
    playTone(520, 120, 0.08);
  }, [playTone]);

  const playWinSound = useCallback(() => {
    playTone(780, 160, 0.12);
    setTimeout(() => playTone(1040, 200, 0.12), 140);
  }, [playTone]);

  const playDrawSound = useCallback(() => {
    playTone(320, 220, 0.1);
    setTimeout(() => playTone(240, 240, 0.1), 160);
  }, [playTone]);

  const handleMove = useCallback(
    (index: number, player: Player) => {
      if (board[index] || winner || draw) return;

      const nextBoard = [...board];
      nextBoard[index] = player;
      setBoard(nextBoard);
      playClickSound();

      const result = calculateWinner(nextBoard);
      if (result.winner) {
        setWinner(result.winner);
        setWinningLine(result.line);
        setScores((prev) => ({
          ...prev,
          [result.winner]: prev[result.winner] + 1,
        }));
        playWinSound();
        return;
      }

      if (isDraw(nextBoard)) {
        setDraw(true);
        setDraws((prev) => prev + 1);
        playDrawSound();
        return;
      }

      setCurrentPlayer(player === "X" ? "O" : "X");
    },
    [board, winner, draw, playClickSound, playWinSound, playDrawSound]
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
    setDraws(0);
    resetBoard();
  };

  useEffect(() => {
    if (!vsAI || winner || draw || currentPlayer !== "O") return;
    let choice = -1;
    if (difficulty === "hard") {
      choice = getBestMove(board, "O", "X");
    } else {
      choice = getRandomMove(board);
    }
    if (choice === -1) return;

    const timeout = setTimeout(() => {
      handleMove(choice, "O");
    }, 520);

    return () => clearTimeout(timeout);
  }, [vsAI, winner, draw, currentPlayer, board, difficulty, handleMove]);

  const modalOpen = winner !== null || draw;

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
          <div className="flex flex-wrap items-center gap-3 rounded-full border border-white/10 bg-white/10 p-1">
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
            <button
              type="button"
              onClick={() => setSoundOn((prev) => !prev)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                soundOn
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {soundOn ? "Sound On" : "Sound Off"}
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
                  Turn
                </span>
                <span className="text-lg font-semibold text-white">
                  {vsAI && currentPlayer === "O" ? "Computer" : currentPlayer}
                </span>
              </div>
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
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Draws
                </span>
                <span className="text-lg font-semibold text-white/80">
                  {draws}
                </span>
              </div>
            </div>

            {vsAI && (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  AI Difficulty
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setDifficulty("easy")}
                    className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      difficulty === "easy"
                        ? "bg-white text-slate-900 shadow-lg"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Easy
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty("hard")}
                    className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      difficulty === "hard"
                        ? "bg-white text-slate-900 shadow-lg"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Hard
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={resetBoard}
              className="w-full rounded-2xl border border-white/10 bg-white/15 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:bg-white/25"
            >
              Restart Game
            </button>
          </div>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 text-center text-white shadow-2xl">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                Game Over
              </p>
              <h2 className="mt-4 text-3xl font-semibold font-[var(--font-display)] tracking-wide">
                {winner
                  ? vsAI && winner === "O"
                    ? "Computer Wins 🤖"
                    : `Player ${winner} Wins 🎉`
                  : "It's a Draw 🤝"}
              </h2>
              <p className="mt-3 text-sm text-white/70">
                Ready for another round?
              </p>
              <button
                type="button"
                onClick={resetBoard}
                className="mt-6 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-900 transition hover:-translate-y-0.5 hover:bg-emerald-200"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
