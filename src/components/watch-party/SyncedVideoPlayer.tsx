"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [event, setEvent] = useState(initialEvent);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);

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

  useEffect(() => {
    function updateFullscreenState() {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    }

    document.addEventListener("fullscreenchange", updateFullscreenState);
    return () => document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  useEffect(() => {
    const savedVolume = Number(window.localStorage.getItem("watch-party-volume"));
    const savedMuted = window.localStorage.getItem("watch-party-muted") === "true";

    if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 100) {
      setVolume(savedVolume);
    }
    setMuted(savedMuted);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.volume = Math.min(1, Math.max(0, volume / 100));
    video.muted = muted || volume === 0;
    window.localStorage.setItem("watch-party-volume", String(volume));
    window.localStorage.setItem("watch-party-muted", String(muted));
  }, [muted, volume]);

  async function toggleFullscreen() {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }

    await wrapper.requestFullscreen().catch(() => undefined);
  }

  function updateVolume(nextVolume: number) {
    const safeVolume = Math.min(100, Math.max(0, nextVolume));
    setVolume(safeVolume);
    setMuted(safeVolume === 0);
  }

  return (
    <div
      ref={wrapperRef}
      className="group relative overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl shadow-black/30 fullscreen:flex fullscreen:items-center fullscreen:justify-center fullscreen:rounded-none fullscreen:border-0"
    >
      {event.video_url ? (
        <>
          <video
            ref={videoRef}
            data-watch-party-video="true"
            src={event.video_url}
            poster={event.thumbnail_url ?? undefined}
            controls={isAdmin}
            playsInline
            className="aspect-video w-full bg-black object-contain fullscreen:max-h-screen"
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
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
            className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-black/60 text-white backdrop-blur transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <div className="absolute bottom-3 left-3 flex h-10 items-center gap-2 rounded-md border border-white/10 bg-black/60 px-3 text-white backdrop-blur">
            <button
              type="button"
              onClick={() => setMuted((current) => !current)}
              title={muted || volume === 0 ? "Sesi aç" : "Sesi kapat"}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              aria-label="Ses düzeyi"
              type="range"
              min="0"
              max="100"
              value={muted ? 0 : volume}
              onChange={(rangeEvent) => updateVolume(Number(rangeEvent.target.value))}
              className="h-1 w-24 accent-white sm:w-32"
            />
            <span className="w-8 text-right text-xs text-zinc-300">
              {muted ? 0 : volume}
            </span>
          </div>
        </>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-zinc-950 text-sm text-zinc-500">
          Video henüz yüklenmedi.
        </div>
      )}
    </div>
  );
}
