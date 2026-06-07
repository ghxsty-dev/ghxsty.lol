"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCommunityThemeSnapshot,
  createProfileThemeApplication,
} from "@/lib/community-theme";
import { ensureUserProfile } from "@/lib/profile";
import { deleteR2ObjectByUrl, uploadR2Object } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";
import { normalizeUsername } from "@/lib/utils";
import {
  getAudioContentType,
  validateAudio,
  validateImage,
  validateUsername,
} from "@/lib/validation";
import type { CommunityThemeStatus, ProfileTheme } from "@/types/database";

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

function getOptionalUuid(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function getText(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

function getSelectValue(formData: FormData, key: string, fallback: string, allowed: string[]) {
  const value = getText(formData, key, fallback);
  return allowed.includes(value) ? value : fallback;
}

function getThemeVisualPayload(formData: FormData) {
  return {
    theme: getSelectValue(formData, "theme", "dark", [
      "dark",
      "light",
      "midnight",
      "cyberpunk",
      "anime",
      "glass",
    ]) as ProfileTheme,
    accent_color: getColor(formData, "accent_color", "#ffffff"),
    page_background_color: getColor(formData, "page_background_color", "#050507"),
    panel_background_color: getColor(formData, "panel_background_color", "#111113"),
    text_color: getColor(formData, "text_color", "#ffffff"),
    muted_text_color: getColor(formData, "muted_text_color", "#d4d4d8"),
    button_background_color: getColor(formData, "button_background_color", "#ffffff"),
    button_text_color: getColor(formData, "button_text_color", "#ffffff"),
    header_enabled: formData.get("header_enabled") === "on",
    header_background_style: getSelectValue(formData, "header_background_style", "gradient", [
      "gradient",
      "solid",
    ]),
    header_color: getColor(formData, "header_color", "#74d9bf"),
    header_color_to: getColor(formData, "header_color_to", "#2f9d8f"),
    panel_visible: formData.get("panel_visible") === "on",
    links_icon_only: formData.get("links_icon_only") === "on",
    music_show_volume: formData.get("music_show_volume") === "on",
    music_volume_position: getSelectValue(formData, "music_volume_position", "top-right", [
      "top-right",
      "top-left",
      "bottom-right",
      "bottom-left",
    ]),
    background_blur: getRangeNumber(formData, "background_blur", 10, 0, 40),
    panel_opacity: getRangeNumber(formData, "panel_opacity", 70, 10, 100),
    button_opacity: getRangeNumber(formData, "button_opacity", 12, 0, 100),
    panel_radius: getRangeNumber(formData, "panel_radius", 8, 0, 32),
    button_radius: getRangeNumber(formData, "button_radius", 6, 0, 32),
    background_style: getSelectValue(formData, "background_style", "soft", [
      "soft",
      "grid",
      "spotlight",
      "minimal",
      "aurora",
      "scanlines",
      "vignette",
      "noise",
      "rings",
    ]),
    button_style: getSelectValue(formData, "button_style", "glass", [
      "glass",
      "solid",
      "outline",
      "neon",
      "glow",
      "shine",
      "hologram",
      "pulse",
      "lift",
      "chromatic",
      "plasma",
      "matrix",
    ]),
    font_style: getSelectValue(formData, "font_style", "clean", [
      "clean",
      "display",
      "rounded",
      "condensed",
      "elegant",
      "wide",
      "bold",
      "mono",
      "serif",
      "cyber",
      "pixel",
      "script",
      "editorial",
      "terminal",
      "impact",
      "soft-serif",
    ]),
    display_name_effect: getSelectValue(formData, "display_name_effect", "none", [
      "none",
      "gradient-shift",
      "neon-flicker",
      "glitch",
      "float",
      "shine",
      "pulse",
      "wave",
      "fire",
    ]),
  };
}

async function uploadOptionalThemeMedia({
  file,
  key,
  kind,
}: {
  file: FormDataEntryValue | null;
  key: string;
  kind: "image" | "audio";
}) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const error = kind === "image" ? validateImage(file) : validateAudio(file);
  if (error) {
    throw new Error(error);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? (kind === "image" ? "png" : "mp3");
  return uploadR2Object({
    key: `${key}.${extension}`,
    file,
    contentType: kind === "image" ? file.type : getAudioContentType(file),
  });
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
      avatar_decoration_id: getOptionalUuid(formData, "avatar_decoration_id"),
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
    ...(await createCommunityThemeSnapshot(profile)),
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function createCommunityThemeFromAdminAction(formData: FormData) {
  const { supabase, adminProfile } = await getAdminContext();
  const name = getText(formData, "name");
  const description = getText(formData, "description");

  if (name.length < 3 || name.length > 40) {
    return;
  }

  const seed = crypto.randomUUID();
  let bannerUrl: string | null = null;
  let musicUrl: string | null = null;

  try {
    bannerUrl = await uploadOptionalThemeMedia({
      file: formData.get("banner_file"),
      key: `community-themes/admin/${seed}/background`,
      kind: "image",
    });
    musicUrl = await uploadOptionalThemeMedia({
      file: formData.get("music_file"),
      key: `community-themes/admin/${seed}/music`,
      kind: "audio",
    });
  } catch {
    if (bannerUrl) {
      await deleteR2ObjectByUrl(bannerUrl);
    }
    return;
  }

  const { error } = await supabase.from("community_themes").insert({
    author_profile_id: adminProfile.id,
    name,
    description: description || "Admin tarafından oluşturuldu.",
    status: "approved",
    approved_by_profile_id: adminProfile.id,
    approved_at: new Date().toISOString(),
    banner_url: bannerUrl,
    music_url: musicUrl,
    music_title: getText(formData, "music_title") || null,
    ...getThemeVisualPayload(formData),
  });

  if (error) {
    await Promise.all([
      deleteR2ObjectByUrl(bannerUrl),
      deleteR2ObjectByUrl(musicUrl),
    ]);
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/themes");
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("id", profileId)
    .maybeSingle();

  if (!profile) {
    return;
  }

  await supabase
    .from("profiles")
    .update(await createProfileThemeApplication(theme, profile))
    .eq("id", profileId);

  revalidatePath("/admin");
  revalidatePath(`/${currentUsername}`);
}

export async function updateCommunityThemeAction(formData: FormData) {
  const { supabase, adminProfile } = await getAdminContext();
  const themeId = String(formData.get("theme_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "pending") as CommunityThemeStatus;
  const allowedStatuses: CommunityThemeStatus[] = ["pending", "approved", "rejected"];

  if (name.length < 3 || name.length > 40 || !allowedStatuses.includes(status)) {
    return;
  }

  await supabase
    .from("community_themes")
    .update({
      name,
      description: description || null,
      status,
      accent_color: getColor(formData, "accent_color", "#ffffff"),
      page_background_color: getColor(formData, "page_background_color", "#050507"),
      panel_background_color: getColor(formData, "panel_background_color", "#111113"),
      button_background_color: getColor(formData, "button_background_color", "#ffffff"),
      button_text_color: getColor(formData, "button_text_color", "#ffffff"),
      header_color: getColor(formData, "header_color", "#74d9bf"),
      header_color_to: getColor(formData, "header_color_to", "#2f9d8f"),
      background_blur: getRangeNumber(formData, "background_blur", 10, 0, 40),
      panel_opacity: getRangeNumber(formData, "panel_opacity", 70, 10, 100),
      button_opacity: getRangeNumber(formData, "button_opacity", 12, 0, 100),
      panel_radius: getRangeNumber(formData, "panel_radius", 8, 0, 32),
      button_radius: getRangeNumber(formData, "button_radius", 6, 0, 32),
      background_style: String(formData.get("background_style") ?? "soft"),
      button_style: String(formData.get("button_style") ?? "glass"),
      font_style: String(formData.get("font_style") ?? "clean"),
      display_name_effect: String(formData.get("display_name_effect") ?? "none"),
      approved_by_profile_id: status === "approved" ? adminProfile.id : null,
      approved_at: status === "approved" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", themeId);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/themes");
}

export async function createAvatarDecorationAction(formData: FormData) {
  const { supabase, adminProfile } = await getAdminContext();
  const name = String(formData.get("name") ?? "").trim();
  const file = formData.get("file");

  if (name.length < 2 || name.length > 40) {
    return;
  }

  if (!(file instanceof File) || file.size === 0) {
    return;
  }

  const imageError = validateImage(file);
  if (imageError) {
    return;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const imageUrl = await uploadR2Object({
    key: `avatar-decorations/${crypto.randomUUID()}.${extension}`,
    file,
    contentType: file.type,
  });

  await supabase.from("avatar_decorations").insert({
    name,
    image_url: imageUrl,
    is_active: formData.get("is_active") === "on",
    created_by_profile_id: adminProfile.id,
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function updateAvatarDecorationAction(formData: FormData) {
  const { supabase } = await getAdminContext();
  const decorationId = String(formData.get("decoration_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const file = formData.get("file");

  if (name.length < 2 || name.length > 40) {
    return;
  }

  const { data: current } = await supabase
    .from("avatar_decorations")
    .select("image_url")
    .eq("id", decorationId)
    .maybeSingle();

  const updateData: {
    name: string;
    is_active: boolean;
    image_url?: string;
    updated_at: string;
  } = {
    name,
    is_active: formData.get("is_active") === "on",
    updated_at: new Date().toISOString(),
  };

  if (file instanceof File && file.size > 0) {
    const imageError = validateImage(file);
    if (imageError) {
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
    updateData.image_url = await uploadR2Object({
      key: `avatar-decorations/${decorationId}-${Date.now()}.${extension}`,
      file,
      contentType: file.type,
    });
  }

  await supabase
    .from("avatar_decorations")
    .update(updateData)
    .eq("id", decorationId);

  if (updateData.image_url) {
    await deleteR2ObjectByUrl(current?.image_url);
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function deleteAvatarDecorationAction(formData: FormData) {
  const { supabase } = await getAdminContext();
  const decorationId = String(formData.get("decoration_id") ?? "");

  const { data: current } = await supabase
    .from("avatar_decorations")
    .select("image_url")
    .eq("id", decorationId)
    .maybeSingle();

  await supabase
    .from("profiles")
    .update({ avatar_decoration_id: null, updated_at: new Date().toISOString() })
    .eq("avatar_decoration_id", decorationId);

  await supabase.from("avatar_decorations").delete().eq("id", decorationId);
  await deleteR2ObjectByUrl(current?.image_url);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function clearCommunityThemeMediaAction(formData: FormData) {
  const { supabase } = await getAdminContext();
  const themeId = String(formData.get("theme_id") ?? "");
  const field = String(formData.get("field") ?? "");

  if (field !== "banner_url" && field !== "music_url") {
    return;
  }

  const { data: theme } = await supabase
    .from("community_themes")
    .select("banner_url, music_url")
    .eq("id", themeId)
    .maybeSingle();

  const oldUrl = field === "banner_url" ? theme?.banner_url : theme?.music_url;
  await supabase
    .from("community_themes")
    .update({
      [field]: null,
      ...(field === "music_url" ? { music_title: null } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", themeId);

  await deleteR2ObjectByUrl(oldUrl);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/themes");
}
