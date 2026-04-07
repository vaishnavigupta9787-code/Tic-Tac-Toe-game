import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-white/5 p-10 text-center shadow-2xl">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">
          Welcome to Playzone
        </p>
        <h1 className="mt-4 text-4xl font-semibold md:text-5xl font-[var(--font-display)] tracking-wide">
          Tic Tac Toe Arena
        </h1>
        <p className="mt-3 text-base text-white/70">
          Dive into the modern Tic Tac Toe experience with PvP or a smart
          random AI opponent.
        </p>
        <Link
          href="/playzone/tictactoe"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:-translate-y-0.5 hover:bg-emerald-200"
        >
          Enter Playzone
        </Link>
      </div>
    </main>
  );
}
