import type { CommunityTheme, Profile, ProfileTheme } from "@/types/database";
import { copyR2ObjectByUrl } from "@/lib/r2";

export const COMMUNITY_THEME_FIELDS = [
  "banner_url",
  "music_url",
  "music_title",
  "music_show_volume",
  "music_volume_position",
  "theme",
  "accent_color",
  "page_background_color",
  "panel_background_color",
  "text_color",
  "muted_text_color",
  "button_background_color",
  "button_text_color",
  "header_enabled",
  "header_background_style",
  "header_color",
  "header_color_to",
  "panel_visible",
  "links_icon_only",
  "background_blur",
  "panel_opacity",
  "button_opacity",
  "panel_radius",
  "button_radius",
  "background_style",
  "button_style",
  "font_style",
  "display_name_effect",
] as const;

export type CommunityThemeField = (typeof COMMUNITY_THEME_FIELDS)[number];

function getExtensionFromUrl(url?: string | null, fallback = "bin") {
  if (!url) {
    return fallback;
  }

  try {
    const path = new URL(url).pathname;
    return path.split(".").pop()?.toLowerCase() || fallback;
  } catch {
    return fallback;
  }
}

export async function createCommunityThemeSnapshot(
  profile: Profile,
  seed = crypto.randomUUID(),
) {
  const bannerUrl = profile.banner_url
    ? await copyR2ObjectByUrl({
        sourceUrl: profile.banner_url,
        destinationKey: `community-themes/${seed}/background.${getExtensionFromUrl(profile.banner_url, "png")}`,
      })
    : null;
  const musicUrl = profile.music_url
    ? await copyR2ObjectByUrl({
        sourceUrl: profile.music_url,
        destinationKey: `community-themes/${seed}/music.${getExtensionFromUrl(profile.music_url, "mp3")}`,
      })
    : null;

  return {
    banner_url: bannerUrl,
    music_url: musicUrl,
    music_title: profile.music_title,
    music_show_volume: profile.music_show_volume ?? true,
    music_volume_position: profile.music_volume_position ?? "top-right",
    theme: profile.theme,
    accent_color: profile.accent_color ?? "#ffffff",
    page_background_color: profile.page_background_color ?? "#050507",
    panel_background_color: profile.panel_background_color ?? "#111113",
    text_color: profile.text_color ?? "#ffffff",
    muted_text_color: profile.muted_text_color ?? "#d4d4d8",
    button_background_color: profile.button_background_color ?? "#ffffff",
    button_text_color: profile.button_text_color ?? "#ffffff",
    header_enabled: profile.header_enabled ?? true,
    header_background_style: profile.header_background_style ?? "gradient",
    header_color: profile.header_color ?? "#74d9bf",
    header_color_to: profile.header_color_to ?? "#2f9d8f",
    panel_visible: profile.panel_visible ?? true,
    links_icon_only: profile.links_icon_only ?? false,
    background_blur: profile.background_blur ?? 10,
    panel_opacity: profile.panel_opacity ?? 70,
    button_opacity: profile.button_opacity ?? 12,
    panel_radius: profile.panel_radius ?? 8,
    button_radius: profile.button_radius ?? 6,
    background_style: profile.background_style ?? "soft",
    button_style: profile.button_style ?? "glass",
    font_style: profile.font_style ?? "clean",
    display_name_effect: profile.display_name_effect ?? "none",
  };
}

export function getCommunityThemeUpdate(theme: CommunityTheme) {
  return {
    banner_url: theme.banner_url,
    music_url: theme.music_url,
    music_title: theme.music_title,
    music_show_volume: theme.music_show_volume ?? true,
    music_volume_position: theme.music_volume_position ?? "top-right",
    theme: (theme.theme ?? "dark") as ProfileTheme,
    accent_color: theme.accent_color ?? "#ffffff",
    page_background_color: theme.page_background_color ?? "#050507",
    panel_background_color: theme.panel_background_color ?? "#111113",
    text_color: theme.text_color ?? "#ffffff",
    muted_text_color: theme.muted_text_color ?? "#d4d4d8",
    button_background_color: theme.button_background_color ?? "#ffffff",
    button_text_color: theme.button_text_color ?? "#ffffff",
    header_enabled: theme.header_enabled ?? true,
    header_background_style: theme.header_background_style ?? "gradient",
    header_color: theme.header_color ?? "#74d9bf",
    header_color_to: theme.header_color_to ?? "#2f9d8f",
    panel_visible: theme.panel_visible ?? true,
    links_icon_only: theme.links_icon_only ?? false,
    background_blur: theme.background_blur ?? 10,
    panel_opacity: theme.panel_opacity ?? 70,
    button_opacity: theme.button_opacity ?? 12,
    panel_radius: theme.panel_radius ?? 8,
    button_radius: theme.button_radius ?? 6,
    background_style: theme.background_style ?? "soft",
    button_style: theme.button_style ?? "glass",
    font_style: theme.font_style ?? "clean",
    display_name_effect: theme.display_name_effect ?? "none",
    updated_at: new Date().toISOString(),
  };
}

export async function createProfileThemeApplication(
  theme: CommunityTheme,
  profile: Pick<Profile, "user_id">,
) {
  const seed = crypto.randomUUID();
  const bannerUrl = theme.banner_url
    ? await copyR2ObjectByUrl({
        sourceUrl: theme.banner_url,
        destinationKey: `${profile.user_id}/theme-applied/${seed}/background.${getExtensionFromUrl(theme.banner_url, "png")}`,
      })
    : null;
  const musicUrl = theme.music_url
    ? await copyR2ObjectByUrl({
        sourceUrl: theme.music_url,
        destinationKey: `${profile.user_id}/theme-applied/${seed}/music.${getExtensionFromUrl(theme.music_url, "mp3")}`,
      })
    : null;

  return {
    ...getCommunityThemeUpdate(theme),
    banner_url: bannerUrl,
    music_url: musicUrl,
  };
}
