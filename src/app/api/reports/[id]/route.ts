// DELETE /api/reports/[id] — permanently remove one report and its scan.
//
// Ownership is enforced twice: the RLS policy ("users manage own reports",
// `for all`) already scopes every statement to auth.uid(), and we also filter
// on user_id explicitly so a policy regression can't turn this into a
// cross-tenant delete.
//
// Order matters. The row goes first: if storage removal then fails we are left
// with an orphaned file, which is invisible to the user and cleanable later.
// Deleting the file first would risk the opposite — a surviving row pointing at
// a missing scan, which renders as a broken detail page.

import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/lib/supabaseServer";
import { REPORTS_BUCKET } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to delete a report." },
      { status: 401 },
    );
  }

  // Read the row first so we know which object to clean up. Also doubles as
  // the existence + ownership check, so a wrong id returns 404 rather than a
  // silent no-op success.
  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("id, file_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("Report lookup failed during delete:", fetchError);
    return NextResponse.json(
      { error: "Could not load that report. Please try again." },
      { status: 500 },
    );
  }

  if (!report) {
    return NextResponse.json(
      { error: "That report doesn't exist, or isn't yours." },
      { status: 404 },
    );
  }

  const { error: deleteError } = await supabase
    .from("reports")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Report delete failed:", deleteError);
    return NextResponse.json(
      { error: `Could not delete the report: ${deleteError.message}` },
      { status: 500 },
    );
  }

  // Best-effort scan cleanup. The bucket grants users SELECT only, so removal
  // needs the service-role client — the same one that wrote the file on upload.
  // Partner-hospital reports have no file_path and skip this entirely.
  if (report.file_path) {
    try {
      const admin = createSupabaseAdminClient();
      const { error: removeError } = await admin.storage
        .from(REPORTS_BUCKET)
        .remove([report.file_path]);
      if (removeError) {
        console.error("Storage remove failed after report delete:", removeError);
      }
    } catch (e) {
      console.error("Unexpected storage error after report delete:", e);
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
