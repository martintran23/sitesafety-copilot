import test from "node:test";
import assert from "node:assert/strict";
import { riskColor, SEVERITY_STYLES } from "./severity.ts";
import type { Severity } from "./types.ts";

test("riskColor maps severity levels to expected Tailwind color classes", () => {
  assert.strictEqual(riskColor("CRITICAL"), "text-red-400");
  assert.strictEqual(riskColor("HIGH"), "text-orange-400");
  assert.strictEqual(riskColor("MEDIUM"), "text-amber-300");
  assert.strictEqual(riskColor("MODERATE"), "text-amber-300");
  assert.strictEqual(riskColor("LOW"), "text-emerald-400");
  assert.strictEqual(riskColor("UNKNOWN"), "text-emerald-400");
});

test("SEVERITY_STYLES covers all Severity union variants", () => {
  const expectedSeverities: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  for (const sev of expectedSeverities) {
    const style = SEVERITY_STYLES[sev];
    assert.ok(style, `Missing severity style for ${sev}`);
    assert.ok(typeof style.box === "string" && style.box.length > 0);
    assert.ok(typeof style.badge === "string" && style.badge.length > 0);
    assert.ok(typeof style.dot === "string" && style.dot.length > 0);
  }
});
