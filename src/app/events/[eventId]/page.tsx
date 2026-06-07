import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventAnnouncements } from "@/components/watch-party/EventAnnouncements";
import { EventChat } from "@/components/watch-party/EventChat";
import { EventLayout } from "@/components/watch-party/EventLayout";
import { EventPolls } from "@/components/watch-party/EventPoll";
import { EventStatusWatcher } from "@/components/watch-party/EventStatusWatcher";
import { SyncedVideoPlayer } from "@/components/watch-party/SyncedVideoPlayer";
import { isModeratorOrAdminRole } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import type { EventAnnouncement, EventMessage, EventPoll, WatchEvent } from "@/types/events";
import { Home } from "lucide-react";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("title,description").eq("id", eventId).maybeSingle();

  return {
    title: data?.title ? `${data.title} - Watch Party` : "Watch Party",
    description: data?.description ?? "ghxsty.lol Watch Party",
  };
}

async function loadPolls(eventId: string) {
  const supabase = await createClient();
  const [{ data: polls }, { data: votes }] = await Promise.all([
    supabase
      .from("event_polls")
      .select("*, options:event_poll_options(*)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
    supabase.from("event_poll_votes").select("poll_id, option_id"),
  ]);
  const voteCounts = new Map<string, number>();
  for (const vote of votes ?? []) {
    voteCounts.set(vote.option_id, (voteCounts.get(vote.option_id) ?? 0) + 1);
  }
  return ((polls ?? []) as EventPoll[]).map((poll) => ({
    ...poll,
    options: (poll.options ?? [])
      .map((option) => ({ ...option, votes: voteCounts.get(option.id) ?? 0 }))
      .sort((a, b) => a.position - b.position),
  }));
}

export default async function EventPage({ params }: PageProps) {
  const { eventId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: event }, { data: messages }, { data: announcements }, polls, { data: profile }] =
    await Promise.all([
      supabase.from("events").select("*").eq("id", eventId).maybeSingle(),
      supabase
        .from("event_messages")
        .select("*, profile:profiles!event_messages_user_profile_fkey(user_id, username, display_name, avatar_url, avatar_decoration_url, name_effect, role)")
        .eq("event_id", eventId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(200),
      supabase
        .from("event_announcements")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false }),
      loadPolls(eventId),
      user
        ? supabase.from("profiles").select("role,is_admin,username,display_name").eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (!event || event.status === "draft" || event.status === "deleted") {
    notFound();
  }

  if (event.status === "ended") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050507] p-4 text-white">
        <div className="max-w-lg rounded-lg border border-white/10 bg-white/[0.04] p-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Watch Party</p>
          <h1 className="mt-3 text-3xl font-bold">{event.title}</h1>
          <p className="mt-3 text-zinc-400">Etkinlik sona erdi.</p>
          <Link href="/events" className="mt-5 inline-flex rounded-md border border-white/10 px-4 py-2 text-sm hover:bg-white/10">
            Etkinliklere dön
          </Link>
          <Link href="/" className="ml-2 mt-5 inline-flex rounded-md border border-white/10 px-4 py-2 text-sm hover:bg-white/10">
            Ana menü
          </Link>
        </div>
      </main>
    );
  }

  const canModerate = isModeratorOrAdminRole(profile?.role) || profile?.is_admin === true;

  return (
    <main className="min-h-screen bg-[#050507] p-3 text-white sm:p-4">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">
        <EventStatusWatcher eventId={event.id} initialStatus={event.status} publicView />
        <header className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Watch Party</p>
            <h1 className="mt-2 text-2xl font-bold">{event.title}</h1>
            {event.description ? <p className="mt-2 text-sm text-zinc-400">{event.description}</p> : null}
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
          >
            <Home className="h-4 w-4" />
            Ana menü
          </Link>
        </header>
        <EventLayout
          player={<SyncedVideoPlayer initialEvent={event as WatchEvent} isAdmin={canModerate} />}
          chat={
            <EventChat
              eventId={event.id}
              initialMessages={(messages ?? []) as EventMessage[]}
              currentUserId={user?.id ?? null}
              currentDisplayName={profile?.display_name || profile?.username || null}
              canModerate={canModerate}
            />
          }
          side={
            <>
              <EventAnnouncements eventId={event.id} initialAnnouncements={(announcements ?? []) as EventAnnouncement[]} />
              <EventPolls eventId={event.id} initialPolls={polls} canModerate={canModerate} />
            </>
          }
        />
      </div>
    </main>
  );
}
