import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/lib/supabaseServer";
import {
  REPORTS_BUCKET,
  buildReportPath,
} from "@/lib/storage";
import { extractReport } from "@/lib/gemini";
import type { ReportRow } from "@/lib/types";

// POST /api/reports/upload — Multipart form upload. Accepts a single
// `file` field (JPG/PNG).
//
// Flow (see docs/ARCHITECTURE.md):
//   1. Authenticate the caller via the cookie session.
//   2. Save the ORIGINAL file first to Supabase Storage (D6: never lose a
//      report just because the AI hiccuped).
//   3. Call extractReport() against the file bytes.
//   4. Insert a `reports` row. On extraction success the AI's structured
//      fields are written; on failure the row is still inserted with
//      extraction_status="failed" and a friendly summary.
//
// We use the admin (service-role) client for the Storage write + DB insert
// so that RLS-driven policies don't need a separate UPDATE path; the route
// itself enforces "only write on behalf of the authenticated user" by
// resolving the user from the cookie session and passing their id forward.

export const runtime = "nodejs"; // Buffer/formData require Node runtime
export const maxDuration = 60;   // Give Gemini enough time on cold starts

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  // 1. Identify the caller from their session cookie.
  const sessionClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to upload a report." },
      { status: 401 },
    );
  }

  // 2. Parse the multipart upload.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Could not parse the upload (expected multipart/form-data)." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing 'file' field in the upload." },
      { status: 400 },
    );
  }

  if (!ACCEPTED_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        error: `Unsupported file type "${file.type || "unknown"}". Use JPG or PNG.`,
      },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB).` },
      { status: 413 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name?.trim() || "report.jpg";
  const reportId = randomUUID();
  const filePath = buildReportPath(user.id, reportId, safeName);

  // 3. Save the original FIRST. After this point the user never loses
  //    the file, regardless of what the AI does (D6).
  const admin = createSupabaseAdminClient();
  const { error: uploadError } = await admin.storage
    .from(REPORTS_BUCKET)
    .upload(filePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload failed:", uploadError);
    return NextResponse.json(
      { error: `Could not save the file: ${uploadError.message}` },
      { status: 500 },
    );
  }

  // 4. Try to extract structured data from the image.
  const extraction = await extractReport(bytes.toString("base64"), file.type);

  // 5. Map the result onto the `reports` row shape.
  const baseRow = {
    id: reportId,
    user_id: user.id,
    file_path: filePath,
    source: "upload" as const,
  };

  let rowPayload: Partial<ReportRow>;
  if (extraction.status === "done" && extraction.data) {
    const d = extraction.data;
    rowPayload = {
      ...baseRow,
      report_type: d.reportType?.trim() || null,
      report_date: parseDate(d.date),
      doctor_or_hospital: d.doctorOrHospital?.trim() || null,
      summary: d.summary?.trim() || null,
      results: d.results ?? [],
      extraction_status: "done",
    };
  } else {
    rowPayload = {
      ...baseRow,
      report_type: null,
      report_date: null,
      doctor_or_hospital: null,
      summary: "We saved the file but could not read this report automatically.",
      results: [],
      extraction_status: "failed",
    };
  }

  const { data: inserted, error: insertError } = await admin
    .from("reports")
    .insert(rowPayload)
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("Insert failed:", insertError);
    // The file IS stored — surface the row id so the UI can show the upload
    // succeeded even if metadata didn't take.
    return NextResponse.json(
      {
        error: `Saved the file but failed to write the report row: ${
          insertError?.message ?? "unknown"
        }`,
        reportId,
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { reportId: inserted.id, status: rowPayload.extraction_status },
    { status: 201 },
  );
}

// Accept YYYY-MM-DD loosely; anything else becomes null so we never
// store junk in a date column.
function parseDate(s: string | undefined | null): string | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  const dt = new Date(`${y}-${mo}-${d}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return null;
  return `${y}-${mo}-${d}`;
}
