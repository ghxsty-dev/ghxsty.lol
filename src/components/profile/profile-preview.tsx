import Image from "next/image";
import { Music2, Pause } from "lucide-react";
import { getLinkIcon } from "@/lib/link-icons";
import { cn } from "@/lib/utils";
import type { Profile, ProfileLink } from "@/types/database";

function withAlpha(color: string | null | undefined, alpha: number) {
  const value = color ?? "#111113";
  const suffix = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");

  return `${value}${suffix}`;
}

export function ProfilePreview({
  profile,
  links,
}: {
  profile: Profile;
  links: ProfileLink[];
}) {
  const displayName = profile.display_name || profile.username;
  const panelVisible = profile.panel_visible ?? true;
  const linksIconOnly = profile.links_icon_only ?? false;
  const shownLinks = links.slice(0, 6);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
      <div
        className="relative aspect-[9/14] min-h-[560px] overflow-hidden"
        style={{ backgroundColor: profile.page_background_color ?? "#050507" }}
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

        <div className="absolute inset-0 flex items-center justify-center p-5">
          <div
            className={cn(
              "relative w-full max-w-[330px] overflow-hidden rounded-lg p-5 text-center",
              panelVisible
                ? "border border-white/10 shadow-2xl shadow-black/40 backdrop-blur-xl"
                : "border border-transparent",
            )}
            style={{
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
              <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border-4 border-white/20 bg-zinc-900">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={displayName}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="mt-3 truncate text-xl font-bold">{displayName}</h3>
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
              >
                {profile.music_show_volume ?? true ? (
                  <div className="absolute right-2 top-2 h-6 w-14 rounded-full border border-white/10 bg-black/35" />
                ) : null}
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
                "relative mt-5 grid",
                linksIconOnly ? "grid-cols-6 gap-1" : "grid-cols-2 gap-2",
              )}
            >
              {shownLinks.map((link) => {
                const Icon = getLinkIcon(link.icon);
                return (
                  <div
                    key={link.id}
                    className={cn(
                      "flex min-w-0 items-center rounded-md border text-xs",
                      linksIconOnly
                        ? "mx-auto h-8 w-8 justify-center p-0"
                        : "h-10 gap-2 px-3",
                    )}
                    style={{
                      backgroundColor:
                        profile.button_style === "outline"
                          ? "transparent"
                          : withAlpha(
                              profile.button_background_color,
                              (profile.button_opacity ?? 12) / 100,
                            ),
                      color: profile.button_text_color ?? "#ffffff",
                      borderColor:
                        profile.button_style === "outline" ||
                        profile.button_style === "neon"
                          ? (profile.accent_color ?? "#ffffff")
                          : `${profile.button_background_color ?? "#ffffff"}55`,
                    }}
                  >
                    <Icon className={cn("shrink-0", linksIconOnly ? "h-4 w-4" : "h-3.5 w-3.5")} />
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
