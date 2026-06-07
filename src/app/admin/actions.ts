"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCommunityThemeSnapshot,
  getCommunityThemeUpdate,
} from "@/lib/community-theme";
import { ensureUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { normalizeUsername } from "@/lib/utils";
import { validateUsername } from "@/lib/validation";
import type { CommunityThemeStatus } from "@/types/database";

async function getAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const profile = await ensureUserProfile(supabase, user);
  if (!profile || (!profile.is_admin && profile.username !== "ghxsty")) {
    redirect("/dashboard");
  }

  return { supabase, adminProfile: profile };
}

function getColor(formData: FormData, key: string, fallback: string) {
  const value = String(formData.get(key) ?? fallback).trim();
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function getRangeNumber(
  formData: FormData,
  key: string,
  fallback: number,
  min: number,
  max: number,
) {
  const value = Number(formData.get(key) ?? fallback);
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

export async function setCommunityThemeStatusAction(formData: FormData) {
  const { supabase, adminProfile } = await getAdminContext();
  const themeId = String(formData.get("theme_id") ?? "");
  const status = String(formData.get("status") ?? "pending") as CommunityThemeStatus;
  const allowedStatuses: CommunityThemeStatus[] = ["pending", "approved", "rejected"];

  if (!allowedStatuses.includes(status)) {
    return;
  }

  await supabase
    .from("community_themes")
    .update({
      status,
      approved_by_profile_id: status === "approved" ? adminProfile.id : null,
      approved_at: status === "approved" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", themeId);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function deleteCommunityThemeAction(formData: FormData) {
  const { supabase } = await getAdminContext();
  const themeId = String(formData.get("theme_id") ?? "");

  await supabase.from("community_themes").delete().eq("id", themeId);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function setProfileAdminAction(formData: FormData) {
  const { supabase } = await getAdminContext();
  const profileId = String(formData.get("profile_id") ?? "");
  const isAdmin = formData.get("is_admin") === "on";

  await supabase
    .from("profiles")
    .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  revalidatePath("/admin");
}

export async function updateProfileFromAdminAction(formData: FormData) {
  const { supabase } = await getAdminContext();
  const profileId = String(formData.get("profile_id") ?? "");
  const currentUsername = String(formData.get("current_username") ?? "");
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const usernameError = validateUsername(username);

  if (usernameError) {
    revalidatePath("/admin");
    return;
  }

  await supabase
    .from("profiles")
    .update({
      username,
      display_name: String(formData.get("display_name") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim(),
      accent_color: getColor(formData, "accent_color", "#ffffff"),
      page_background_color: getColor(formData, "page_background_color", "#050507"),
      panel_background_color: getColor(formData, "panel_background_color", "#111113"),
      panel_opacity: getRangeNumber(formData, "panel_opacity", 70, 10, 100),
      button_opacity: getRangeNumber(formData, "button_opacity", 12, 0, 100),
      panel_radius: getRangeNumber(formData, "panel_radius", 8, 0, 32),
      button_radius: getRangeNumber(formData, "button_radius", 6, 0, 32),
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  revalidatePath("/admin");
  revalidatePath(`/${currentUsername}`);
  revalidatePath(`/${username}`);
}

export async function cloneProfileAsCommunityThemeAction(formData: FormData) {
  const { supabase, adminProfile } = await getAdminContext();
  const profileId = String(formData.get("profile_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 3 || name.length > 40) {
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (!profile) {
    return;
  }

  await supabase.from("community_themes").insert({
    author_profile_id: profile.id,
    name,
    description: "Admin tarafından profilden oluşturuldu.",
    status: "approved",
    approved_by_profile_id: adminProfile.id,
    approved_at: new Date().toISOString(),
    ...createCommunityThemeSnapshot(profile),
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function applyCommunityThemeToProfileAction(formData: FormData) {
  const { supabase } = await getAdminContext();
  const profileId = String(formData.get("profile_id") ?? "");
  const currentUsername = String(formData.get("current_username") ?? "");
  const themeId = String(formData.get("theme_id") ?? "");

  const { data: theme } = await supabase
    .from("community_themes")
    .select("*")
    .eq("id", themeId)
    .maybeSingle();

  if (!theme) {
    return;
  }

  await supabase
    .from("profiles")
    .update(getCommunityThemeUpdate(theme))
    .eq("id", profileId);

  revalidatePath("/admin");
  revalidatePath(`/${currentUsername}`);
}
