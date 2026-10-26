import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SiteSafety Copilot — Autonomous OSHA 1926 Construction Vision & Spoken Intelligence",
  description:
    "Autonomous multimodal construction safety copilot. Detects OSHA Title 29 CFR 1926 violations, speaks findings aloud, calculates real-time risk, and exports audit-ready daily JHA reports and morning toolbox-talk presentations.",
  keywords: [
    "OSHA 1926",
    "construction safety",
    "Job Hazard Analysis",
    "JHA",
    "computer vision",
    "toolbox talk",
    "Amazon Bedrock",
    "superintendent safety",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
