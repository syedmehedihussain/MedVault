import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/lib/supabaseServer";
import { REPORTS_BUCKET } from "@/lib/storage";

// POST /api/auth/delete-account — permanently delete the current user, all
// their rows, and every file they ever uploaded.
//
// Body (JSON): { password: string, confirm: string }
//
//   - `confirm` must be exactly "CONFIRM" (case-sensitive). This is a cheap
//     sanity check against accidental clicks.
//   - `password` must match the user's current password. We re-authenticate
//     with the anon client to verify it before doing anything destructive.
//
// Steps:
//   1. Identify the caller via the session cookie.
//   2. Re-verify the password against the user's email (signInWithPassword).
//   3. Delete every object under `{user_id}/` in the `reports` bucket.
//   4. Delete every `reports` row owned by the user.
//   5. Delete the auth user via the service-role admin client. This also
//      cascades to any other tables that reference auth.users.
//   6. Sign the user out, clear cookies, bounce to /welcome.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { password?: unknown; confirm?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const password = typeof body.password === "string" ? body.password : "";
  const confirm = typeof body.confirm === "string" ? body.confirm : "";

  if (confirm !== "CONFIRM") {
    return NextResponse.json(
      { error: 'Type CONFIRM (in capitals) in the confirmation box to continue.' },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      { error: "Password is required to delete your account." },
      { status: 400 },
    );
  }

  const sessionClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json(
      { error: "You must be signed in to delete your account." },
      { status: 401 },
    );
  }

  // 1. Re-verify the password. Supabase's anon client doesn't expose a
  //    "verify password" endpoint directly — signInWithPassword is the
  //    canonical way to confirm a user's credentials.
  const { error: signInError } =
    await sessionClient.auth.signInWithPassword({
      email: user.email,
      password,
    });

  if (signInError) {
    return NextResponse.json(
      { error: "That password is incorrect." },
      { status: 403 },
    );
  }

  const admin = createSupabaseAdminClient();

  // 2. Best-effort: delete every storage object under `{user_id}/`. We use
  //    list() to discover the full set, then remove() them all in a single
  //    call. Failures here are logged but do not block the user deletion —
  //    the cascade in step 4 will clear the rows, and any orphaned files
  //    are better than leaving the user with an account they wanted gone.
  try {
    const { data: objects, error: listError } = await admin.storage
      .from(REPORTS_BUCKET)
      .list(user.id, { limit: 1000 });

    if (listError) {
      console.error("Storage list failed during account deletion:", listError);
    } else if (objects && objects.length > 0) {
      // Each entry under `{user_id}/` is a `{report_id}/` folder. We have
      // to walk one level deeper to get the actual filenames.
      const filePaths: string[] = [];
      for (const folder of objects) {
        const { data: inner } = await admin.storage
          .from(REPORTS_BUCKET)
          .list(`${user.id}/${folder.name}`, { limit: 1000 });
        if (inner) {
          for (const file of inner) {
            filePaths.push(`${user.id}/${folder.name}/${file.name}`);
          }
        }
      }
      if (filePaths.length > 0) {
        const { error: removeError } = await admin.storage
          .from(REPORTS_BUCKET)
          .remove(filePaths);
        if (removeError) {
          console.error(
            "Storage remove failed during account deletion:",
            removeError,
          );
        }
      }
    }
  } catch (e) {
    console.error("Unexpected storage error during account deletion:", e);
  }

  // 3. Delete the `reports` rows. The RLS policy already restricts this to
  //    the caller, but we use the admin client so the deletion isn't blocked
  //    by session timing issues mid-shutdown.
  const { error: rowsError } = await admin
    .from("reports")
    .delete()
    .eq("user_id", user.id);

  if (rowsError) {
    console.error("Reports delete failed during account deletion:", rowsError);
    return NextResponse.json(
      {
        error: `Could not delete your reports: ${rowsError.message}. Please try again.`,
      },
      { status: 500 },
    );
  }

  // 4. Delete the auth user. This is the point of no return — after this
  //    the user's email is freed and the row in auth.users is gone.
  const { error: deleteUserError } =
    await admin.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    console.error(
      "auth.admin.deleteUser failed during account deletion:",
      deleteUserError,
    );
    return NextResponse.json(
      {
        error: `Reports were deleted but the account could not be removed: ${deleteUserError.message}. Please contact support.`,
      },
      { status: 500 },
    );
  }

  // 5. Clear the session cookie so the next request is truly anonymous.
  await sessionClient.auth.signOut();

  const origin = new URL(request.url).origin;
  return NextResponse.json(
    { ok: true, redirect: `${origin}/welcome` },
    { status: 200 },
  );
}
