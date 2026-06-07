import Image from "next/image";
import { Activity, Gamepad2, Music2 } from "lucide-react";
import type { Profile } from "@/types/database";
import { cn } from "@/lib/utils";

type LanyardActivity = {
  type: number;
  name: string;
  details?: string | null;
  state?: string | null;
};

type LanyardData = {
  success?: boolean;
  data?: {
    discord_status?: "online" | "idle" | "dnd" | "offline";
    activities?: LanyardActivity[];
    spotify?: {
      song?: string;
      artist?: string;
      album_art_url?: string;
    } | null;
  };
};

function getStatusLabel(status?: string) {
  switch (status) {
    case "online":
      return "Online";
    case "idle":
      return "Boşta";
    case "dnd":
      return "Rahatsız etmeyin";
    default:
      return "Offline";
  }
}

function getStatusClass(status?: string) {
  switch (status) {
    case "online":
      return "bg-emerald-400";
    case "idle":
      return "bg-yellow-400";
    case "dnd":
      return "bg-red-400";
    default:
      return "bg-zinc-500";
  }
}

async function getPresence(discordId: string, enabled: boolean) {
  if (!enabled) {
    return null;
  }

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as LanyardData;
    return payload.success ? payload.data ?? null : null;
  } catch {
    return null;
  }
}

export async function DiscordCard({ profile }: { profile: Profile }) {
  if (!profile.discord_id) {
    return null;
  }

  const presence = await getPresence(
    profile.discord_id,
    profile.discord_show_presence ?? true,
  );
  const status = presence?.discord_status ?? "offline";
  const displayName =
    profile.discord_global_name || profile.discord_username || "Discord";
  const spotify = presence?.spotify ?? null;
  const activity = presence?.activities?.find(
    (item) => item.type === 0 || item.type === 2 || item.type === 4,
  );

  return (
    <div className="relative mt-6 overflow-hidden rounded-md border border-white/10 bg-[#5865f2]/15 p-4 text-left shadow-lg shadow-black/15 backdrop-blur-xl">
      {profile.discord_banner_url ? (
        <Image
          src={profile.discord_banner_url}
          alt=""
          fill
          className="z-0 object-cover opacity-20"
          sizes="560px"
        />
      ) : null}
      <div className="relative z-10 flex items-center gap-3">
        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-zinc-900">
          {profile.discord_avatar_url ? (
            <Image
              src={profile.discord_avatar_url}
              alt={displayName}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Gamepad2 className="h-6 w-6" />
            </div>
          )}
          <span
            className={cn(
              "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-zinc-950",
              getStatusClass(status),
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{displayName}</p>
          <p className="truncate text-xs text-zinc-300">
            @{profile.discord_username} · {getStatusLabel(status)}
          </p>
        </div>
      </div>

      {spotify || activity ? (
        <div className="relative z-10 mt-4 rounded-md border border-white/10 bg-black/25 p-3">
          {spotify ? (
            <div className="flex items-center gap-3">
              {spotify.album_art_url ? (
                <Image
                  src={spotify.album_art_url}
                  alt=""
                  width={42}
                  height={42}
                  className="h-10 w-10 rounded-md object-cover"
                />
              ) : (
                <Music2 className="h-5 w-5 text-zinc-300" />
              )}
              <div className="min-w-0">
                <p className="truncate text-xs text-zinc-400">Spotify dinliyor</p>
                <p className="truncate text-sm font-medium text-white">{spotify.song}</p>
                <p className="truncate text-xs text-zinc-400">{spotify.artist}</p>
              </div>
            </div>
          ) : activity ? (
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-zinc-300" />
              <div className="min-w-0">
                <p className="truncate text-xs text-zinc-400">Etkinlik</p>
                <p className="truncate text-sm font-medium text-white">{activity.name}</p>
                {activity.details || activity.state ? (
                  <p className="truncate text-xs text-zinc-400">
                    {activity.details ?? activity.state}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
