import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createAnnouncementAction,
  createPollAction,
  deleteEventVideoAction,
  updateEventAction,
} from "@/app/dashboard/events/actions";
import { AdminPlaybackControls } from "@/components/watch-party/AdminPlaybackControls";
import { EventChat } from "@/components/watch-party/EventChat";
import { EventMediaUploader } from "@/components/watch-party/EventMediaUploader";
import { SyncedVideoPlayer } from "@/components/watch-party/SyncedVideoPlayer";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireModeratorOrAdmin } from "@/lib/permissions";
import type { EventMessage, WatchEvent } from "@/types/events";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function ManageEventPage({ params }: PageProps) {
  const { eventId } = await params;
  const { supabase, user } = await requireModeratorOrAdmin("/dashboard");
  const [{ data: event }, { data: messages }] = await Promise.all([
    supabase.from("events").select("*").eq("id", eventId).maybeSingle(),
    supabase
      .from("event_messages")
      .select("*, profile:profiles!event_messages_user_profile_fkey(user_id, username, display_name, avatar_url, avatar_decoration_url, name_effect, role)")
      .eq("event_id", eventId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(200),
  ]);

  if (!event) {
    notFound();
  }

  const typedEvent = event as WatchEvent;

  return (
    <main className="min-h-screen bg-[#050507] p-4 text-white">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/dashboard/events" className="text-sm text-zinc-400 hover:text-white">Events</Link>
            <h1 className="mt-2 text-3xl font-bold">{typedEvent.title}</h1>
          </div>
          <Link href={`/events/${typedEvent.id}`} className={buttonVariants({ variant: "secondary" })}>
            Public sayfa
          </Link>
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <SyncedVideoPlayer initialEvent={typedEvent} isAdmin />
            <AdminPlaybackControls event={typedEvent} />

            <Card>
              <CardHeader><CardTitle>Event Bilgileri</CardTitle></CardHeader>
              <CardContent>
                <form action={updateEventAction} className="grid gap-4 lg:grid-cols-4">
                  <input type="hidden" name="event_id" value={typedEvent.id} />
                  <div className="space-y-2">
                    <Label htmlFor="title">Başlık</Label>
                    <Input id="title" name="title" defaultValue={typedEvent.title} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Durum</Label>
                    <select id="status" name="status" defaultValue={typedEvent.status} className="flex h-10 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none">
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live</option>
                      <option value="ended">Ended</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="starts_at">Başlangıç</Label>
                    <Input id="starts_at" name="starts_at" type="datetime-local" defaultValue={typedEvent.starts_at?.slice(0, 16) ?? ""} />
                  </div>
                  <div className="space-y-2 lg:col-span-4">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea id="description" name="description" defaultValue={typedEvent.description ?? ""} />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit">Kaydet</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Medya</CardTitle></CardHeader>
              <CardContent className="grid gap-3 lg:grid-cols-2">
                <EventMediaUploader eventId={typedEvent.id} kind="video" label="Video yükle (mp4/webm, max 1 GB)" accept="video/mp4,video/webm" />
                <EventMediaUploader eventId={typedEvent.id} kind="thumbnail" label="Thumbnail yükle" accept="image/png,image/jpeg,image/webp,image/gif" />
                {typedEvent.video_storage_key ? (
                  <form action={deleteEventVideoAction}>
                    <input type="hidden" name="event_id" value={typedEvent.id} />
                    <Button type="submit" variant="destructive">Videoyu R2’den sil</Button>
                  </form>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <EventChat
              eventId={typedEvent.id}
              initialMessages={(messages ?? []) as EventMessage[]}
              currentUserId={user.id}
              canModerate
            />
            <Card>
              <CardHeader><CardTitle>Duyuru Gönder</CardTitle></CardHeader>
              <CardContent>
                <form action={createAnnouncementAction} className="space-y-3">
                  <input type="hidden" name="event_id" value={typedEvent.id} />
                  <Input name="title" placeholder="Başlık" />
                  <Textarea name="content" placeholder="Duyuru metni" />
                  <Button type="submit">Gönder</Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Anket Oluştur</CardTitle></CardHeader>
              <CardContent>
                <form action={createPollAction} className="space-y-3">
                  <input type="hidden" name="event_id" value={typedEvent.id} />
                  <Input name="question" placeholder="Soru" />
                  <Input name="option_1" placeholder="Seçenek 1" />
                  <Input name="option_2" placeholder="Seçenek 2" />
                  <Input name="option_3" placeholder="Seçenek 3" />
                  <Input name="option_4" placeholder="Seçenek 4" />
                  <Button type="submit">Anket oluştur</Button>
                </form>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
