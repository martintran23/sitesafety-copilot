"use client";

import { useMemo, useState } from "react";
import HazardSidebar from "@/components/HazardSidebar";
import InspectionCanvas from "@/components/InspectionCanvas";
import PresentationModal from "@/components/PresentationModal";
import PresetScenarios, { type PresetScenario } from "@/components/PresetScenarios";
import RiskSummary from "@/components/RiskSummary";
import VoiceAssistantBar from "@/components/VoiceAssistantBar";
import { inspectImage } from "@/lib/api";
import { calculateRemediatedScore } from "@/lib/severity";
import type { HazardStatus, InspectResponse } from "@/lib/types";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<InspectResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [hazardStatuses, setHazardStatuses] = useState<Record<string, HazardStatus>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [inspectMode, setInspectMode] = useState<"mock" | "live">("mock");
  const [showLabels, setShowLabels] = useState(true);
  const [dimBackground, setDimBackground] = useState(true);

  // Dynamically recalculate risk score and bands as hazards are resolved on-site
  const remediatedRisk = useMemo(() => {
    if (!result) return null;
    return calculateRemediatedScore(result.hazards, hazardStatuses);
  }, [result, hazardStatuses]);

  function handleStatusChange(id: string, status: HazardStatus) {
    setHazardStatuses((prev) => ({
      ...prev,
      [id]: status,
    }));
  }

  function onFileChange(next: File | null) {
    if (imageUrl && !imageUrl.startsWith("/presets/")) {
      URL.revokeObjectURL(imageUrl);
    }
    setActivePresetId(null);
    setFile(next);
    setImageUrl(next ? URL.createObjectURL(next) : null);
    setResult(null);
    setSelectedId(null);
    setHoveredId(null);
    setActiveTourId(null);
    setHazardStatuses({});
    setError(null);
  }

  async function handleSelectPreset(preset: PresetScenario) {
    setActivePresetId(preset.id);
    setImageUrl(preset.imagePath);
    setTranscript(preset.defaultTranscript);
    setResult(null);
    setSelectedId(null);
    setHoveredId(null);
    setActiveTourId(null);
    setHazardStatuses({});
    setError(null);

    try {
      const res = await fetch(preset.imagePath);
      const blob = await res.blob();
      const presetFile = new File([blob], `${preset.id}.svg`, { type: "image/svg+xml" });
      setFile(presetFile);
    } catch {
      setError("Failed to load preset scenario asset.");
    }
  }

  function handleClearPreset() {
    setActivePresetId(null);
    setImageUrl(null);
    setFile(null);
    setTranscript("");
    setResult(null);
    setSelectedId(null);
    setHoveredId(null);
    setActiveTourId(null);
    setHazardStatuses({});
    setError(null);
  }

  async function runInspection() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSelectedId(null);
    setHoveredId(null);
    setActiveTourId(null);
    setHazardStatuses({});

    try {
      const resp = await inspectImage(file, {
        audioTranscript: transcript.trim() || undefined,
        mode: inspectMode,
      });
      setResult(resp);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Inspection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
      {/* Top Header Bar */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              SiteSafety <span className="text-sky-400">Copilot</span>
            </h1>
            <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-bold text-sky-400 ring-1 ring-sky-500/30">
              Phase 1 MVP
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Autonomous Multimodal OSHA Title 29 CFR 1926 Hazard Detection &amp; Voice Intelligence
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Selector */}
          <div className="flex items-center rounded-xl border border-slate-700/80 bg-slate-900/90 p-1 text-xs">
            <button
              type="button"
              id="mode-mock-btn"
              onClick={() => setInspectMode("mock")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                inspectMode === "mock"
                  ? "bg-sky-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Mock (Phase 1)
            </button>
            <button
              type="button"
              id="mode-live-btn"
              onClick={() => setInspectMode("live")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                inspectMode === "live"
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Live Bedrock (Phase 2)
            </button>
          </div>

          <button
            type="button"
            id="export-modal-button"
            disabled={!result}
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
          >
            <span>📑</span>
            <span>Toolbox &amp; JHA Export</span>
            {result && (
              <span className="rounded-full bg-sky-500/20 px-1.5 py-0.2 text-[10px] font-bold text-sky-300">
                {result.hazards.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Preset Scenarios selector */}
      <div className="mb-4">
        <PresetScenarios
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
          onClearPreset={handleClearPreset}
        />
      </div>

      {/* Foreman Push-to-Talk Voice & Assistant Narration Bar */}
      <div className="mb-6">
        <VoiceAssistantBar
          transcript={transcript}
          onTranscriptChange={setTranscript}
          assistantScript={result?.audio_response_script ?? null}
          transcriptUsed={result?.foreman_transcript_used}
          hazards={result?.hazards ?? []}
          onTourHazardChange={(id) => {
            setActiveTourId(id);
            if (id) setSelectedId(id);
          }}
        />
      </div>

      {/* Controls Bar: Upload & Run */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label
          htmlFor="image-input"
          className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-slate-100 transition hover:border-sky-400 hover:bg-slate-750 shadow-sm"
        >
          {file ? `Photo: ${file.name}` : "Upload Jobsite Photo…"}
        </label>
        <input
          id="image-input"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />

        <button
          id="inspect-button"
          type="button"
          disabled={!file || loading}
          onClick={runInspection}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 px-6 py-2.5 text-xs font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 shadow-lg shadow-sky-500/20"
        >
          {loading && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
          )}
          <span>{loading ? "Analyzing OSHA Hazards…" : "Run Inspection"}</span>
        </button>

        {error && (
          <span className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 ring-1 ring-red-500/30">
            {error}
          </span>
        )}
      </div>

      {/* Inspection Layout */}
      {imageUrl ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div>
            {/* Canvas Toolbar */}
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span className="font-medium">
                Normalized [0-1000] Spatial Bounding Canvas
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-sky-500"
                  />
                  <span>Show Labels</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={dimBackground}
                    onChange={(e) => setDimBackground(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-sky-500"
                  />
                  <span>Spotlight Dim</span>
                </label>
                {selectedId && (
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="text-[11px] text-sky-400 hover:underline"
                  >
                    Clear Focus
                  </button>
                )}
              </div>
            </div>

            <InspectionCanvas
              imageUrl={imageUrl}
              hazards={result?.hazards ?? []}
              selectedId={selectedId}
              onSelect={setSelectedId}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              statuses={hazardStatuses}
              activeTourId={activeTourId}
              showLabels={showLabels}
              dimBackground={dimBackground}
            />
          </div>

          <aside className="flex flex-col gap-4">
            {result && remediatedRisk ? (
              <>
                <RiskSummary
                  score={remediatedRisk.score}
                  level={remediatedRisk.level}
                  originalScore={remediatedRisk.originalScore}
                  openCount={remediatedRisk.openCount}
                  stopWorkCount={remediatedRisk.stopWorkCount}
                  resolvedCount={remediatedRisk.resolvedCount}
                />
                <HazardSidebar
                  hazards={result.hazards}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                  statuses={hazardStatuses}
                  onStatusChange={handleStatusChange}
                  activeTourId={activeTourId}
                />
              </>
            ) : (
              <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center text-slate-500">
                <span className="text-3xl">🛡️</span>
                <p className="mt-2 text-xs font-medium">Ready to analyze jobsite</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  Click &ldquo;Run Inspection&rdquo; to detect OSHA 1926 hazards.
                </p>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center text-slate-500">
          <span className="text-4xl">📷</span>
          <h3 className="mt-3 text-sm font-semibold text-slate-300">No Jobsite Image Selected</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Choose a quick demo scenario above or upload a jobsite photo to begin autonomous compliance analysis.
          </p>
        </div>
      )}

      {/* Presentation & JHA Export Modal */}
      {result && (
        <PresentationModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          hazards={result.hazards}
          overallRiskScore={remediatedRisk ? remediatedRisk.score : result.overall_risk_score}
          riskLevel={remediatedRisk ? remediatedRisk.level : result.risk_level}
          assistantScript={result.audio_response_script}
          statuses={hazardStatuses}
        />
      )}
    </main>
  );
}
