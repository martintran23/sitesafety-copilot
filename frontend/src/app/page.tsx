"use client";

import { useState } from "react";
import HazardSidebar from "@/components/HazardSidebar";
import InspectionCanvas from "@/components/InspectionCanvas";
import RiskSummary from "@/components/RiskSummary";
import { inspectImage } from "@/lib/api";
import type { InspectResponse } from "@/lib/types";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<InspectResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFileChange(next: File | null) {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(next);
    setImageUrl(next ? URL.createObjectURL(next) : null);
    setResult(null);
    setSelectedId(null);
  }

  async function runInspection() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSelectedId(null);
    try {
      setResult(await inspectImage(file, { mode: "mock" }));
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Inspection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white">
          SiteSafety <span className="text-sky-400">Copilot</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload a site photo to detect OSHA 1926 hazards.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label
          htmlFor="image-input"
          className="cursor-pointer rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-400 hover:bg-slate-700"
        >
          {file ? file.name : "Choose image…"}
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
          className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analyzing…" : "Run inspection"}
        </button>
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>

      {imageUrl ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <InspectionCanvas
            imageUrl={imageUrl}
            hazards={result?.hazards ?? []}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <aside className="flex flex-col gap-4">
            {result ? (
              <>
                <RiskSummary score={result.overall_risk_score} level={result.risk_level} />
                <HazardSidebar
                  hazards={result.hazards}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </>
            ) : (
              <p className="text-sm text-slate-500">Run an inspection to see hazards.</p>
            )}
          </aside>
        </div>
      ) : (
        <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-700 text-slate-500">
          No image selected
        </div>
      )}
    </main>
  );
}
