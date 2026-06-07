import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventMessage, EventMessageProfile } from "@/types/events";
import type { ReactNode } from "react";

function NameEffect({
  effect,
  children,
}: {
  effect?: string | null;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "font-semibold",
        effect === "glow" && "text-white drop-shadow-[0_0_10px_rgba(255,255,255,.7)]",
        effect === "gradient" && "bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-amber-200 bg-clip-text text-transparent",
        effect === "neon" && "text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,.85)]",
        effect === "sparkle" && "text-amber-100 drop-shadow-[0_0_12px_rgba(251,191,36,.75)]",
      )}
    >
      {children}
    </span>
  );
}

function AdminShieldBadge() {
  return (
    <span
      title="Admin"
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-red-400/30 bg-red-500/15 text-red-300"
    >
      <ShieldCheck className="h-3.5 w-3.5" />
    </span>
  );
}

export function ChatMessage({
  message,
  profile,
}: {
  message: EventMessage;
  profile?: EventMessageProfile | null;
}) {
  const displayName = profile?.display_name || profile?.username || "Kullanıcı";
  const username = profile?.username || "unknown";

  return (
    <div className="flex gap-3 rounded-md px-2 py-2 transition hover:bg-white/[0.04]">
      <div className="relative h-10 w-10 shrink-0">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-800">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        {profile?.avatar_decoration_url ? (
          <Image
            src={profile.avatar_decoration_url}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="pointer-events-none absolute -inset-2 h-14 w-14 max-w-none object-contain"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <NameEffect effect={profile?.name_effect}>{displayName}</NameEffect>
          {profile?.role === "admin" ? <AdminShieldBadge /> : null}
          {profile?.role === "moderator" ? (
            <span className="rounded-full border border-blue-400/30 bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-200">
              Mod
            </span>
          ) : null}
        </div>
        <div className="text-xs text-zinc-500">@{username}</div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-zinc-200">
          {message.message}
        </p>
      </div>
    </div>
  );
}
