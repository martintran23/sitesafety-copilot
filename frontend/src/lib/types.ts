/** Mirrors backend/app/schemas/hazard_schema.py. Do not rename response keys. */

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

/** [ymin, xmin, ymax, xmax], integers 0-1000 relative to the full image. */
export type Box2D = [number, number, number, number];

export interface Hazard {
  id: string;
  title: string;
  severity: Severity;
  severity_weight: number;
  osha_citation: string;
  description: string;
  corrective_action: string;
  box_2d: Box2D;
  confidence: number;
  audio_response_script: string;
}

export interface InspectResponse {
  overall_risk_score: number;
  risk_level: string;
  hazards: Hazard[];
  audio_response_script: string;
  mode: string;
  site_id: string | null;
  foreman_transcript_used: boolean;
}
