import Link from "next/link";
import { Calendar, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { WatchEvent } from "@/types/events";

export default async function EventsIndexPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .in("status", ["scheduled", "live"])
    .order("starts_at", { ascending: true, nullsFirst: false });
  const events = (data ?? []) as WatchEvent[];

  return (
    <main className="min-h-screen bg-[#050507] p-4 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Calendar className="h-7 w-7" />
            Watch Party
          </h1>
          <Link
            href="/"
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
          >
            <Home className="h-4 w-4" />
            Ana menü
          </Link>
        </header>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.length ? (
            events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
                  {event.thumbnail_url ? (
                    <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${event.thumbnail_url})` }} />
                  ) : null}
                  <CardContent className="p-4">
                    <span className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs text-zinc-300">{event.status}</span>
                    <h2 className="mt-3 text-lg font-semibold">{event.title}</h2>
                    {event.description ? <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{event.description}</p> : null}
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-6 text-zinc-400 md:col-span-2 xl:col-span-3">
              Şu an aktif etkinlik yok.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
