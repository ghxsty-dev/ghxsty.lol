"use client";

import { useEffect, useMemo, useState } from "react";
import { closePollAction, votePollAction } from "@/app/dashboard/events/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { EventPoll } from "@/types/events";

async function loadPolls(supabase: ReturnType<typeof createClient>, eventId: string) {
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

export function EventPolls({
  eventId,
  initialPolls,
  canModerate,
}: {
  eventId: string;
  initialPolls: EventPoll[];
  canModerate: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [polls, setPolls] = useState(initialPolls);

  useEffect(() => {
    async function refresh() {
      setPolls(await loadPolls(supabase, eventId));
    }

    const channel = supabase
      .channel(`event-polls:${eventId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "event_polls", filter: `event_id=eq.${eventId}` }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "event_poll_votes" }, () => void refresh())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-3 font-semibold">Anketler</h2>
      <div className="space-y-3">
        {polls.length ? (
          polls.map((poll) => {
            const totalVotes = poll.options?.reduce((sum, option) => sum + (option.votes ?? 0), 0) ?? 0;
            return (
              <article key={poll.id} className="rounded-md border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold">{poll.question}</h3>
                  {!poll.is_active ? <span className="text-xs text-zinc-500">Kapalı</span> : null}
                </div>
                <div className="mt-3 space-y-2">
                  {poll.options?.map((option) => {
                    const percent = totalVotes ? Math.round(((option.votes ?? 0) / totalVotes) * 100) : 0;
                    return (
                      <form key={option.id} action={votePollAction}>
                        <input type="hidden" name="event_id" value={eventId} />
                        <input type="hidden" name="poll_id" value={poll.id} />
                        <input type="hidden" name="option_id" value={option.id} />
                        <button
                          type="submit"
                          disabled={!poll.is_active}
                          className="relative w-full overflow-hidden rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className="absolute inset-y-0 left-0 bg-white/10" style={{ width: `${percent}%` }} />
                          <span className="relative flex justify-between gap-3">
                            <span>{option.option_text}</span>
                            <span className="text-zinc-500">{percent}%</span>
                          </span>
                        </button>
                      </form>
                    );
                  })}
                </div>
                {canModerate && poll.is_active ? (
                  <form action={closePollAction} className="mt-3">
                    <input type="hidden" name="event_id" value={eventId} />
                    <input type="hidden" name="poll_id" value={poll.id} />
                    <Button type="submit" size="sm" variant="secondary">Anketi kapat</Button>
                  </form>
                ) : null}
              </article>
            );
          })
        ) : (
          <p className="text-sm text-zinc-500">Henüz anket yok.</p>
        )}
      </div>
    </section>
  );
}
