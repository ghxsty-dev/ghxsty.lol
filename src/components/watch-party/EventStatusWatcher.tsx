"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EventStatus, WatchEvent } from "@/types/events";

export function EventStatusWatcher({
  eventId,
  initialStatus,
  publicView = false,
}: {
  eventId: string;
  initialStatus: EventStatus;
  publicView?: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let currentStatus = initialStatus;
    const channel = supabase
      .channel(`event-status:${eventId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "events", filter: `id=eq.${eventId}` },
        (payload) => {
          const nextEvent = payload.new as WatchEvent;
          if (nextEvent.status === currentStatus) {
            return;
          }

          currentStatus = nextEvent.status;

          if (publicView && (nextEvent.status === "draft" || nextEvent.status === "deleted")) {
            router.replace("/events");
            return;
          }

          router.refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId, initialStatus, publicView, router, supabase]);

  return null;
}
