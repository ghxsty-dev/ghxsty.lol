import { NextResponse, type NextRequest } from "next/server";
import { ensureUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.session) {
      await supabase.auth.setSession(data.session);
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await ensureUserProfile(supabase, user);
    }
  }

  const redirectTo = next.startsWith("/") ? next : "/dashboard";
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
