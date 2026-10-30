import test from "node:test";
import assert from "node:assert/strict";
import { exportPresentation } from "./api.ts";

test("exportPresentation resolves relative backend /static URLs against API_URL", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        download_url: "/static/exports/presentation_insp_01.mp4",
        duration_seconds: 18.5,
        jha_pdf_url: "/static/exports/jha_insp_01.pdf",
        status: "ready",
        message: "Prepared.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;

  const result = await exportPresentation({
    inspection_id: "insp_01",
    site_name: "Sector 4",
    foreman_name: "Alex Rivera",
    hazards: [],
    include_narration: true,
    output_format: "mp4",
  });

  assert.strictEqual(result.download_url, "http://127.0.0.1:8000/static/exports/presentation_insp_01.mp4");
  assert.strictEqual(result.jha_pdf_url, "http://127.0.0.1:8000/static/exports/jha_insp_01.pdf");
});

