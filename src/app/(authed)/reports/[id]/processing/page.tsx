// Full-bleed processing screen for in-flight extractions. Mockup 04/05.
// The status message polls /api/reports/<id>/status until the row is
// `done`, then redirects to /reports/<id>.

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import Logo from "@/components/Logo";
import ProcessingPanel from "@/components/ProcessingPanel";

export const dynamic = "force-dynamic";

export default async function ProcessingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("reports")
    .select("id, extraction_status, report_type")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  // Already done? Skip the panel and go straight to the detail page.
  if (row?.extraction_status === "done") {
    redirect(`/reports/${id}`);
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-mint px-6 py-16 lg:rounded-[2.5rem]">
      <div className="mb-10">
        <Logo size="lg" />
      </div>
      <ProcessingPanel
        reportId={id}
        hintType={row?.report_type ?? null}
      />
    </div>
  );
}