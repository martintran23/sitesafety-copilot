"use client";

import Link from "next/link";
import { HardHatIcon } from "../Icons";

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0b1020]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-amber-400 text-slate-950">
            <HardHatIcon className="h-4.5 w-4.5" />
          </span>
          <span className="text-sm font-black tracking-tight text-white">
            SiteSafety <span className="text-amber-400">Copilot</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-300 md:flex">
          <a href="#how" className="transition hover:text-white">
            How it works
          </a>
          <a href="#demo" className="transition hover:text-white">
            Try the demo
          </a>
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#standards" className="transition hover:text-white">
            Standards
          </a>
        </nav>

        <Link
          href="/app"
          className="rounded-md bg-amber-400 px-4 py-2 text-[13px] font-bold text-slate-950 transition hover:bg-amber-300 active:scale-[0.97]"
        >
          Open inspector
        </Link>
      </div>
    </header>
  );
}
