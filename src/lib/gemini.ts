// Google Gemini Flash extraction. See docs/AI_INTEGRATION.md.
//
// Reads a medical-report image (base64 + mime) and returns an
// ExtractedReport in the exact shape the upload route expects. A bad AI
// response NEVER throws out of this function — the upload route depends on
// that to guarantee the original file is always saved (D6).

import { GoogleGenAI } from "@google/genai";
import type { ExtractedReport } from "./types";

export type ExtractionResult =
  | { data: ExtractedReport; status: "done" }
  | { data: null; status: "failed" };

const EXTRACTION_PROMPT = `You are reading a medical report image.
Return ONLY valid JSON, no markdown, no commentary, in exactly this shape:
{
  "reportType": "",
  "date": "",
  "doctorOrHospital": "",
  "results": [{ "test": "", "value": "", "unit": "", "normalRange": "" }],
  "summary": ""
}
Rules:
- "date" should be YYYY-MM-DD if a date is visible, otherwise "".
- "results" is every test/measurement you can read, each with its value, unit, and normal range if shown. If none, use [].
- "summary" is 1-2 plain-language sentences a non-doctor can understand.
- Use "" for any field you cannot read. Never invent values.`;

// Realistic hard-coded report used when USE_MOCK_EXTRACTION=true (D9).
// Useful for live demos if Gemini rate-limits mid-judging.
const MOCK_REPORT: ExtractedReport = {
  reportType: "Complete Blood Count",
  date: "2026-07-20",
  doctorOrHospital: "City Lab Diagnostics",
  results: [
    { test: "Hemoglobin", value: "14.2", unit: "g/dL", normalRange: "13.0-17.0" },
    { test: "WBC", value: "6.8", unit: "10^3/uL", normalRange: "4.0-11.0" },
    { test: "Platelets", value: "245", unit: "10^3/uL", normalRange: "150-400" },
    { test: "RBC", value: "5.1", unit: "10^6/uL", normalRange: "4.5-5.5" },
  ],
  summary:
    "Complete blood count is within normal ranges across all measured values.",
};

export async function extractReport(
  base64Image: string,
  mimeType: string,
): Promise<ExtractionResult> {
  // Demo safety net (D9): skip the live API and return realistic hard-coded data.
  if (process.env.USE_MOCK_EXTRACTION === "true") {
    return { data: MOCK_REPORT, status: "done" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return { data: null, status: "failed" };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      // Use the rolling free-tier aliases rather than pinned versions —
      // Google retires `gemini-2.5-flash*` for new accounts and rejects
      // pinned names with 404. `*-latest` aliases stay on the free tier
      // and accept the same multimodal input. If you switch to a paid
      // key, pin a specific version here for reproducibility.
      model: "gemini-flash-lite-latest",
      contents: [
        { inlineData: { mimeType, data: base64Image } },
        { text: EXTRACTION_PROMPT },
      ],
    });

    let text = response.text?.trim() ?? "";
    // Strip accidental ```json fences if present.
    text = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();

    if (!text) {
      console.error("Gemini returned an empty response");
      return { data: null, status: "failed" };
    }

    const parsed = JSON.parse(text) as Partial<ExtractedReport>;

    // Defensive defaults so downstream code can rely on the shape.
    const data: ExtractedReport = {
      reportType: typeof parsed.reportType === "string" ? parsed.reportType : "",
      date: typeof parsed.date === "string" ? parsed.date : "",
      doctorOrHospital:
        typeof parsed.doctorOrHospital === "string"
          ? parsed.doctorOrHospital
          : "",
      results: Array.isArray(parsed.results)
        ? parsed.results.map((r) => ({
            test: typeof r?.test === "string" ? r.test : "",
            value: typeof r?.value === "string" ? r.value : "",
            unit: typeof r?.unit === "string" ? r.unit : "",
            normalRange:
              typeof r?.normalRange === "string" ? r.normalRange : "",
          }))
        : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
    };

    return { data, status: "done" };
  } catch (err) {
    console.error("Gemini extraction failed:", err);
    return { data: null, status: "failed" };
  }
}