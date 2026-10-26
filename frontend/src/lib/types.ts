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

export interface ExportRequest {
  inspection_id?: string;
  site_name: string;
  foreman_name: string;
  hazards: Hazard[];
  include_narration: boolean;
  output_format?: "mp4" | "pdf";
}

export interface ExportResponse {
  download_url: string;
  duration_seconds: number;
  jha_pdf_url?: string;
  status: "ready" | "processing" | "failed";
}

export type HazardStatus = "OPEN" | "STOP_WORK" | "RESOLVED";

export interface HazardStatusUpdate {
  status: HazardStatus;
  remediationNote?: string;
  updatedAt: string;
}

export type OshaSubpartKey = "ALL" | "SUBPART_M" | "SUBPART_L" | "SUBPART_P" | "SUBPART_X" | "SUBPART_E_K" | "OTHER";

export interface SubpartMeta {
  key: OshaSubpartKey;
  label: string;
  code: string;
  title: string;
}
