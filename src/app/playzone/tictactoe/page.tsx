import TicTacToe from "@/components/TicTacToe";

export default function TicTacToePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-16 text-white">
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 rounded-full bg-sky-400/10 blur-3xl" />
      <TicTacToe />
    </main>
  );
}
