"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EventCommand, WatchEvent } from "@/types/events";

function expectedTime(event: WatchEvent) {
  if (!event.is_playing) {
    return event.playback_position;
  }

  const elapsed = (Date.now() - new Date(event.playback_updated_at).getTime()) / 1000;
  return Math.max(0, event.playback_position + elapsed);
}

export function SyncedVideoPlayer({
  initialEvent,
  isAdmin,
}: {
  initialEvent: WatchEvent;
  isAdmin: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [event, setEvent] = useState(initialEvent);

  const syncToState = useCallback((nextEvent = event) => {
    const video = videoRef.current;
    if (!video || !nextEvent.video_url) {
      return;
    }

    const target = expectedTime(nextEvent);
    if (Math.abs(video.currentTime - target) > 2) {
      video.currentTime = target;
    }

    if (nextEvent.is_playing && video.paused) {
      void video.play().catch(() => undefined);
    }
    if (!nextEvent.is_playing && !video.paused) {
      video.pause();
    }
  }, [event]);

  useEffect(() => {
    syncToState(initialEvent);
  }, [initialEvent, syncToState]);

  useEffect(() => {
    const interval = window.setInterval(() => syncToState(), 7000);
    return () => window.clearInterval(interval);
  }, [syncToState]);

  useEffect(() => {
    const channel = supabase
      .channel(`event-video:${event.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "events", filter: `id=eq.${event.id}` },
        (payload) => {
          const nextEvent = payload.new as WatchEvent;
          setEvent(nextEvent);
          window.setTimeout(() => syncToState(nextEvent), 50);
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "event_commands", filter: `event_id=eq.${event.id}` },
        (payload) => {
          const command = payload.new as EventCommand;
          const video = videoRef.current;
          if (!video) {
            return;
          }

          if (typeof command.position === "number") {
            video.currentTime = command.position;
          }
          if (command.type === "play") {
            void video.play().catch(() => undefined);
          }
          if (command.type === "pause" || command.type === "end") {
            video.pause();
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [event.id, supabase, syncToState]);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl shadow-black/30">
      {event.video_url ? (
        <video
          ref={videoRef}
          src={event.video_url}
          poster={event.thumbnail_url ?? undefined}
          controls={isAdmin}
          playsInline
          className="aspect-video w-full bg-black object-contain"
          onPlay={() => {
            if (!isAdmin && !event.is_playing) {
              syncToState();
            }
          }}
          onPause={() => {
            if (!isAdmin && event.is_playing) {
              syncToState();
            }
          }}
          onSeeking={() => {
            if (!isAdmin) {
              syncToState();
            }
          }}
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-zinc-950 text-sm text-zinc-500">
          Video henüz yüklenmedi.
        </div>
      )}
    </div>
  );
}
