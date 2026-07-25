// Placeholder dashboard. Milestone 4 will replace this with the real list
// (ReportCard grid, SearchBar, UploadButton). For now we just confirm the
// auth gate works and give the user a landing page that explains the next step.

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Your reports</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Signed in as {user?.email}
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <h2 className="text-base font-medium text-zinc-900">No reports yet</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Upload your first report to see it appear here. The upload + AI
          extraction flow arrives in the next milestone.
        </p>
      </div>
    </main>
  );
}
