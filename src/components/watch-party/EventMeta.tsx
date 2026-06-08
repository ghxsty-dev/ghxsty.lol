"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Creator = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
} | null;

function getPresenceKey(eventId: string, currentUserId?: string | null) {
  if (currentUserId) {
    return currentUserId;
  }

  const storageKey = `watch-party-presence:${eventId}`;
  const existing = window.localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }

  const next = crypto.randomUUID();
  window.localStorage.setItem(storageKey, next);
  return next;
}

export function EventMeta({
  eventId,
  title,
  description,
  creator,
  currentUserId,
  currentDisplayName,
}: {
  eventId: string;
  title: string;
  description?: string | null;
  creator: Creator;
  currentUserId?: string | null;
  currentDisplayName?: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [viewerCount, setViewerCount] = useState(1);
  const creatorName = creator?.display_name || creator?.username || "ghxsty.lol";

  useEffect(() => {
    const presenceKey = getPresenceKey(eventId, currentUserId);
    const channel = supabase.channel(`event-viewers:${eventId}`, {
      config: { presence: { key: presenceKey } },
    });

    function updateCount() {
      setViewerCount(Math.max(1, Object.keys(channel.presenceState()).length));
    }

    channel
      .on("presence", { event: "sync" }, updateCount)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUserId ?? presenceKey,
            name: currentDisplayName?.trim() || "Bir kullanıcı",
            joined_at: new Date().toISOString(),
          });
          updateCount();
        }
      });

    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [currentDisplayName, currentUserId, eventId, supabase]);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-normal">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{description}</p>
          ) : null}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
              {creator?.avatar_url ? (
                <Image
                  src={creator.avatar_url}
                  alt={creatorName}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold">
                  {creatorName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{creatorName}</p>
              {creator?.username ? (
                <p className="truncate text-xs text-zinc-500">@{creator.username}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200">
          <Users className="h-4 w-4" />
          {viewerCount} aktif izleyici
        </div>
      </div>
    </section>
  );
}
