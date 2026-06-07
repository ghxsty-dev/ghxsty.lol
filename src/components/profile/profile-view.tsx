import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ExternalLink, Eye, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEMES } from "@/lib/themes";
import {
  getBackgroundEffectClass,
  getButtonEffectClass,
  getDisplayNameEffectClass,
  getFontStyleClass,
} from "@/lib/profile-visuals";
import { DiscordCard } from "@/components/profile/discord-card";
import { getLinkIcon } from "@/lib/link-icons";
import { AvatarFrame } from "@/components/profile/avatar-frame";
import { ProfileAudio } from "@/components/profile/profile-audio";
import { ProfileShare } from "@/components/profile/profile-share";
import { ProfileVote } from "@/components/profile/profile-vote";
import type { ProfileVoteScore, PublicProfile } from "@/types/database";

export function ProfileView({
  profile,
  voteScore,
  currentVote,
  viewCount,
}: {
  profile: PublicProfile;
  voteScore?: ProfileVoteScore | null;
  currentVote?: 1 | -1 | null;
  viewCount?: number;
}) {
  const theme = THEMES[profile.theme] ?? THEMES.dark;
  const displayName = profile.display_name || profile.username;
  const accentColor = profile.accent_color ?? "#ffffff";
  const pageBackgroundColor = profile.page_background_color ?? "#050507";
  const panelBackgroundColor = profile.panel_background_color ?? "#111113";
  const textColor = profile.text_color ?? undefined;
  const mutedTextColor = profile.muted_text_color ?? undefined;
  const buttonBackgroundColor = profile.button_background_color ?? "#ffffff";
  const buttonTextColor = profile.button_text_color ?? undefined;
  const headerEnabled = profile.header_enabled ?? true;
  const headerColor = profile.header_color ?? "#74d9bf";
  const headerColorTo = profile.header_color_to ?? "#2f9d8f";
  const panelVisible = profile.panel_visible ?? true;
  const linksIconOnly = profile.links_icon_only ?? false;
  const backgroundBlur = Math.min(40, Math.max(0, profile.background_blur ?? 10));
  const panelOpacity = Math.min(100, Math.max(10, profile.panel_opacity ?? 70));
  const buttonOpacity = Math.min(100, Math.max(0, profile.button_opacity ?? 12));
  const panelRadius = Math.min(32, Math.max(0, profile.panel_radius ?? 8));
  const buttonRadius = Math.min(32, Math.max(0, profile.button_radius ?? 6));

  return (
    <main
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:py-12",
        theme.page,
        getBackgroundEffectClass(profile.background_style),
        getFontStyleClass(profile.font_style),
      )}
      style={
        {
          "--profile-accent": accentColor,
          backgroundColor: pageBackgroundColor,
          color: textColor,
        } as CSSProperties
      }
    >
      {profile.banner_url ? (
        <Image
          src={profile.banner_url}
          alt={`${displayName} arka plan`}
          fill
          priority
          className="z-0 scale-110 object-cover"
          sizes="100vw"
          style={{ filter: `blur(${backgroundBlur}px)` }}
        />
      ) : null}
      <div className="absolute inset-0 z-0 bg-black/35" />
      <Link
        href="/"
        className="fixed left-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white backdrop-blur transition hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        title="Ana menü"
      >
        <Home className="h-4 w-4" />
      </Link>
      <ProfileShare
        username={profile.username}
        displayName={displayName}
        avatarUrl={profile.avatar_url}
        avatarDecoration={profile.avatar_decoration}
        accentColor={accentColor}
      />

      <section className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-lg p-5",
            panelVisible
              ? "min-h-[620px] border border-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl"
              : "border border-transparent bg-transparent shadow-none",
          )}
          style={{
            borderRadius: `${panelRadius}px`,
            backgroundColor: panelVisible
              ? `${panelBackgroundColor}${Math.round((panelOpacity / 100) * 255)
                  .toString(16)
                  .padStart(2, "0")}`
              : "transparent",
          }}
        >
          {headerEnabled && panelVisible ? (
            <div
              className="absolute inset-x-0 top-0 h-36 opacity-80"
              style={{
                background:
                  profile.header_background_style === "solid"
                    ? headerColor
                    : `linear-gradient(135deg, ${headerColor}, ${headerColorTo})`,
              }}
            />
          ) : null}

          <div className={cn("relative text-center", headerEnabled ? "pt-16" : "pt-4")}>
            <AvatarFrame
              src={profile.avatar_url}
              fallback={displayName}
              alt={displayName}
              decoration={profile.avatar_decoration}
              size="lg"
            />
            <h1 className="mt-4 text-3xl font-bold tracking-normal">
              <span className={cn("inline-block", getDisplayNameEffectClass(profile.display_name_effect))}>
                {displayName}
              </span>
            </h1>
            <p className="mt-1 text-sm" style={{ color: accentColor }}>
              @{profile.username}
            </p>
            {profile.bio ? (
              <p
                className="mx-auto mt-4 max-w-md text-sm leading-6"
                style={{ color: mutedTextColor }}
              >
                {profile.bio}
              </p>
            ) : null}
          </div>

          <DiscordCard profile={profile} radius={buttonRadius} />

          {profile.music_url ? (
            <div className="relative mt-6">
              <ProfileAudio
                src={profile.music_url}
                title={profile.music_title ?? "Profil şarkısı"}
                showVolume={profile.music_show_volume ?? true}
                volumePosition={profile.music_volume_position ?? "top-right"}
                transparent={!panelVisible}
                overlay
              />
            </div>
          ) : null}

          <div
            className={cn(
              "relative mt-8",
              linksIconOnly
                ? "flex flex-wrap items-center justify-center gap-4"
                : "grid grid-cols-2 gap-3",
            )}
          >
            {profile.profile_links.map((link) => {
              const Icon = getLinkIcon(link.icon);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "flex min-w-0 items-center text-sm font-medium transition",
                    "relative",
                    linksIconOnly
                      ? "justify-center p-1 hover:scale-110"
                      : "min-h-12 justify-between gap-2 rounded-md border px-3 py-3",
                    getButtonEffectClass(profile.button_style),
                  )}
                  style={{
                    borderRadius: linksIconOnly ? undefined : `${buttonRadius}px`,
                    backgroundColor:
                      linksIconOnly
                        ? "transparent"
                        : profile.button_style === "outline"
                          ? "transparent"
                          : `${buttonBackgroundColor}${Math.round(
                              (buttonOpacity / 100) * 255,
                            )
                              .toString(16)
                              .padStart(2, "0")}`,
                    color: buttonTextColor,
                    borderColor:
                      linksIconOnly
                        ? "transparent"
                        : profile.button_style === "outline" ||
                            profile.button_style === "neon"
                          ? accentColor
                          : `${buttonBackgroundColor}55`,
                    boxShadow:
                      !linksIconOnly && profile.button_style === "neon"
                        ? `0 0 26px ${accentColor}33`
                        : undefined,
                  }}
                >
                  <span className={cn("flex min-w-0 items-center", linksIconOnly ? "justify-center" : "gap-3")}>
                    <Icon className={cn("shrink-0", linksIconOnly ? "h-7 w-7" : "h-4 w-4")} />
                    {linksIconOnly ? null : (
                      <span className="truncate">{link.title}</span>
                    )}
                  </span>
                  {linksIconOnly ? null : (
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  )}
                </a>
              );
            })}
          </div>

          <div className="relative mt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs text-zinc-200 shadow-lg shadow-black/20 backdrop-blur-xl">
              <Eye className="h-3.5 w-3.5" />
              <span>{viewCount ?? profile.view_count ?? 0}</span>
            </div>
            <ProfileVote
              profileId={profile.id}
              username={profile.username}
              initialScore={voteScore?.score ?? 0}
              initialUpvotes={voteScore?.upvotes ?? 0}
              initialDownvotes={voteScore?.downvotes ?? 0}
              initialVote={currentVote ?? null}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
