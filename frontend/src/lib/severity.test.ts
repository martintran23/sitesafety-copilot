import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateRemediatedScore,
  getSubpartKey,
  riskColor,
  riskLevelFromScore,
  SEVERITY_STYLES,
  STATUS_STYLES,
} from "./severity.ts";
import type { Hazard, Severity } from "./types.ts";

test("riskColor maps severity levels to expected Tailwind color classes", () => {
  assert.strictEqual(riskColor("CRITICAL"), "text-red-400");
  assert.strictEqual(riskColor("HIGH"), "text-orange-400");
  assert.strictEqual(riskColor("MEDIUM"), "text-amber-300");
  assert.strictEqual(riskColor("MODERATE"), "text-amber-300");
  assert.strictEqual(riskColor("LOW"), "text-emerald-400");
  assert.strictEqual(riskColor("CLEAR"), "text-emerald-300");
});

test("riskLevelFromScore matches OSHA severity threshold bands", () => {
  assert.strictEqual(riskLevelFromScore(90), "CRITICAL");
  assert.strictEqual(riskLevelFromScore(80), "CRITICAL");
  assert.strictEqual(riskLevelFromScore(79), "HIGH");
  assert.strictEqual(riskLevelFromScore(50), "HIGH");
  assert.strictEqual(riskLevelFromScore(49), "MEDIUM");
  assert.strictEqual(riskLevelFromScore(25), "MEDIUM");
  assert.strictEqual(riskLevelFromScore(24), "LOW");
  assert.strictEqual(riskLevelFromScore(1), "LOW");
  assert.strictEqual(riskLevelFromScore(0), "CLEAR");
});

test("SEVERITY_STYLES and STATUS_STYLES are fully populated", () => {
  const expectedSeverities: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  for (const sev of expectedSeverities) {
    const style = SEVERITY_STYLES[sev];
    assert.ok(style, `Missing severity style for ${sev}`);
    assert.ok(typeof style.box === "string" && style.box.length > 0);
    assert.ok(typeof style.badge === "string" && style.badge.length > 0);
  }

  assert.ok(STATUS_STYLES.OPEN);
  assert.ok(STATUS_STYLES.STOP_WORK);
  assert.ok(STATUS_STYLES.RESOLVED);
});

test("getSubpartKey maps citations accurately", () => {
  assert.strictEqual(getSubpartKey("29 CFR 1926.501(b)(1)"), "SUBPART_M");
  assert.strictEqual(getSubpartKey("29 CFR 1926.451(g)(1)"), "SUBPART_L");
  assert.strictEqual(getSubpartKey("29 CFR 1926.652(a)(1)"), "SUBPART_P");
  assert.strictEqual(getSubpartKey("29 CFR 1926.1053(b)(1)"), "SUBPART_X");
  assert.strictEqual(getSubpartKey("29 CFR 1926.100(a)"), "SUBPART_E_K");
  assert.strictEqual(getSubpartKey("29 CFR 1926.404(b)(1)"), "SUBPART_E_K");
  assert.strictEqual(getSubpartKey("General site warning"), "OTHER");
});

test("calculateRemediatedScore reduces risk appropriately upon remediation", () => {
  const mockHazards: Hazard[] = [
    {
      id: "h1",
      title: "Fall hazard",
      severity: "CRITICAL",
      severity_weight: 35,
      osha_citation: "29 CFR 1926.501(b)(1)",
      description: "Edge",
      corrective_action: "Guardrails",
      box_2d: [100, 100, 400, 400],
      confidence: 0.9,
      audio_response_script: "Fall.",
    },
    {
      id: "h2",
      title: "Ladder hazard",
      severity: "HIGH",
      severity_weight: 25,
      osha_citation: "29 CFR 1926.1053(b)(1)",
      description: "Ladder",
      corrective_action: "Extend",
      box_2d: [200, 200, 600, 500],
      confidence: 0.85,
      audio_response_script: "Ladder.",
    },
  ];

  // All open: score = 35 + 25 = 60 (HIGH)
  const allOpen = calculateRemediatedScore(mockHazards, {});
  assert.strictEqual(allOpen.score, 60);
  assert.strictEqual(allOpen.level, "HIGH");
  assert.strictEqual(allOpen.mitigatedPoints, 0);
  assert.strictEqual(allOpen.openCount, 2);

  // Stop work on h1: h1 weight becomes ceil(35 * 0.5) = 18; score = 18 + 25 = 43 (MEDIUM)
  const stoppedH1 = calculateRemediatedScore(mockHazards, { h1: "STOP_WORK" });
  assert.strictEqual(stoppedH1.score, 43);
  assert.strictEqual(stoppedH1.level, "MEDIUM");
  assert.strictEqual(stoppedH1.mitigatedPoints, 17);
  assert.strictEqual(stoppedH1.stopWorkCount, 1);

  // Resolve h1: score = 25 (MEDIUM); resolve both: score = 0 (CLEAR)
  const resolvedH1 = calculateRemediatedScore(mockHazards, { h1: "RESOLVED" });
  assert.strictEqual(resolvedH1.score, 25);
  assert.strictEqual(resolvedH1.level, "MEDIUM");
  assert.strictEqual(resolvedH1.mitigatedPoints, 35);

  const resolvedBoth = calculateRemediatedScore(mockHazards, {
    h1: "RESOLVED",
    h2: "RESOLVED",
  });
  assert.strictEqual(resolvedBoth.score, 0);
  assert.strictEqual(resolvedBoth.level, "CLEAR");
  assert.strictEqual(resolvedBoth.mitigatedPoints, 60);
  assert.strictEqual(resolvedBoth.resolvedCount, 2);
});
