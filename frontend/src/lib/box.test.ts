import test from "node:test";
import assert from "node:assert/strict";
import { box2dToStyle } from "./box.ts";

test("box2dToStyle converts contract example [120, 340, 680, 810]", () => {
  // [ymin, xmin, ymax, xmax] integers 0-1000
  // Contract: top 12%; left 34%; height 56%; width 47%
  const style = box2dToStyle([120, 340, 680, 810]);
  assert.deepStrictEqual(style, {
    top: "12%",
    left: "34%",
    height: "56%",
    width: "47%",
  });
});

test("box2dToStyle handles full-frame bounds [0, 0, 1000, 1000]", () => {
  const style = box2dToStyle([0, 0, 1000, 1000]);
  assert.deepStrictEqual(style, {
    top: "0%",
    left: "0%",
    height: "100%",
    width: "100%",
  });
});

test("box2dToStyle handles fixture ladder hazard [450, 80, 920, 280]", () => {
  const style = box2dToStyle([450, 80, 920, 280]);
  assert.deepStrictEqual(style, {
    top: "45%",
    left: "8%",
    height: "47%",
    width: "20%",
  });
});
