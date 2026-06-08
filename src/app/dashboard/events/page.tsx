import Link from "next/link";
import { CalendarPlus, ExternalLink, Trash2 } from "lucide-react";
import { deleteEventAction } from "@/app/dashboard/events/actions";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireModeratorOrAdmin } from "@/lib/permissions";
import type { WatchEvent } from "@/types/events";

export default async function DashboardEventsPage() {
  const { supabase, profile } = await requireModeratorOrAdmin("/dashboard");
  const { data } = await supabase
    .from("events")
    .select("*")
    .neq("status", "deleted")
    .order("created_at", { ascending: false });
  const events = (data ?? []) as WatchEvent[];

  return (
    <main className="min-h-screen bg-[#050507] p-4 text-white">
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar username={profile.username} isAdmin />
        <div className="min-w-0">
        <header className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-bold">Watch Party Events</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Event oluştur, yayını yönet ve public sayfaları kontrol et.
            </p>
          </div>
          <Link href="/dashboard/events/new" className={buttonVariants()}>
              <CalendarPlus className="h-4 w-4" />
              Yeni Event
          </Link>
        </header>

        <div className="mt-6 grid gap-4">
          {events.length ? (
            events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span>{event.title}</span>
                    <span className="w-fit rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs text-zinc-300">
                      {event.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="line-clamp-2 text-sm text-zinc-400">{event.description || "Açıklama yok."}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/events/${event.id}`} className={buttonVariants({ variant: "secondary" })}>
                        <ExternalLink className="h-4 w-4" />
                        Public
                    </Link>
                    <Link href={`/dashboard/events/${event.id}`} className={buttonVariants()}>Yönet</Link>
                    <form action={deleteEventAction}>
                      <input type="hidden" name="event_id" value={event.id} />
                      <Button type="submit" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        Sil
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-zinc-400">Henüz event yok.</CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </main>
  );
}
