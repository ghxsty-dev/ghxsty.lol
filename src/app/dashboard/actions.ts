"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_PROFILE_LINKS } from "@/lib/limits";
import {
  createCommunityThemeSnapshot,
  createProfileThemeApplication,
} from "@/lib/community-theme";
import { ensureUserProfile } from "@/lib/profile";
import {
  deleteR2ObjectByUrl,
  getR2ObjectKeyFromUrl,
  uploadR2Object,
} from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";
import { normalizeUsername } from "@/lib/utils";
import {
  getAudioContentType,
  validateAudio,
  validateImage,
  validateUsername,
} from "@/lib/validation";
import type { ProfileTheme } from "@/types/database";

export type DashboardState = {
  error?: string;
  success?: string;
};

export type LinkState = DashboardState;

export type ThemeState = DashboardState;

export async function completeUsernameSetupAction(
  _prevState: DashboardState,
  formData: FormData,
): Promise<DashboardState> {
  const { supabase, profile } = await getOwnedProfile();
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const usernameError = validateUsername(username);

  if (usernameError) {
    return { error: usernameError };
  }

  const displayName = String(formData.get("display_name") ?? "").trim();
  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: displayName || username,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Bu kullanıcı adı zaten alınmış."
          : `Kullanıcı adı kaydedilemedi: ${error.message}`,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
  revalidatePath(`/${username}`);
  return { success: "Kullanıcı adı kaydedildi." };
}

async function getOwnedProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    redirect("/login");
  }

  const resolvedProfile = profile ?? (await ensureUserProfile(supabase, user));

  if (!resolvedProfile) {
    redirect("/login");
  }

  return { supabase, profile: resolvedProfile };
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

function getCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getOptionalUuid(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function getVolumePosition(formData: FormData) {
  const value = String(formData.get("music_volume_position") ?? "top-right");
  return ["top-right", "top-left", "bottom-right", "bottom-left"].includes(value)
    ? value
    : "top-right";
}

function getSupabaseStoragePathFromPublicUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const marker = "/storage/v1/object/public/profile-media/";
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(
      parsedUrl.pathname.slice(markerIndex + marker.length),
    );
  } catch {
    return null;
  }
}

async function deleteProfileMediaQuietly(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url?: string | null,
) {
  try {
    const key = getR2ObjectKeyFromUrl(url);
    if (key?.startsWith("community-themes/")) {
      return;
    }

    await deleteR2ObjectByUrl(url);
  } catch {
    // A stale R2 object should not block the profile update the user just made.
  }

  const supabasePath = getSupabaseStoragePathFromPublicUrl(url);
  if (!supabasePath) {
    return;
  }

  try {
    await supabase.storage.from("profile-media").remove([supabasePath]);
  } catch {
    // Legacy Supabase Storage cleanup is best-effort during the R2 migration.
  }
}

