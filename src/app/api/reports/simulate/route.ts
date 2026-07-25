// /api/reports/simulate — D7: drop a plausible-looking report into the
// current user's vault so the demo flow can show "import from partner
// hospital" without a real hospital integration. Returns the new reportId
// so the client can route to /processing.

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabaseServer";
import { REPORTS_BUCKET, buildReportPath } from "@/lib/storage";

export const runtime = "nodejs";

const MOCK_REPORT = {
  report_type: "Lipid Panel",
  report_date: new Date().toISOString().slice(0, 10),
  doctor_or_hospital: "St. Mary's General Hospital",
  summary:
    "Total cholesterol is mildly elevated; LDL slightly above the recommended range. HDL and triglycerides are within normal limits. Follow-up in three months recommended.",
  results: [
    { test: "Total Cholesterol", value: "215", unit: "mg/dL", normalRange: "<200" },
    { test: "LDL", value: "142", unit: "mg/dL", normalRange: "<100" },
    { test: "HDL", value: "48", unit: "mg/dL", normalRange: ">40" },
    { test: "Triglycerides", value: "125", unit: "mg/dL", normalRange: "<150" },
  ],
};

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reportId = randomUUID();
  const filePath = buildReportPath(user.id, reportId, "partner-hospital.txt");

  // Upload a small placeholder text file so the row has a valid file_path.
  // Real partner-hospital files would come in via the partner API.
  try {
    const admin = createSupabaseAdminClient();
    const body = Buffer.from(
      `Partner hospital simulated report\n` +
        `Patient: ${user.email}\n` +
        `Report type: ${MOCK_REPORT.report_type}\n` +
        `Date: ${MOCK_REPORT.report_date}\n` +
        `Summary: ${MOCK_REPORT.summary}\n`,
      "utf8",
    );
    await admin.storage
      .from(REPORTS_BUCKET)
      .upload(filePath, body, { contentType: "text/plain", upsert: false });
  } catch (e) {
    console.error("simulate upload failed:", e);
    // Non-fatal — the row still gets created below; signed URL will simply 404.
  }

  const { data: inserted, error } = await supabase
    .from("reports")
    .insert({
      id: reportId,
      user_id: user.id,
      report_type: MOCK_REPORT.report_type,
      report_date: MOCK_REPORT.report_date,
      doctor_or_hospital: MOCK_REPORT.doctor_or_hospital,
      summary: MOCK_REPORT.summary,
      results: MOCK_REPORT.results,
      file_path: filePath,
      source: "partner_hospital",
      extraction_status: "done",
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to insert report" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { reportId: inserted.id, status: "done" },
    { status: 201 },
  );
}