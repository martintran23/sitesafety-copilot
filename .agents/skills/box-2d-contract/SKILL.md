---
name: box-2d-contract
description: Use when touching bounding boxes, box_2d, InspectionCanvas, HazardSidebar, hazard schemas, or the inspect API response shape.
---

# box_2d Spatial Contract

## Format
`box_2d = [ymin, xmin, ymax, xmax]`, integers 0-1000, relative to the full image.

## Backend validation (Pydantic v2)
- Exactly 4 ints, each clamped to `[0, 1000]`.
- `ymin < ymax` and `xmin < xmax`.
- Mock service and live Bedrock output must produce the identical JSON shape.

## Frontend conversion (percentages only)
```
top    = ymin / 10 %
left   = xmin / 10 %
height = (ymax - ymin) / 10 %
width  = (xmax - xmin) / 10 %
```
Example: `[120, 340, 680, 810]` -> `top 12%; left 34%; height 56%; width 47%`.

## Checklist
- Boxes are children of a `position: relative` image container, absolutely positioned with % values. Never pixels.
- Selecting a box highlights the sidebar item, and vice versa.
- Do not change response keys: `overall_risk_score`, `risk_level`, `hazards[]`, `audio_response_script`, `foreman_transcript_used`.
- Test the conversion with the example above.
