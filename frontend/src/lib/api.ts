import type { InspectResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function inspectImage(
  image: File,
  opts: { audioTranscript?: string; siteId?: string; mode?: "mock" | "live" } = {},
): Promise<InspectResponse> {
  const form = new FormData();
  form.append("image", image);
  if (opts.audioTranscript) form.append("audio_transcript", opts.audioTranscript);
  if (opts.siteId) form.append("site_id", opts.siteId);
  form.append("mode", opts.mode ?? "mock");

  const res = await fetch(`${API_URL}/api/v1/inspect`, { method: "POST", body: form });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Inspect failed (${res.status}) ${detail}`.trim());
  }
  return res.json();
}

export async function exportPresentation(
  payload: import("./types").ExportRequest,
): Promise<import("./types").ExportResponse> {
  const res = await fetch(`${API_URL}/api/v1/export/presentation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Export failed (${res.status}) ${detail}`.trim());
  }
  return res.json();
}

