import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "user" | "moderator" | "admin";

export function isAdminRole(role?: string | null) {
  return role === "admin";
}

export function isModeratorOrAdminRole(role?: string | null) {
  return role === "admin" || role === "moderator";
}

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const profile = await ensureUserProfile(supabase, user);
  return { supabase, user, profile };
}

export async function requireUser() {
  const context = await getUserProfile();
  if (!context.user || !context.profile) {
    redirect("/login");
  }

  return context as typeof context & {
    user: NonNullable<typeof context.user>;
    profile: NonNullable<typeof context.profile>;
  };
}

export async function requireModeratorOrAdmin(next?: string) {
  const context = await requireUser();
  const role = context.profile.role ?? (context.profile.is_admin ? "admin" : "user");

  if (!isModeratorOrAdminRole(role)) {
    redirect(next ?? "/dashboard");
  }

  return context;
}

export async function isAdmin(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role,is_admin")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.role === "admin" || data?.is_admin === true;
}

export async function isModeratorOrAdmin(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role,is_admin")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.role === "admin" || data?.role === "moderator" || data?.is_admin === true;
}
