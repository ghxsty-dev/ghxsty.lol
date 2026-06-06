"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileAudio({
  src,
  className,
  overlay = false,
}: {
  src: string;
  className?: string;
  overlay?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = 0.55;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsBlocked(false);
        })
        .catch(() => {
          setIsBlocked(true);
          setIsPlaying(false);
        });
    }
  }, []);

  const toggleAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
      setIsBlocked(false);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!isBlocked) {
      return;
    }

    const unlock = () => {
      void toggleAudio();
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [isBlocked, toggleAudio]);

  return (
    <>
      {overlay && isBlocked ? (
        <button
          type="button"
          onClick={toggleAudio}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/55 text-white backdrop-blur-xl"
        >
          <span className="text-2xl font-bold tracking-normal">Profili Aç</span>
          <span className="text-sm text-zinc-300">Şarkıyı başlatmak için tıkla</span>
        </button>
      ) : null}
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-xs backdrop-blur-xl",
          className,
        )}
      >
        <audio ref={audioRef} src={src} autoPlay loop preload="auto" />
        <span className="flex min-w-0 items-center gap-2 text-zinc-200">
          <Volume2 className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {isBlocked ? "Tarayıcı çalmayı engelledi" : "Profil şarkısı"}
          </span>
        </span>
        <button
          type="button"
          onClick={toggleAudio}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-zinc-950 transition hover:bg-zinc-200"
          aria-label={isPlaying ? "Şarkıyı durdur" : "Şarkıyı çal"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      </div>
    </>
  );
}
