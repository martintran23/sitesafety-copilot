"use client";

import { useMemo, useState } from "react";
import ArchitectureSpecsView from "@/components/ArchitectureSpecsView";
import Footer from "@/components/Footer";
import HazardSidebar from "@/components/HazardSidebar";
import { ShieldAlertIcon, SparklesIcon, UploadCloudIcon } from "@/components/Icons";
import InspectionCanvas from "@/components/InspectionCanvas";
import Navbar, { type ActiveTab } from "@/components/Navbar";
import OshaStandardsExplorer from "@/components/OshaStandardsExplorer";
import PresentationModal from "@/components/PresentationModal";
import PresetScenarios, { PRESET_SCENARIOS, type PresetScenario } from "@/components/PresetScenarios";
import RiskSummary from "@/components/RiskSummary";
import ToolboxTalkStudio from "@/components/ToolboxTalkStudio";
import VoiceAssistantBar from "@/components/VoiceAssistantBar";
import { inspectImage } from "@/lib/api";
import { calculateRemediatedScore } from "@/lib/severity";
import type { HazardStatus, InspectResponse } from "@/lib/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("inspector");
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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Global Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        inspectMode={inspectMode}
        onModeToggle={setInspectMode}
        hasResult={!!result}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 sm:py-8">
        {/* VIEW 1: JOBSITE INSPECTOR */}
        {activeTab === "inspector" && (
          <div className="space-y-6">
            {/* Industrial Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-2xl">
              <div className="relative z-10 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-amber-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-amber-400 ring-1 ring-amber-500/30">
                    Autonomous OSHA 1926 Computer Vision
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Field-Grade Multimodal Intelligence
                  </span>
                </div>

                <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
                  Zero Preventable Incidents on the High-Iron.
                </h1>

                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                  Analyze jobsite photos and continuous walk-through video in milliseconds. Localize violations with normalized 0–1000 spatial coordinates, empower foremen with bidirectional spoken voice briefings, and export signed daily Job Hazard Analysis (JHA) reports.
                </p>

                {/* Key Spec Badges */}
                <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-slate-300">
                    <strong className="text-amber-400">&lt;45s</strong> Spoken Briefings
                  </span>
                  <span className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-slate-300">
                    <strong className="text-sky-400">[0, 1000]</strong> Normalized Canvas
                  </span>
                  <span className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-slate-300">
                    <strong className="text-emerald-400">Title 29 CFR 1926</strong> Grounded
                  </span>
                  <span className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-slate-300">
                    <strong className="text-amber-400">Zero</strong> Hallucination Guarantee
                  </span>
                </div>
              </div>
            </div>

            {/* Preset Scenarios selector */}
            <PresetScenarios
              activePresetId={activePresetId}
              onSelectPreset={handleSelectPreset}
              onClearPreset={handleClearPreset}
            />

            {/* Foreman Push-to-Talk Voice & Assistant Narration Bar */}
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

            {/* Controls Bar: Upload & Run Inspection */}
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="image-input"
                className="flex items-center gap-2 cursor-pointer rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-slate-100 transition hover:border-amber-400 hover:bg-slate-750 shadow-sm"
              >
                <UploadCloudIcon className="h-4 w-4 text-amber-400" />
                <span>{file ? `Photo: ${file.name}` : "Upload Jobsite Photo…"}</span>
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
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-xs font-bold text-slate-950 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 shadow-lg shadow-orange-500/20"
              >
                {loading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                ) : (
                  <SparklesIcon className="h-4 w-4 text-slate-950" />
                )}
                <span>{loading ? "Analyzing OSHA Hazards…" : "Run Hazard Inspection"}</span>
              </button>

              {error && (
                <span className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 ring-1 ring-red-500/30">
                  {error}
                </span>
              )}
            </div>

            {/* Main Inspection Workspace */}
            {imageUrl ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
                <div>
                  {/* Canvas Toolbar */}
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">
                      Spatial Inspection Canvas • Normalized [0–1000]
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                        <input
                          type="checkbox"
                          checked={showLabels}
                          onChange={(e) => setShowLabels(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-amber-500"
                        />
                        <span>CFR Labels</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                        <input
                          type="checkbox"
                          checked={dimBackground}
                          onChange={(e) => setDimBackground(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-amber-500"
                        />
                        <span>Spotlight Dim</span>
                      </label>
                      {selectedId && (
                        <button
                          type="button"
                          onClick={() => setSelectedId(null)}
                          className="text-[11px] text-amber-400 hover:underline"
                        >
                          Clear Selection
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
                      <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-400 ring-1 ring-amber-500/20 mb-2">
                        <ShieldAlertIcon className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-300">Ready to Analyze Jobsite Scene</p>
                      <p className="mt-1 text-[11px] text-slate-500 max-w-xs">
                        Select a preset scenario above or click &ldquo;Run Hazard Inspection&rdquo; to detect OSHA 1926 violations.
                      </p>
                    </div>
                  )}
                </aside>
              </div>
            ) : (
              <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center text-slate-500">
                <div className="rounded-2xl bg-slate-800 p-4 text-slate-400 mb-2">
                  <UploadCloudIcon className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-200">No Jobsite Image Loaded</h3>
                <p className="mt-1 max-w-sm text-xs text-slate-400">
                  Select one of the demo scenarios above or upload a jobsite photo to begin autonomous compliance analysis.
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: OSHA 1926 STANDARDS EXPLORER */}
        {activeTab === "standards" && (
          <OshaStandardsExplorer
            onLaunchPreset={() => {
              setActiveTab("inspector");
              handleSelectPreset(PRESET_SCENARIOS[0]);
            }}
          />
        )}

        {/* VIEW 3: TOOLBOX TALKS & JHA STUDIO */}
        {activeTab === "toolbox" && (
          <ToolboxTalkStudio
            activeScript={result?.audio_response_script}
            onLaunchInspector={() => setActiveTab("inspector")}
          />
        )}

        {/* VIEW 4: SPATIAL SPECS & ARCHITECTURE */}
        {activeTab === "specs" && <ArchitectureSpecsView />}
      </main>

      {/* Global Enterprise Footer */}
      <Footer onTabChange={setActiveTab} />

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
    </div>
  );
}
