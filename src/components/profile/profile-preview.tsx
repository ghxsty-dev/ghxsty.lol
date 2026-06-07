import Image from "next/image";
import type { CSSProperties } from "react";
import { Music2, Pause, Volume2 } from "lucide-react";
import { getLinkIcon } from "@/lib/link-icons";
import {
  getBackgroundEffectClass,
  getButtonEffectClass,
  getDisplayNameEffectClass,
  getFontStyleClass,
} from "@/lib/profile-visuals";
import { cn } from "@/lib/utils";
import { AvatarFrame } from "@/components/profile/avatar-frame";
import type { AvatarDecoration, Profile, ProfileLink } from "@/types/database";

function withAlpha(color: string | null | undefined, alpha: number) {
  const value = color ?? "#111113";
  const suffix = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");

  return `${value}${suffix}`;
}

function getPreviewVolumePositionClass(position?: string | null) {
  switch (position) {
    case "top-left":
      return "left-3 top-3";
    case "bottom-right":
      return "bottom-3 right-3";
    case "bottom-left":
      return "bottom-3 left-3";
    default:
      return "right-3 top-3";
  }
}

export function ProfilePreview({
  profile,
  links,
  decoration,
}: {
  profile: Profile;
  links: ProfileLink[];
  decoration?: AvatarDecoration | null;
}) {
  const displayName = profile.display_name || profile.username;
  const panelVisible = profile.panel_visible ?? true;
  const linksIconOnly = profile.links_icon_only ?? false;
  const shownLinks = links.slice(0, 6);
  const panelRadius = Math.min(32, Math.max(0, profile.panel_radius ?? 8));
  const buttonRadius = Math.min(32, Math.max(0, profile.button_radius ?? 6));

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
      <div
        className={cn(
          "relative min-h-[640px] overflow-hidden",
          getBackgroundEffectClass(profile.background_style),
          getFontStyleClass(profile.font_style),
        )}
        style={
          {
            "--profile-accent": profile.accent_color ?? "#ffffff",
            backgroundColor: profile.page_background_color ?? "#050507",
          } as CSSProperties
        }
      >
        {profile.banner_url ? (
          <Image
            src={profile.banner_url}
            alt={`${displayName} preview background`}
            fill
            className="scale-110 object-cover opacity-80"
            sizes="420px"
            style={{
              filter: `blur(${Math.min(28, profile.background_blur ?? 10)}px)`,
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-black/35" />
        {profile.music_url && (profile.music_show_volume ?? true) ? (
          <div
            className={cn(
              "absolute z-20 flex h-8 w-20 items-center justify-center gap-2 rounded-full border border-white/10 bg-black/45 text-white backdrop-blur-xl",
              getPreviewVolumePositionClass(profile.music_volume_position),
            )}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span className="h-1 w-9 rounded-full bg-white/70" />
          </div>
        ) : null}

        <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-5">
          <div
            className={cn(
              "relative my-auto w-full max-w-[340px] overflow-hidden rounded-lg p-5 text-center",
              panelVisible
                ? "border border-white/10 shadow-2xl shadow-black/40 backdrop-blur-xl"
                : "border border-transparent",
            )}
            style={{
              borderRadius: `${panelRadius}px`,
              backgroundColor: panelVisible
                ? withAlpha(
                    profile.panel_background_color,
                    (profile.panel_opacity ?? 70) / 100,
                  )
                : "transparent",
              color: profile.text_color ?? "#ffffff",
            }}
          >
            {panelVisible && (profile.header_enabled ?? true) ? (
              <div
                className="absolute inset-x-0 top-0 h-24 opacity-80"
                style={{
                  background:
                    profile.header_background_style === "solid"
                      ? (profile.header_color ?? "#74d9bf")
                      : `linear-gradient(135deg, ${profile.header_color ?? "#74d9bf"}, ${profile.header_color_to ?? "#2f9d8f"})`,
                }}
              />
            ) : null}

            <div className="relative">
              <AvatarFrame
                src={profile.avatar_url}
                fallback={displayName}
                alt={displayName}
                decoration={decoration}
                size="md"
              />
              <h3 className="mt-3 truncate text-xl font-bold">
                <span className={cn("inline-block", getDisplayNameEffectClass(profile.display_name_effect))}>
                  {displayName}
                </span>
              </h3>
              <p
                className="mt-1 truncate text-xs"
                style={{ color: profile.accent_color ?? "#ffffff" }}
              >
                @{profile.username}
              </p>
              {profile.bio ? (
                <p
                  className="mx-auto mt-3 line-clamp-2 max-w-[240px] text-xs leading-5"
                  style={{ color: profile.muted_text_color ?? "#d4d4d8" }}
                >
                  {profile.bio}
                </p>
              ) : null}
            </div>

            {profile.music_url ? (
              <div
                className={cn(
                  "relative mt-4 min-h-20 px-3 py-3",
                  panelVisible
                    ? "rounded-md border border-white/10 bg-black/25"
                    : "bg-transparent",
                )}
                style={{ borderRadius: `${buttonRadius}px` }}
              >
                <div className="mx-auto flex max-w-[60%] items-center justify-center gap-2 text-xs font-semibold">
                  <Music2 className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {profile.music_title ?? "Profil şarkısı"}
                  </span>
                </div>
                <div className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-950">
                  <Pause className="h-3.5 w-3.5" />
                </div>
              </div>
            ) : null}

            <div
              className={cn(
                "relative mt-5",
                linksIconOnly
                  ? "flex flex-wrap items-center justify-center gap-3"
                  : "grid grid-cols-2 gap-2",
              )}
            >
              {shownLinks.map((link) => {
                const Icon = getLinkIcon(link.icon);
                return (
                  <div
                    key={link.id}
                    className={cn(
                      "flex min-w-0 items-center text-xs",
                      "relative",
                      linksIconOnly
                        ? "justify-center p-1"
                        : "h-10 gap-2 rounded-md border px-3",
                      getButtonEffectClass(profile.button_style),
                    )}
                    style={{
                      borderRadius: linksIconOnly ? undefined : `${buttonRadius}px`,
                      backgroundColor:
                        linksIconOnly
                          ? "transparent"
                          : profile.button_style === "outline"
                          ? "transparent"
                          : withAlpha(
                              profile.button_background_color,
                              (profile.button_opacity ?? 12) / 100,
                            ),
                      color: profile.button_text_color ?? "#ffffff",
                      borderColor:
                        linksIconOnly
                          ? "transparent"
                          : profile.button_style === "outline" ||
                              profile.button_style === "neon"
                            ? (profile.accent_color ?? "#ffffff")
                            : `${profile.button_background_color ?? "#ffffff"}55`,
                    }}
                  >
                    <Icon className={cn("shrink-0", linksIconOnly ? "h-5 w-5" : "h-3.5 w-3.5")} />
                    {linksIconOnly ? null : (
                      <span className="truncate">{link.title}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
