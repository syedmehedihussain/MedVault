// Shared types for MedVault. See docs/DATA_MODEL.md.

export interface ExtractedResult {
  test: string;
  value: string;
  unit: string;
  normalRange: string;
}

export interface ExtractedReport {
  reportType: string;
  date: string;
  doctorOrHospital: string;
  results: ExtractedResult[];
  summary: string;
}

// Row shape stored in the `reports` table (Supabase Postgres).
// See docs/DATA_MODEL.md for the column list.
export interface ReportRow {
  id: string;
  user_id: string;
  created_at: string;
  report_type: string | null;
  report_date: string | null;
  doctor_or_hospital: string | null;
  summary: string | null;
  results: ExtractedResult[];
  file_path: string | null;
  source: "upload" | "partner_hospital" | null;
  extraction_status: "done" | "failed";
}

// Return shape from src/lib/gemini.ts → extractReport().
export type ExtractionResult =
  | { data: ExtractedReport; status: "done" }
  | { data: null; status: "failed" };