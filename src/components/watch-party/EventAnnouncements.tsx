"use client";

import { useEffect, useMemo, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { EventAnnouncement } from "@/types/events";

export function EventAnnouncements({
  eventId,
  initialAnnouncements,
}: {
  eventId: string;
  initialAnnouncements: EventAnnouncement[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [toast, setToast] = useState<EventAnnouncement | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`event-announcements:${eventId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "event_announcements", filter: `event_id=eq.${eventId}` },
        (payload) => {
          const announcement = payload.new as EventAnnouncement;
          setAnnouncements((current) => [announcement, ...current]);
          setToast(announcement);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-3 flex items-center gap-2 font-semibold">
        <Megaphone className="h-4 w-4" />
        Duyurular
      </h2>
      <div className="space-y-3">
        {announcements.length ? (
          announcements.map((announcement) => (
            <article key={announcement.id} className="rounded-md border border-white/10 bg-black/20 p-3">
              <h3 className="text-sm font-semibold">{announcement.title}</h3>
              <p className="mt-1 text-sm leading-5 text-zinc-400">{announcement.content}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Henüz duyuru yok.</p>
        )}
      </div>
      {toast ? (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-white/10 bg-zinc-950 p-4 text-white shadow-2xl shadow-black/40">
          <button className="absolute right-2 top-2 text-zinc-400" onClick={() => setToast(null)} aria-label="Duyuruyu kapat">
            <X className="h-4 w-4" />
          </button>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Yeni duyuru</p>
          <h3 className="mt-2 font-semibold">{toast.title}</h3>
          <p className="mt-1 text-sm text-zinc-300">{toast.content}</p>
        </div>
      ) : null}
    </section>
  );
}
