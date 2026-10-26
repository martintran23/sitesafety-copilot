import type { Box2D } from "./types";

/** box_2d [ymin, xmin, ymax, xmax] (0-1000) -> CSS percentages. Never pixels. */
export function box2dToStyle([ymin, xmin, ymax, xmax]: Box2D) {
  return {
    top: `${ymin / 10}%`,
    left: `${xmin / 10}%`,
    height: `${(ymax - ymin) / 10}%`,
    width: `${(xmax - xmin) / 10}%`,
  };
}

// Contract example: [120, 340, 680, 810] -> top 12%; left 34%; height 56%; width 47%
