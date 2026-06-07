"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Send, Trash2 } from "lucide-react";
import { deleteMessageAction } from "@/app/dashboard/events/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { EventMessage } from "@/types/events";
import { ChatMessage } from "@/components/watch-party/ChatMessage";

const MESSAGE_SELECT =
  "*, profile:profiles!event_messages_user_profile_fkey(user_id, username, display_name, avatar_url, avatar_decoration_url, name_effect, role)";

export function EventChat({
  eventId,
  initialMessages,
  currentUserId,
  canModerate,
}: {
  eventId: string;
  initialMessages: EventMessage[];
  currentUserId?: string | null;
  canModerate: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<EventMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  useEffect(() => {
    const channel = supabase
      .channel(`event-chat:${eventId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "event_messages", filter: `event_id=eq.${eventId}` },
        async (payload) => {
          const { data } = await supabase
            .from("event_messages")
            .select(MESSAGE_SELECT)
            .eq("id", payload.new.id)
            .maybeSingle();
          if (data) {
            setMessages((current) => [...current.filter((message) => message.id !== data.id), data as EventMessage]);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "event_messages", filter: `event_id=eq.${eventId}` },
        (payload) => {
          if (payload.new.deleted_at) {
            setMessages((current) => current.filter((message) => message.id !== payload.new.id));
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  async function sendMessage() {
    setError(null);
    const message = text.replace(/<[^>]*>/g, "").trim();
    if (!currentUserId) {
      setError("Mesaj yazmak için giriş yapmalısın.");
      return;
    }
    if (!message || message.length > 500) {
      setError("Mesaj 1-500 karakter olmalı.");
      return;
    }

    const { error: insertError } = await supabase.from("event_messages").insert({
      event_id: eventId,
      user_id: currentUserId,
      message,
    });

    if (insertError) {
      const message = insertError.message.toLowerCase();
      if (message.includes("row-level security") || insertError.code === "42501") {
        setError("Mesaj gönderilemedi. Etkinlik live değil veya chat yetkin yok.");
        return;
      }

      if (message.includes("check constraint")) {
        setError("Mesaj boş, çok uzun veya HTML içeriyor.");
        return;
      }

      setError("Yavaşla: 3 saniyede 1 mesaj gönderebilirsin.");
      return;
    }

    setText("");
  }

  return (
    <section className="flex min-h-[520px] flex-col rounded-lg border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="font-semibold">Canlı Chat</h2>
        <p className="text-xs text-zinc-500">Mesajlar realtime güncellenir.</p>
      </div>
      <div ref={listRef} className="flex-1 space-y-1 overflow-y-auto p-3">
        {messages.length ? (
          messages.map((message) => (
            <div key={message.id} className="group relative">
              <ChatMessage message={message} profile={message.profile} />
              {(canModerate || message.user_id === currentUserId) ? (
                <form
                  action={(formData) => {
                    startTransition(() => {
                      void deleteMessageAction(formData);
                    });
                  }}
                  className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
                >
                  <input type="hidden" name="event_id" value={eventId} />
                  <input type="hidden" name="message_id" value={message.id} />
                  <Button type="submit" size="sm" variant="ghost">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </form>
              ) : null}
            </div>
          ))
        ) : (
          <p className="p-4 text-sm text-zinc-500">İlk mesajı sen yaz.</p>
        )}
      </div>
      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(event) => setText(event.target.value.slice(0, 500))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder={currentUserId ? "Mesaj yaz..." : "Giriş yapmalısın"}
            disabled={!currentUserId}
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
          />
          <Button type="button" onClick={() => void sendMessage()} disabled={!currentUserId}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      </div>
    </section>
  );
}
