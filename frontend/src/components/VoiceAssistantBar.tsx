"use client";

import { useEffect, useRef, useState } from "react";
import { MicIcon, SparklesIcon, SpeakerIcon } from "./Icons";
import type { Hazard } from "@/lib/types";

interface Props {
  transcript: string;
  onTranscriptChange: (text: string) => void;
  assistantScript: string | null;
  transcriptUsed?: boolean;
  hazards?: Hazard[];
  onTourHazardChange?: (hazardId: string | null) => void;
}

export default function VoiceAssistantBar({
  transcript,
  onTranscriptChange,
  assistantScript,
  transcriptUsed,
  hazards = [],
  onTourHazardChange,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourIndex, setTourIndex] = useState<number>(-1);

  const isTourRunningRef = useRef(isTourRunning);
  isTourRunningRef.current = isTourRunning;

  const [hasSpeechRecognition] = useState(
    () =>
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
  );

  // Stop tour if hazards change or component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function toggleRecording() {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if (typeof window === "undefined") return;
    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. You can type observations manually.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsRecording(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((r: any) => r[0].transcript)
          .join("");
        onTranscriptChange(text);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  }

  function speakAssistantScript() {
    if (!assistantScript || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingBriefing) {
      window.speechSynthesis.cancel();
      setIsPlayingBriefing(false);
      return;
    }

    stopTour();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(assistantScript);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsPlayingBriefing(true);
    utterance.onend = () => setIsPlayingBriefing(false);
    utterance.onerror = () => setIsPlayingBriefing(false);

    window.speechSynthesis.speak(utterance);
  }

  function stopTour() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsTourRunning(false);
    setTourIndex(-1);
    onTourHazardChange?.(null);
  }

  function startWalkthroughTour() {
    if (hazards.length === 0 || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (isTourRunning) {
      stopTour();
      return;
    }

    // Cancel any current audio
    window.speechSynthesis.cancel();
    setIsPlayingBriefing(false);
    setIsTourRunning(true);

    playTourStep(0);
  }

  function playTourStep(index: number) {
    if (!isTourRunningRef.current && index !== 0) return;
    if (index >= hazards.length) {
      // Concluding summary
      const outro = new SpeechSynthesisUtterance(
        "Walkthrough complete. Confirm guardrails and protective measures before starting work."
      );
      outro.onend = () => stopTour();
      outro.onerror = () => stopTour();
      window.speechSynthesis.speak(outro);
      return;
    }

    const currentHazard = hazards[index];
    setTourIndex(index);
    onTourHazardChange?.(currentHazard.id);

    const textToSpeak = `Hazard ${index + 1}: ${currentHazard.title}. ${currentHazard.audio_response_script}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;

    utterance.onend = () => {
      if (!isTourRunningRef.current) return;
      // Pause 750ms between hazard explanations
      setTimeout(() => {
        if (isTourRunningRef.current) {
          playTourStep(index + 1);
        }
      }, 750);
    };

    utterance.onerror = () => {
      stopTour();
    };

    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/85 p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Push to talk & transcript input */}
        <div className="flex flex-1 items-center gap-3">
          <button
            type="button"
            id="mic-button"
            onClick={toggleRecording}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm shrink-0 ${
              isRecording
                ? "animate-pulse bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-400"
                : "border border-slate-700 bg-slate-800 text-slate-200 hover:border-amber-400 hover:bg-slate-750"
            }`}
            title={hasSpeechRecognition ? "Click to speak foreman observation" : "Browser speech recognition"}
          >
            <MicIcon className={`h-4 w-4 ${isRecording ? "text-white animate-pulse" : "text-amber-400"}`} />
            <span>{isRecording ? "Listening to Audio…" : "Push-to-Talk (Mic)"}</span>
          </button>

          <div className="relative flex-1">
            <input
              id="transcript-input"
              type="text"
              value={transcript}
              onChange={(e) => onTranscriptChange(e.target.value)}
              placeholder="Foreman observation (e.g. 'Check trench near west wall, digging without shoring')"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
            />
            {transcript && (
              <button
                type="button"
                onClick={() => onTranscriptChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Audio Narration & Walkthrough Tour Controls */}
        <div className="flex flex-wrap items-center gap-2.5 border-t border-slate-800 pt-3 lg:border-t-0 lg:pt-0">
          {transcriptUsed && (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
              Voice Context Applied
            </span>
          )}

          {assistantScript && (
            <>
              {/* Voice Briefing Button */}
              <button
                type="button"
                id="play-briefing-button"
                onClick={speakAssistantScript}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                  isPlayingBriefing
                    ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/20"
                    : "border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-500 hover:bg-slate-800"
                }`}
              >
                <SpeakerIcon className="h-4 w-4 text-amber-400" />
                <span>{isPlayingBriefing ? "Stop Briefing" : "Play Voice Briefing"}</span>
              </button>

              {/* Synchronized Walkthrough Tour Button */}
              {hazards.length > 0 && (
                <button
                  type="button"
                  id="walkthrough-tour-button"
                  onClick={startWalkthroughTour}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                    isTourRunning
                      ? "border-amber-400 bg-amber-500/25 text-amber-300 ring-2 ring-amber-400/40 shadow-amber-500/30"
                      : "border-amber-500/60 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400"
                  }`}
                  title="Sequential spoken walkthrough with synchronized canvas highlights"
                >
                  <SparklesIcon className="h-4 w-4 text-amber-400" />
                  <span>
                    {isTourRunning
                      ? `Stop Tour (${tourIndex + 1}/${hazards.length})`
                      : "Start Audio Tour"}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
