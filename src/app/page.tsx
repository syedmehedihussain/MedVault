import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

// Root entry: send logged-in users to the dashboard, everyone else to the
// pre-login splash screen.
export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }
  redirect("/welcome");
}
