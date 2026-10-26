import { riskColor } from "@/lib/severity";

interface Props {
  score: number;
  level: string;
  originalScore?: number;
  openCount?: number;
  stopWorkCount?: number;
  resolvedCount?: number;
}

export default function RiskSummary({
  score,
  level,
  originalScore,
  openCount = 0,
  stopWorkCount = 0,
  resolvedCount = 0,
}: Props) {
  const hasRemediation = originalScore !== undefined && originalScore > score;
  const mitigatedPts = hasRemediation ? originalScore - score : 0;

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/90 to-slate-900/95 p-5 shadow-xl shadow-black/30 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`text-5xl font-black tabular-nums transition-colors duration-500 ${riskColor(level)}`}>
            {score}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Jobsite Risk Rating
              </span>
              {hasRemediation && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                  -{mitigatedPts} pts mitigated
                </span>
              )}
            </div>
            <p className={`text-xl font-black tracking-tight ${riskColor(level)}`}>
              {level}{" "}
              <span className="text-xs font-normal text-slate-400">
                ({score} / 100)
              </span>
            </p>
          </div>
        </div>

        {/* Status distribution pills */}
        {(openCount > 0 || stopWorkCount > 0 || resolvedCount > 0) && (
          <div className="flex flex-col items-end gap-1 text-[11px]">
            {openCount > 0 && (
              <span className="rounded-md bg-rose-500/10 px-2 py-0.5 font-medium text-rose-300 ring-1 ring-rose-500/20">
                {openCount} Open
              </span>
            )}
            {stopWorkCount > 0 && (
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-300 ring-1 ring-amber-500/20">
                {stopWorkCount} Work Stopped
              </span>
            )}
            {resolvedCount > 0 && (
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-300 ring-1 ring-emerald-500/20">
                {resolvedCount} Corrected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Dynamic multi-segment risk gauge */}
      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
          <span>0 (CLEAR)</span>
          <span>25 (MED)</span>
          <span>50 (HIGH)</span>
          <span>80 (CRITICAL)</span>
          <span>100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950 p-0.5 ring-1 ring-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
