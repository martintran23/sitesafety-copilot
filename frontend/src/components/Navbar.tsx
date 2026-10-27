"use client";

import Link from "next/link";
import { DocumentCheckIcon, HardHatIcon } from "./Icons";

export type ActiveTab = "inspector" | "standards" | "toolbox" | "specs";

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  inspectMode: "mock" | "live";
  onModeToggle: (mode: "mock" | "live") => void;
  hasResult: boolean;
  onOpenExport: () => void;
}

export default function Navbar({
  activeTab,
  onTabChange,
  inspectMode,
  onModeToggle,
  hasResult,
  onOpenExport,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onTabChange("inspector")}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20 ring-1 ring-amber-400/30 transition-transform group-hover:scale-105">
              <HardHatIcon className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-base font-black tracking-tight text-white">
                  SiteSafety <span className="text-amber-400">Copilot</span>
                </span>
                <span className="hidden rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 ring-1 ring-amber-500/30 sm:inline-block">
                  CFR 1926
                </span>
              </div>
              <p className="text-[10px] font-medium tracking-wide text-slate-400">
                Autonomous OSHA Construction Vision &amp; Voice Intelligence
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-900 hover:text-slate-200"
            >
              &larr; Home
            </Link>
            <button
              type="button"
              onClick={() => onTabChange("inspector")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "inspector"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              Jobsite Inspector
            </button>
            <button
              type="button"
              onClick={() => onTabChange("standards")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "standards"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              OSHA 1926 Standards
            </button>
            <button
              type="button"
              onClick={() => onTabChange("toolbox")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "toolbox"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              Toolbox Talks &amp; JHA
            </button>
            <button
              type="button"
              onClick={() => onTabChange("specs")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "specs"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              Spatial Specs
            </button>
          </nav>
        </div>

        {/* Right Actions & Telemetry */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-[11px] font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] text-slate-400">Grounding:</span>
            <span className="font-semibold text-emerald-400">29 CFR 1926 Verified</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1 text-xs">
            <button
              type="button"
              onClick={() => onModeToggle("mock")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                inspectMode === "mock"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Mock Engine
            </button>
            <button
              type="button"
              onClick={() => onModeToggle("live")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                inspectMode === "live"
                  ? "bg-sky-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Live Bedrock
            </button>
          </div>

          {/* JHA Export Trigger */}
          <button
            type="button"
            id="nav-export-btn"
            disabled={!hasResult}
            onClick={onOpenExport}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-amber-400 hover:bg-slate-750 disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
          >
            <DocumentCheckIcon className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Export JHA</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden border-t border-slate-800/80 bg-slate-950 px-2 py-1.5 gap-1 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => onTabChange("inspector")}
          className={`shrink-0 rounded-lg px-2.5 py-1 font-semibold ${
            activeTab === "inspector" ? "bg-slate-800 text-white" : "text-slate-400"
          }`}
        >
          Inspector
        </button>
        <button
          type="button"
          onClick={() => onTabChange("standards")}
          className={`shrink-0 rounded-lg px-2.5 py-1 font-semibold ${
            activeTab === "standards" ? "bg-slate-800 text-white" : "text-slate-400"
          }`}
        >
          Standards
        </button>
        <button
          type="button"
          onClick={() => onTabChange("toolbox")}
          className={`shrink-0 rounded-lg px-2.5 py-1 font-semibold ${
            activeTab === "toolbox" ? "bg-slate-800 text-white" : "text-slate-400"
          }`}
        >
          Toolbox &amp; JHA
        </button>
        <button
          type="button"
          onClick={() => onTabChange("specs")}
          className={`shrink-0 rounded-lg px-2.5 py-1 font-semibold ${
            activeTab === "specs" ? "bg-slate-800 text-white" : "text-slate-400"
          }`}
        >
          Spatial Specs
        </button>
      </div>
    </header>
  );
}
