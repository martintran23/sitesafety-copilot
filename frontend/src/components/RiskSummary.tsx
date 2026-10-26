import { riskColor } from "@/lib/severity";

export default function RiskSummary({ score, level }: { score: number; level: string }) {
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800 to-slate-900 p-5">
      <div className={`text-5xl font-black tabular-nums ${riskColor(level)}`}>{score}</div>
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">Overall risk</p>
        <p className={`text-xl font-bold ${riskColor(level)}`}>{level}</p>
        <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
