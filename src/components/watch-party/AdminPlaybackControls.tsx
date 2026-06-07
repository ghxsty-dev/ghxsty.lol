"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Pause, Play, RotateCcw, SkipForward, Square } from "lucide-react";
import { endEventAction, playbackAction } from "@/app/dashboard/events/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WatchEvent } from "@/types/events";

export function AdminPlaybackControls({ event }: { event: WatchEvent }) {
  const [position, setPosition] = useState(String(Math.floor(event.playback_position ?? 0)));

  function getVideoPosition() {
    const video = document.querySelector<HTMLVideoElement>("[data-watch-party-video='true']");
    if (!video || !Number.isFinite(video.currentTime)) {
      return position;
    }

    return String(Math.max(0, Math.floor(video.currentTime)));
  }

  function prepareSubmit(command: string) {
    return (submitEvent: FormEvent<HTMLFormElement>) => {
      const form = submitEvent.currentTarget;
      const positionInput = form.elements.namedItem("position");
      const nextPosition =
        command === "restart" ? "0" : command === "seek" ? position : getVideoPosition();

      if (positionInput instanceof HTMLInputElement) {
        positionInput.value = nextPosition;
      }

      setPosition(nextPosition);
    };
  }

  function hidden(command: string) {
    return (
      <>
        <input type="hidden" name="event_id" value={event.id} />
        <input type="hidden" name="command" value={command} />
        <input type="hidden" name="position" defaultValue={position} />
      </>
    );
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-3 font-semibold">Playback Yönetimi</h2>
      <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input
          type="number"
          min="0"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          placeholder="Saniye"
        />
        <form action={playbackAction} onSubmit={prepareSubmit("seek")}>
          {hidden("seek")}
          <Button type="submit" variant="secondary">
            <SkipForward className="h-4 w-4" />
            Seek
          </Button>
        </form>
      </div>
      <div className="flex flex-wrap gap-2">
        <form action={playbackAction} onSubmit={prepareSubmit("play")}>
          {hidden("play")}
          <Button type="submit">
            <Play className="h-4 w-4" />
            Play
          </Button>
        </form>
        <form action={playbackAction} onSubmit={prepareSubmit("pause")}>
          {hidden("pause")}
          <Button type="submit" variant="secondary">
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        </form>
        <form action={playbackAction} onSubmit={prepareSubmit("restart")}>
          {hidden("restart")}
          <Button type="submit" variant="secondary">
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
        </form>
        <form action={endEventAction}>
          <input type="hidden" name="event_id" value={event.id} />
          <Button type="submit" variant="destructive">
            <Square className="h-4 w-4" />
            End
          </Button>
        </form>
      </div>
    </section>
  );
}
