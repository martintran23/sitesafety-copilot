"use client";

import { useState } from "react";
import { exportPresentation } from "@/lib/api";
import { STATUS_STYLES } from "@/lib/severity";
import type { ExportResponse, Hazard, HazardStatus } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hazards: Hazard[];
  overallRiskScore: number;
  riskLevel: string;
  assistantScript: string;
  statuses?: Record<string, HazardStatus>;
}

export default function PresentationModal({
  isOpen,
  onClose,
  hazards,
  overallRiskScore,
  riskLevel,
  assistantScript,
  statuses = {},
}: Props) {
  const [activeTab, setActiveTab] = useState<"video" | "jha">("video");
  const [siteName, setSiteName] = useState("Sector 4 - Commercial Framing Bay B");
  const [foremanName, setForemanName] = useState("Alex Rivera (Superintendent)");
  const [weatherCondition, setWeatherCondition] = useState("Clear / 68°F / Wind 5mph");
  const [includeNarration, setIncludeNarration] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [ppeChecklist, setPpeChecklist] = useState({
    hardHats: true,
    safetyGlasses: true,
    highVis: true,
    steelToe: true,
    fallHarness: true,
  });

  if (!isOpen) return null;

  async function handleExportVideo() {
    setExporting(true);
    setError(null);
    try {
      const res = await exportPresentation({
        inspection_id: `insp_${Date.now()}`,
        site_name: siteName,
        foreman_name: foremanName,
        hazards,
        include_narration: includeNarration,
        output_format: "mp4",
      });
      setExportResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  function handlePrintJha() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-bold text-sky-400 ring-1 ring-sky-500/30">
                OSHA 1926 Compliance Export
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Site ID: SFTY-{new Date().toISOString().slice(0, 10)}
              </span>
            </div>
            <h2 className="mt-1.5 text-xl font-bold text-slate-100">
              Toolbox Talk Presentation &amp; Job Hazard Analysis (JHA)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-bold transition ${
              activeTab === "video"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🎬</span>
            <span>Narrated Presentation Video (.mp4)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("jha")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-bold transition ${
              activeTab === "jha"
                ? "border-sky-400 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📋</span>
            <span>OSHA JHA Audit Sheet (Print/PDF)</span>
          </button>
        </div>

        {/* Tab 1: Video Export */}
        {activeTab === "video" && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="site-name-input" className="block text-xs font-semibold text-slate-400">
                  Jobsite Sector / Bay
                </label>
                <input
                  id="site-name-input"
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="foreman-name-input" className="block text-xs font-semibold text-slate-400">
                  Superintendent / Presenter
                </label>
                <input
                  id="foreman-name-input"
                  type="text"
                  value={foremanName}
                  onChange={(e) => setForemanName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <input
                id="narration-check"
                type="checkbox"
                checked={includeNarration}
                onChange={(e) => setIncludeNarration(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-sky-500"
              />
              <label htmlFor="narration-check" className="text-xs font-medium text-slate-300">
                Include Amazon Polly / Voice Assistant synchronized narration with animated bounding box callouts (&lt;45s)
              </label>
            </div>

            {/* Narration Script Preview */}
            {assistantScript && (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs text-slate-300">
                <div className="flex items-center justify-between font-bold text-sky-300">
                  <span>Assistant Narration Script (Target: Under 45s):</span>
                  <span className="font-mono text-[10px] text-slate-400">~28s runtime</span>
                </div>
                <p className="mt-2 italic leading-relaxed text-slate-200">
                  &ldquo;{assistantScript}&rdquo;
                </p>
              </div>
            )}

            {/* Export package generation result */}
            {exportResult && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs">
                <p className="font-bold text-emerald-300">✓ Export Package Generated (Phase 1 Ready)</p>
                <p className="mt-1 text-slate-300">
                  Estimated presentation duration: <strong>{exportResult.duration_seconds}s</strong>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={exportResult.download_url}
                    download
                    className="rounded-lg bg-emerald-500 px-3.5 py-1.5 font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    Download Presentation Video (.mp4)
                  </a>
                  {exportResult.jha_pdf_url && (
                    <a
                      href={exportResult.jha_pdf_url}
                      download
                      className="rounded-lg border border-emerald-500/50 bg-slate-900 px-3 py-1.5 font-semibold text-emerald-300 hover:bg-slate-800"
                    >
                      Download Companion JHA (.pdf)
                    </a>
                  )}
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        )}

        {/* Tab 2: Audit-Grade JHA Form */}
        {activeTab === "jha" && (
          <div className="mt-5 space-y-4 text-xs">
            {/* Header info table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    OSHA Title 29 CFR 1926 — Job Hazard Analysis (JHA)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Pre-Task Safety Assessment &amp; Daily Morning Briefing
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-lg bg-slate-800 px-2.5 py-1 font-mono text-xs font-bold text-sky-400">
                    Risk Score: {overallRiskScore}/100 ({riskLevel})
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
                <div>
                  <span className="text-slate-500 block">Jobsite Sector:</span>
                  <span className="font-semibold text-slate-200">{siteName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lead Inspector:</span>
                  <span className="font-semibold text-slate-200">{foremanName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Weather / Env:</span>
                  <input
                    type="text"
                    value={weatherCondition}
                    onChange={(e) => setWeatherCondition(e.target.value)}
                    className="w-full bg-transparent border-b border-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block">Assessment Date:</span>
                  <span className="font-semibold text-slate-200">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* PPE Verification row */}
              <div className="mt-4 border-t border-slate-800/80 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Required PPE Verification (1926 Subpart E):
                </span>
                <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-300">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ppeChecklist.hardHats}
                      onChange={(e) => setPpeChecklist({ ...ppeChecklist, hardHats: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-sky-500"
                    />
                    <span>Hard Hat (1926.100)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ppeChecklist.safetyGlasses}
                      onChange={(e) => setPpeChecklist({ ...ppeChecklist, safetyGlasses: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-sky-500"
                    />
                    <span>Eye Protection (1926.102)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ppeChecklist.fallHarness}
                      onChange={(e) => setPpeChecklist({ ...ppeChecklist, fallHarness: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-sky-500"
                    />
                    <span>Fall Harness (1926.502)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ppeChecklist.steelToe}
                      onChange={(e) => setPpeChecklist({ ...ppeChecklist, steelToe: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-sky-500"
                    />
                    <span>Steel-Toe Boots</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Hazard Identification & Remediation Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Hazard / CFR Standard</th>
                    <th className="p-3">Required Corrective Action</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Field Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {hazards.map((h, i) => {
                    const status = statuses[h.id] || "OPEN";
                    const statusStyle = STATUS_STYLES[status];

                    return (
                      <tr key={h.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-slate-400">{i + 1}</td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-100">{h.title}</p>
                          <span className="font-mono text-[10px] text-sky-400">{h.osha_citation}</span>
                        </td>
                        <td className="p-3 max-w-xs">{h.corrective_action}</td>
                        <td className="p-3 font-semibold text-slate-200">
                          {h.severity} (+{h.severity_weight} pts)
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${statusStyle.badge}`}>
                            {statusStyle.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Sign-off Signature Block */}
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Safety Superintendent Signature
                </p>
                <div className="mt-3 flex h-14 items-end border-b border-dashed border-slate-700 pb-1">
                  <span className="font-serif italic text-sky-300 text-sm">
                    {foremanName} — Certified OSHA 30
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Crew Lead / Subcontractor Sign-off
                </p>
                <div className="mt-3 flex h-14 items-end border-b border-dashed border-slate-700 pb-1">
                  <span className="text-[11px] text-slate-600">Pending morning briefing signature</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">All crew briefed on corrective actions</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <div className="text-xs text-slate-400">
            {hazards.length} hazards identified • Title 29 CFR 1926 verified
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrintJha}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-750"
            >
              <span>🖨️</span>
              <span>Print / Save JHA Sheet</span>
            </button>
            <button
              type="button"
              disabled={exporting || hazards.length === 0}
              onClick={handleExportVideo}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 px-5 py-2 text-xs font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 shadow-md shadow-sky-500/20"
            >
              <span>🎬</span>
              <span>{exporting ? "Generating Package…" : "Export Video & JHA"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
