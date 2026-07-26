# AI Integration — Google Gemini (Free)

MedVault uses **Google Gemini Flash** to read a report image and return structured JSON. The free tier needs no credit card.

## 1. Get a key
1. Go to Google AI Studio (aistudio.google.com).
2. Sign in with a Google account → "Get API key" → create key.
3. Put it in `.env` as `GEMINI_API_KEY`. Also add it to Vercel's environment variables before deploying.

## 2. Model
Use a free multimodal Flash model — currently `gemini-2.5-flash` (or `gemini-2.5-flash-lite` for even lighter usage). Free-tier model names and quotas change; if a call fails with a model/quota error, check the current free model in Google AI Studio and update the `model` string. Flash models read images/documents on the free tier — this is *reading*, not image generation, so it's free.

## 3. Install
```
npm install @google/genai
```

## 4. Extraction function (`src/lib/gemini.ts`)
```ts
import { GoogleGenAI } from "@google/genai";
import type { ExtractedReport } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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

export async function extractReport(
  base64Image: string,
  mimeType: string
): Promise<{ data: ExtractedReport | null; status: "done" | "failed" }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        { inlineData: { mimeType, data: base64Image } },
        { text: EXTRACTION_PROMPT },
      ],
    });

    let text = response.text?.trim() ?? "";
    // Strip accidental ```json fences if present.
    text = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();

    const data = JSON.parse(text) as ExtractedReport;
    return { data, status: "done" };
  } catch (err) {
    console.error("Gemini extraction failed:", err);
    return { data: null, status: "failed" };
  }
}
```

## 5. How the upload route uses it
1. Receive the uploaded file.
2. Upload the original to Supabase Storage → get `file_path`.
3. Convert the file to base64, call `extractReport(base64, mimeType)`.
4. If `status === "done"`, map `data` onto the `reports` columns (see `DATA_MODEL.md`).
5. If `status === "failed"`, still insert the row with `extraction_status = "failed"`, empty fields, and a summary like "Could not read this report automatically." The file is preserved so the user never loses it.

## 6. Robustness rules
- Never let a bad AI response crash the request — the try/catch above guarantees this.
- Always validate the parsed object has the expected keys before saving; fill missing keys with defaults.
- Keep `max output` reasonable; a report fits comfortably in Flash's limits.

## 7. Demo fallback (optional but recommended)
Add an env flag `USE_MOCK_EXTRACTION=true` that makes `extractReport` return a realistic hard-coded `ExtractedReport` instead of calling the API. If the live API is rate-limited or slow during judging, flip this on so the demo still shows the full flow. Document this in the README.

## 8. PDFs (P2, optional)
Gemini can also accept PDFs. For the MVP, restrict uploads to images (JPG/PNG). If you add PDFs later, send them as a document part instead of `inlineData` image, and update the accepted file types.
