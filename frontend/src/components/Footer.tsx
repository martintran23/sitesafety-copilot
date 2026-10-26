"use client";

import { HardHatIcon } from "./Icons";
import type { ActiveTab } from "./Navbar";

export default function Footer({ onTabChange }: { onTabChange: (tab: ActiveTab) => void }) {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
                <HardHatIcon className="h-4 w-4" />
              </div>
              <span className="font-bold text-white text-sm">SiteSafety Copilot</span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-amber-400">
                Phase 1 MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Autonomous multimodal OSHA Title 29 CFR 1926 construction hazard intelligence. Synchronized spatial bounding boxes, bidirectional spoken audio, real-time risk scoring, and audit-ready JHA exports.
            </p>
            <p className="text-[11px] text-slate-500">
              Built for HackGlobal Theme 2 • Designed for construction superintendents and field safety officers.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-200 mb-3">
              Platform Views
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onTabChange("inspector")}
                  className="hover:text-amber-400 transition"
                >
                  Jobsite Inspector
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabChange("standards")}
                  className="hover:text-amber-400 transition"
                >
                  OSHA 1926 Standards Store
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabChange("toolbox")}
                  className="hover:text-amber-400 transition"
                >
                  Toolbox Talk Studio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabChange("specs")}
                  className="hover:text-amber-400 transition"
                >
                  Spatial Specifications
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Regulatory & API */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-200 mb-3">
              Standards &amp; API
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.osha.gov/laws-regs/regulations/standardnumber/1926"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition"
                >
                  OSHA Title 29 CFR 1926 ↗
                </a>
              </li>
              <li>
                <a
                  href="http://127.0.0.1:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition"
                >
                  FastAPI OpenAPI Specs ↗
                </a>
              </li>
              <li>
                <span className="text-slate-500 font-mono text-[10px]">
                  Engine: FastAPI + Next.js + Tailwind
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 border-t border-slate-900 pt-6 text-[11px] text-slate-500 leading-relaxed">
          Grounded strictly in OSHA Title 29 CFR Part 1926. This system is an AI assistive copilot for safety superintendents and does not replace the statutory authority of an OSHA compliance officer or licensed Professional Engineer (PE).
        </div>
      </div>
    </footer>
  );
}
