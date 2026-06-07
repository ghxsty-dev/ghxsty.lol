"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileAudio({
  src,
  title = "Profil şarkısı",
  showVolume = true,
  className,
  overlay = false,
}: {
  src: string;
  title?: string;
  showVolume?: boolean;
  className?: string;
  overlay?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [volume, setVolume] = useState(55);

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

  function handleVolume(value: number) {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  }

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
          "relative rounded-md border border-white/10 bg-black/25 px-4 py-4 text-xs backdrop-blur-xl",
          className,
        )}
      >
        <audio ref={audioRef} src={src} autoPlay loop preload="auto" />
        {showVolume ? (
          <div className="absolute right-3 top-3 flex items-center gap-2 text-zinc-200">
            {volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            <input
              aria-label="Ses düzeyi"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) => handleVolume(Number(event.target.value))}
              className="h-1 w-20 accent-white"
            />
          </div>
        ) : null}
        <div className="mx-auto max-w-[70%] text-center">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <span className="mt-1 block truncate text-zinc-400">
            {isBlocked ? "Başlatmak için tıkla" : isPlaying ? "Çalıyor" : "Duraklatıldı"}
          </span>
        </div>
        <button
          type="button"
          onClick={toggleAudio}
          className="mx-auto mt-3 flex h-9 w-9 items-center justify-center rounded-md bg-white text-zinc-950 transition hover:bg-zinc-200"
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