export async function updateProfileAction(
  _prevState: DashboardState,
  formData: FormData,
): Promise<DashboardState> {
  const { supabase, profile } = await getOwnedProfile();
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const usernameError = validateUsername(username);

  if (usernameError) {
    return { error: usernameError };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      avatar_decoration_id: getOptionalUuid(formData, "avatar_decoration_id"),
      display_name: String(formData.get("display_name") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim(),
      music_title: String(formData.get("music_title") ?? "").trim(),
      music_show_volume: getCheckbox(formData, "music_show_volume"),
      music_volume_position: getVolumePosition(formData),
      discord_show_presence: getCheckbox(formData, "discord_show_presence"),
      theme: String(formData.get("theme") ?? "dark") as ProfileTheme,
      accent_color: getColor(formData, "accent_color", "#ffffff"),
      page_background_color: getColor(
        formData,
        "page_background_color",
        "#050507",
      ),
      panel_background_color: getColor(
        formData,
        "panel_background_color",
        "#111113",
      ),
      text_color: getColor(formData, "text_color", "#ffffff"),
      muted_text_color: getColor(formData, "muted_text_color", "#d4d4d8"),
      button_background_color: getColor(
        formData,
        "button_background_color",
        "#ffffff",
      ),
      button_text_color: getColor(formData, "button_text_color", "#ffffff"),
      header_enabled: getCheckbox(formData, "header_enabled"),
      header_background_style: String(
        formData.get("header_background_style") ?? "gradient",
      ).trim(),
      header_color: getColor(formData, "header_color", "#74d9bf"),
      header_color_to: getColor(formData, "header_color_to", "#2f9d8f"),
      panel_visible: getCheckbox(formData, "panel_visible"),
      links_icon_only: getCheckbox(formData, "links_icon_only"),
      background_blur: getRangeNumber(formData, "background_blur", 10, 0, 40),
      panel_opacity: getRangeNumber(formData, "panel_opacity", 70, 10, 100),
      button_opacity: getRangeNumber(formData, "button_opacity", 12, 0, 100),
      panel_radius: getRangeNumber(formData, "panel_radius", 8, 0, 32),
      button_radius: getRangeNumber(formData, "button_radius", 6, 0, 32),
      background_style: String(formData.get("background_style") ?? "soft").trim(),
      button_style: String(formData.get("button_style") ?? "glass").trim(),
      font_style: String(formData.get("font_style") ?? "clean").trim(),
      display_name_effect: String(
        formData.get("display_name_effect") ?? "none",
      ).trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Bu kullanıcı adı zaten alınmış."
          : `Profil güncellenemedi: ${error.message}`,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
  revalidatePath(`/${username}`);
  return { success: "Profil güncellendi." };
}

export async function submitCommunityThemeAction(
  _prevState: ThemeState,
  formData: FormData,
): Promise<ThemeState> {
  const { supabase, profile } = await getOwnedProfile();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (name.length < 3 || name.length > 40) {
    return { error: "Tema adı 3-40 karakter olmalı." };
  }

  const { error } = await supabase.from("community_themes").insert({
    author_profile_id: profile.id,
    name,
    description: description || null,
    status: "pending",
    approved_by_profile_id: null,
    approved_at: null,
    ...(await createCommunityThemeSnapshot(profile)),
  });

  if (error) {
    return { error: `Tema gönderilemedi: ${error.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: "Tema gönderildi. Admin onayından sonra yayınlanacak." };
}

export async function applyCommunityThemeAction(formData: FormData) {
  const { supabase, profile } = await getOwnedProfile();
  const themeId = String(formData.get("theme_id") ?? "");

  const { data: theme, error } = await supabase
    .from("community_themes")
    .select("*")
    .eq("id", themeId)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !theme) {
    revalidatePath("/dashboard");
    return;
  }

  await supabase
    .from("profiles")
    .update(await createProfileThemeApplication(theme, profile))
    .eq("id", profile.id);

  await deleteProfileMediaQuietly(supabase, profile.banner_url);
  await deleteProfileMediaQuietly(supabase, profile.music_url);

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
}

export async function uploadImageAction(
  _prevState: DashboardState,
  formData: FormData,
): Promise<DashboardState> {
  const { supabase, profile } = await getOwnedProfile();
  const field = String(formData.get("field"));
  const file = formData.get("file");

  if (field !== "avatar_url" && field !== "banner_url") {
    return { error: "Geçersiz görsel alanı." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Lütfen bir görsel seçin." };
  }

  const imageError = validateImage(file);
  if (imageError) {
    return { error: imageError };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${profile.user_id}/images/${field}-${Date.now()}.${extension}`;
  let publicUrl: string;

  try {
    publicUrl = await uploadR2Object({
      key: path,
      file,
      contentType: file.type,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `Görsel yüklenemedi: ${error.message}`
          : "Görsel yüklenemedi.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ [field]: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", profile.id);

  if (error) {
    await deleteProfileMediaQuietly(supabase, publicUrl);
    return { error: "Profil görseli kaydedilemedi." };
  }

  await deleteProfileMediaQuietly(supabase, profile[field]);

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
  return { success: "Görsel yüklendi." };
}

export async function removeImageAction(formData: FormData) {
  const { supabase, profile } = await getOwnedProfile();
  const field = String(formData.get("field"));

  if (field !== "banner_url") {
    return;
  }

  await supabase
    .from("profiles")
    .update({ [field]: null, updated_at: new Date().toISOString() })
    .eq("id", profile.id);

  await deleteProfileMediaQuietly(supabase, profile[field]);

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
}

export async function uploadMusicAction(
  _prevState: DashboardState,
  formData: FormData,
): Promise<DashboardState> {
  const { supabase, profile } = await getOwnedProfile();
  const file = formData.get("file");
  const musicTitle = String(formData.get("music_title") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Lütfen bir şarkı seçin." };
  }

  const audioError = validateAudio(file);
  if (audioError) {
    return { error: audioError };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "mp3";
  const path = `${profile.user_id}/music/music-${Date.now()}.${extension}`;
  const contentType = getAudioContentType(file);
  let publicUrl: string;

  try {
    publicUrl = await uploadR2Object({
      key: path,
      file,
      contentType,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `Şarkı yüklenemedi: ${error.message}`
          : "Şarkı yüklenemedi.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      music_url: publicUrl,
      music_title: musicTitle || file.name.replace(/\.[^.]+$/, ""),
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (error) {
    await deleteProfileMediaQuietly(supabase, publicUrl);
    return { error: "Şarkı profile kaydedilemedi." };
  }

  await deleteProfileMediaQuietly(supabase, profile.music_url);

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
  return { success: "Şarkı yüklendi." };
}

export async function removeMusicAction(): Promise<void> {
  const { supabase, profile } = await getOwnedProfile();

  await supabase
    .from("profiles")
    .update({
      music_url: null,
      music_title: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  await deleteProfileMediaQuietly(supabase, profile.music_url);

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
}

export async function disconnectDiscordAction() {
  const { supabase, profile } = await getOwnedProfile();

  await supabase
    .from("profiles")
    .update({
      discord_id: null,
      discord_username: null,
      discord_global_name: null,
      discord_avatar_url: null,
      discord_banner_url: null,
      discord_accent_color: null,
      discord_show_presence: true,
      discord_connected_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
}

export async function addLinkAction(
  _prevState: LinkState,
  formData: FormData,
): Promise<LinkState> {
  const { supabase, profile } = await getOwnedProfile();
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();

  if (!title || !url) {
    return { error: "Başlık ve URL gerekli." };
  }

  const { count } = await supabase
    .from("profile_links")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profile.id);

  if ((count ?? 0) >= MAX_PROFILE_LINKS) {
    return { error: `En fazla ${MAX_PROFILE_LINKS} link ekleyebilirsin.` };
  }

  const { error } = await supabase.from("profile_links").insert({
    profile_id: profile.id,
    title,
    url,
    icon,
    position: count ?? 0,
  });

  if (error) {
    return { error: "Link eklenemedi." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
  return { success: "Link eklendi." };
}

export async function deleteLinkAction(formData: FormData) {
  const { supabase, profile } = await getOwnedProfile();
  const id = String(formData.get("id") ?? "");
  await supabase.from("profile_links").delete().eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
}

export async function reorderLinksAction(ids: string[]) {
  const { supabase, profile } = await getOwnedProfile();

  await Promise.all(
    ids.map((id, position) =>
      supabase.from("profile_links").update({ position }).eq("id", id),
    ),
  );

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);
}
